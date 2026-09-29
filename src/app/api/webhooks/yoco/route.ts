import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyYocoWebhookSignature } from "@/lib/yoco";

// The webhook is the only trustworthy source for "was this actually
// paid" — the successUrl redirect alone can be skipped, replayed, or
// hit without a real payment behind it, so the confirmation page
// (src/app/orders/[id]/page.tsx) never marks an order paid itself.
//
// Yoco's exact webhook payload shape wasn't something this integration
// could fully confirm from their docs at build time (their docs page is
// JS-rendered and only partially inspectable), so past the signature
// check — which *is* fully verified against their published spec — this
// reads defensively: it looks for an order id under a few plausible
// field paths, and keys off whether the event `type` string contains
// "succeeded"/"failed" rather than an exact enum match. An unrecognized
// shape is ignored (200 OK, no-op) rather than treated as an error, so a
// Yoco event type this wasn't written for doesn't cause retry storms.
export async function POST(req: NextRequest) {
  const secret = process.env.YOCO_WEBHOOK_SECRET;
  if (!secret) {
    console.error("YOCO_WEBHOOK_SECRET is not set — rejecting webhook.");
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  const webhookId = req.headers.get("webhook-id");
  const timestamp = req.headers.get("webhook-timestamp");
  const signature = req.headers.get("webhook-signature");
  const rawBody = await req.text();

  if (!webhookId || !timestamp || !signature) {
    return NextResponse.json({ error: "Missing signature headers." }, { status: 400 });
  }

  const valid = verifyYocoWebhookSignature({ webhookId, timestamp, rawBody, signatureHeader: signature, secret });
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const type = String(event?.type ?? "").toLowerCase();
  const payload = event?.payload ?? event;

  const orderId: string | undefined =
    payload?.metadata?.orderId ?? payload?.clientReferenceId ?? event?.metadata?.orderId ?? event?.clientReferenceId;
  const checkoutId: string | undefined = payload?.checkoutId ?? payload?.id;
  const paymentId: string | undefined = payload?.paymentId ?? (payload?.type === "payment" ? payload?.id : undefined);

  const order = orderId
    ? await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } })
    : checkoutId
      ? await prisma.order.findUnique({ where: { yocoCheckoutId: checkoutId }, include: { items: true } })
      : null;

  if (!order) {
    // Not one of ours, or we couldn't find the id in this event shape —
    // acknowledge anyway so Yoco doesn't keep retrying.
    return NextResponse.json({ ok: true });
  }

  // Idempotent — a retried webhook for an already-settled order is a no-op.
  if (order.status !== "PENDING") {
    return NextResponse.json({ ok: true });
  }

  if (type.includes("succeed") || type.includes("completed")) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID", yocoPaymentId: paymentId ?? order.yocoPaymentId },
    });
    // Only now — payment actually confirmed — clear the items that were
    // part of this order out of the customer's cart. Scoped to exactly
    // those product ids, not a blanket "empty the whole cart", in case
    // they added something new to the cart while this checkout was in
    // flight (e.g. a second tab).
    await prisma.cartItem.deleteMany({
      where: { userId: order.customerId, productId: { in: order.items.map((i) => i.productId).filter((id): id is string => id != null) } },
    });
  } else if (type.includes("fail")) {
    await prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
  }

  return NextResponse.json({ ok: true });
}
