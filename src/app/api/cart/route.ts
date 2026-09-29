import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to see your cart." }, { status: 401 });

  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    include: { product: true },
  });

  return NextResponse.json({ items });
}

// Adds a product to the cart, or increments quantity if it's already there.
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to add items to your cart." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const productId = typeof body?.productId === "string" ? body.productId : "";
  const quantity = Number.isFinite(body?.quantity) && body.quantity > 0 ? Math.floor(body.quantity) : 1;
  if (!productId) return NextResponse.json({ error: "productId is required." }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.priceCents == null) {
    return NextResponse.json({ error: "That product isn't available for online purchase." }, { status: 400 });
  }

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });

  const item = existing
    ? await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      })
    : await prisma.cartItem.create({ data: { userId: user.id, productId, quantity } });

  return NextResponse.json({ item }, { status: 201 });
}
