import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  // Orders already placed against this zone just lose the zoneId link
  // (onDelete: SetNull in schema.prisma) — the fee they paid is already
  // snapshotted on the Order itself, so deleting the zone doesn't change
  // what any past order shows.
  await prisma.shippingZone.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
