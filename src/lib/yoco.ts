import crypto from "crypto";

const YOCO_API_BASE = "https://payments.yoco.com/api";

type CreateCheckoutInput = {
  amountCents: number;
  orderId: string;
  origin: string; // request origin, used to build absolute redirect URLs
  lineItems: { displayName: string; quantity: number; unitPriceCents: number }[];
};

type YocoCheckout = {
  id: string;
  status: "created" | "started" | "processing" | "completed";
  redirectUrl: string;
  amount: number;
  currency: string;
};

/** Creates a Yoco hosted checkout session for one Order and returns the
 * page to redirect the customer to. See README "Selling products online"
 * for where this endpoint/shape was verified against Yoco's docs. */
export async function createYocoCheckout({
  amountCents,
  orderId,
  origin,
  lineItems,
}: CreateCheckoutInput): Promise<YocoCheckout> {
  const secretKey = process.env.YOCO_SECRET_KEY;
  if (!secretKey) throw new Error("YOCO_SECRET_KEY is not set.");

  const res = await fetch(`${YOCO_API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountCents,
      currency: "ZAR",
      // Both set to the same value on purpose — Yoco's docs confirm
      // metadata and clientReferenceId round-trip on the checkout object;
      // setting both means the webhook handler doesn't have to guess
      // which one actually comes back on a given event.
      clientReferenceId: orderId,
      metadata: { orderId },
      successUrl: `${origin}/orders/${orderId}`,
      cancelUrl: `${origin}/cart?checkout=cancelled`,
      failureUrl: `${origin}/checkout?error=payment_failed`,
      lineItems: lineItems.map((item) => ({
        displayName: item.displayName,
        quantity: item.quantity,
        pricingDetails: { price: item.unitPriceCents },
      })),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Yoco checkout creation failed (${res.status}): ${body}`);
  }

  return res.json();
}

/** Verifies a Yoco webhook using the Standard Webhooks HMAC-SHA256 scheme
 * their docs specify: sign `${id}.${timestamp}.${rawBody}` with the
 * base64-decoded secret (after stripping "whsec_"), base64-encode the
 * result, and compare against the "v1,<sig>" value(s) in the signature
 * header. Must run on the raw request body — re-serializing the parsed
 * JSON produces a different signature. */
export function verifyYocoWebhookSignature({
  webhookId,
  timestamp,
  rawBody,
  signatureHeader,
  secret,
}: {
  webhookId: string;
  timestamp: string;
  rawBody: string;
  signatureHeader: string;
  secret: string;
}): boolean {
  // Reject replays of an old, previously-valid signature.
  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) return false;
  if (Math.abs(Date.now() / 1000 - timestampSeconds) > 5 * 60) return false;

  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const signedContent = `${webhookId}.${timestamp}.${rawBody}`;
  const expected = crypto.createHmac("sha256", secretBytes).update(signedContent).digest("base64");
  const expectedBuf = Buffer.from(expected);

  // The header can hold multiple space-separated "v1,<sig>" values (key
  // rotation) — a match on any of them is valid.
  return signatureHeader.split(" ").some((token) => {
    const sig = token.startsWith("v1,") ? token.slice(3) : token;
    const sigBuf = Buffer.from(sig);
    return sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf);
  });
}
