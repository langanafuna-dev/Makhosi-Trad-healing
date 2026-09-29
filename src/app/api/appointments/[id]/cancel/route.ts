import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

// The customer who booked it, or the founder, can cancel — reopening the
// slot for someone else rather than deleting it.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const appointment = await prisma.appointment.findUnique({ where: { id: params.id } });
  if (!appointment || appointment.status !== "BOOKED") {
    return NextResponse.json({ error: "That booking isn't there anymore." }, { status: 404 });
  }
  if (appointment.customerId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "You can only cancel your own booking." }, { status: 403 });
  }

  const updated = await prisma.appointment.update({
    where: { id: params.id },
    data: { status: "OPEN", customerId: null, note: "" },
  });

  return NextResponse.json({ appointment: updated });
}
