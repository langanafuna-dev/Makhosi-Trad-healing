import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// Sets the exact quantity for a cart line (used by the +/- steppers on
// /cart). A quantity of 0 or less removes it, same as DELETE below.
export async function PATCH(req: NextRequest, { params }: { params: { productId: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to manage your cart." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const quantity = Number.isFinite(body?.quantity) ? Math.floor(body.quantity) : null;
  if (quantity === null) return NextResponse.json({ error: "quantity is required." }, { status: 400 });

  if (quantity <= 0) {
    await prisma.cartItem
      .delete({ where: { userId_productId: { userId: user.id, productId: params.productId } } })
      .catch(() => null);
    return NextResponse.json({ ok: true });
  }

  const item = await prisma.cartItem
    .update({
      where: { userId_productId: { userId: user.id, productId: params.productId } },
      data: { quantity },
    })
    .catch(() => null);
  if (!item) return NextResponse.json({ error: "That item isn't in your cart." }, { status: 404 });

  return NextResponse.json({ item });
}

export async function DELETE(_req: Request, { params }: { params: { productId: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to manage your cart." }, { status: 401 });

  await prisma.cartItem
    .delete({ where: { userId_productId: { userId: user.id, productId: params.productId } } })
    .catch(() => null);

  return NextResponse.json({ ok: true });
}
