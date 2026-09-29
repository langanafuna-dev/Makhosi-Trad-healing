import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// Removes an unused OPEN slot. A BOOKED one isn't deletable here — cancel
// it first (src/app/api/appointments/[id]/cancel/route.ts) so the
// customer who booked it isn't left with a silently vanished appointment.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  await prisma.appointment.deleteMany({ where: { id: params.id, status: "OPEN" } });
  return NextResponse.json({ ok: true });
}
