import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to book a session." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 500) : "";

  // The where clause requires status: "OPEN", so two people racing for the
  // same slot can't both succeed — whoever's update lands first wins it.
  const result = await prisma.appointment.updateMany({
    where: { id: params.id, status: "OPEN" },
    data: { status: "BOOKED", customerId: user.id, note },
  });

  if (result.count === 0) {
    return NextResponse.json(
      { error: "That slot was just taken — please pick another." },
      { status: 409 }
    );
  }

  const appointment = await prisma.appointment.findUnique({ where: { id: params.id } });
  return NextResponse.json({ appointment });
}
