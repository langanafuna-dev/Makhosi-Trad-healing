import { NextRequest, NextResponse } from "next/server";

/**
 * STUB — not wired up. This is where the WhatsApp Business Platform
 * (Cloud API) would deliver incoming messages once configured in Meta's
 * developer console, and where the verification handshake happens.
 *
 * To make this real:
 * 1. Create a Meta app + WhatsApp Business Platform product, get a
 *    phone number ID and access token (see .env.example).
 * 2. Set this route's URL as the webhook in Meta's console, with
 *    WHATSAPP_WEBHOOK_VERIFY_TOKEN matching the GET handler below.
 * 3. Add a Message model to prisma/schema.prisma (clientId, direction,
 *    body, createdAt) and write incoming messages to it in POST below.
 * 4. Have src/app/chat/[clientId]/page.tsx read from that table instead
 *    of its hardcoded placeholder array.
 * 5. To SEND messages from the practitioner dashboard, call the Cloud
 *    API's /messages endpoint with WHATSAPP_ACCESS_TOKEN from a server
 *    action or a new API route.
 */

export async function GET(req: NextRequest) {
  // Meta's webhook verification handshake.
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  const payload = await req.json().catch(() => null);
  // TODO: parse payload.entry[].changes[].value.messages[] and persist
  // each one against the matching Client, once that model exists.
  console.log("WhatsApp webhook received (not yet processed):", payload);
  return NextResponse.json({ ok: true });
}
