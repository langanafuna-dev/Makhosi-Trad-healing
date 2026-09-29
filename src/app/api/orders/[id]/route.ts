import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, requireAdmin } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to see this order." }, { status: 401 });

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, zone: true },
  });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.customerId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "That's not your order." }, { status: 403 });
  }

  return NextResponse.json({ order });
}

// Admin marks an order shipped once it's physically on its way.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (body?.fulfillment !== "SHIPPED" && body?.fulfillment !== "UNFULFILLED") {
    return NextResponse.json({ error: "Invalid fulfillment status." }, { status: 400 });
  }

  const order = await prisma.order
    .update({ where: { id: params.id }, data: { fulfillment: body.fulfillment } })
    .catch(() => null);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  return NextResponse.json({ order });
}
