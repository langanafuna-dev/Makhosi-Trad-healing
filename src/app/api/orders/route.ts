import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, requireAdmin } from "@/lib/auth";
import { createYocoCheckout } from "@/lib/yoco";

// `?scope=admin` — every order, for the dashboard's fulfillment view.
// Otherwise, the signed-in customer's own order history.
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to see orders." }, { status: 401 });

  if (req.nextUrl.searchParams.get("scope") === "admin") {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Admins only." }, { status: 403 });

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true, zone: true, customer: { select: { name: true } } },
    });
    return NextResponse.json({ orders });
  }

  const orders = await prisma.order.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true, zone: true },
  });
  return NextResponse.json({ orders });
}

// Turns the signed-in customer's cart into an Order and a Yoco hosted
// checkout session. Every price used here comes from the database, never
// from the request body — the browser only ever supplies which zone and
// where to ship, not what anything costs.
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to check out." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const zoneId = typeof body?.zoneId === "string" ? body.zoneId : "";
  const shipping = {
    name: typeof body?.shippingName === "string" ? body.shippingName.trim() : "",
    phone: typeof body?.shippingPhone === "string" ? body.shippingPhone.trim() : "",
    addressLine1: typeof body?.shippingAddressLine1 === "string" ? body.shippingAddressLine1.trim() : "",
    addressLine2: typeof body?.shippingAddressLine2 === "string" ? body.shippingAddressLine2.trim() : "",
    city: typeof body?.shippingCity === "string" ? body.shippingCity.trim() : "",
    province: typeof body?.shippingProvince === "string" ? body.shippingProvince.trim() : "",
    postalCode: typeof body?.shippingPostalCode === "string" ? body.shippingPostalCode.trim() : "",
  };

  if (!shipping.name || !shipping.phone || !shipping.addressLine1 || !shipping.city || !shipping.province || !shipping.postalCode) {
    return NextResponse.json({ error: "Fill in your name, phone, and full delivery address." }, { status: 400 });
  }

  const zone = zoneId ? await prisma.shippingZone.findUnique({ where: { id: zoneId } }) : null;
  if (!zone) return NextResponse.json({ error: "Choose a delivery zone." }, { status: 400 });

  const cartItems = await prisma.cartItem.findMany({ where: { userId: user.id }, include: { product: true } });
  const purchasable = cartItems.filter((item) => item.product.priceCents != null);
  if (purchasable.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const subtotalCents = purchasable.reduce((sum, item) => sum + item.product.priceCents! * item.quantity, 0);
  const totalCents = subtotalCents + zone.feeCents;

  const order = await prisma.order.create({
    data: {
      customerId: user.id,
      zoneId: zone.id,
      subtotalCents,
      shippingFeeCents: zone.feeCents,
      totalCents,
      shippingName: shipping.name,
      shippingPhone: shipping.phone,
      shippingAddressLine1: shipping.addressLine1,
      shippingAddressLine2: shipping.addressLine2,
      shippingCity: shipping.city,
      shippingProvince: shipping.province,
      shippingPostalCode: shipping.postalCode,
      items: {
        create: purchasable.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          unitPriceCents: item.product.priceCents!,
          quantity: item.quantity,
        })),
      },
    },
  });

  try {
    const checkout = await createYocoCheckout({
      amountCents: totalCents,
      orderId: order.id,
      origin: req.nextUrl.origin,
      lineItems: [
        ...purchasable.map((item) => ({
          displayName: item.product.name,
          quantity: item.quantity,
          unitPriceCents: item.product.priceCents!,
        })),
        { displayName: `Shipping — ${zone.name}`, quantity: 1, unitPriceCents: zone.feeCents },
      ],
    });

    await prisma.order.update({ where: { id: order.id }, data: { yocoCheckoutId: checkout.id } });
    // The cart is deliberately NOT cleared here — the customer hasn't
    // actually paid yet at this point, just started a checkout session.
    // A declined card or an abandoned Yoco page should leave the cart
    // exactly as it was so they can just retry. It's cleared by the
    // webhook handler instead, only once the payment actually succeeds.

    return NextResponse.json({ redirectUrl: checkout.redirectUrl, orderId: order.id });
  } catch (err) {
    await prisma.order.delete({ where: { id: order.id } }).catch(() => null);
    console.error("Yoco checkout creation failed:", err);
    return NextResponse.json(
      { error: "Couldn't start checkout — please try again in a moment." },
      { status: 502 }
    );
  }
}
