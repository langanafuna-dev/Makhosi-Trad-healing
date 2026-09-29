import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Sign in as an admin to remove products." }, { status: 403 });
  }

  await prisma.product.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
