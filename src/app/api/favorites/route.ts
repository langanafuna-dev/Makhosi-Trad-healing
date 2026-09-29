import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// Any signed-in customer's wishlist — not admin-only, unlike most of the
// other API routes here.
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to see your favorites." }, { status: 401 });

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    select: { productId: true },
  });
  return NextResponse.json({ productIds: favorites.map((f) => f.productId) });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to save favorites." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const productId = typeof body?.productId === "string" ? body.productId : "";
  if (!productId) return NextResponse.json({ error: "productId is required." }, { status: 400 });

  // Idempotent — favoriting something already saved is a no-op, not an error.
  await prisma.favorite.upsert({
    where: { userId_productId: { userId: user.id, productId } },
    update: {},
    create: { userId: user.id, productId },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
