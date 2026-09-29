import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// Approve a submitted story so it appears publicly.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const testimonial = await prisma.testimonial
    .update({ where: { id: params.id }, data: { isApproved: true } })
    .catch(() => null);
  if (!testimonial) return NextResponse.json({ error: "Not found." }, { status: 404 });

  return NextResponse.json({ testimonial });
}

// Reject/remove a story — works on pending or already-approved ones.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  await prisma.testimonial.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
