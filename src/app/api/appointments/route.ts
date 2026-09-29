import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, requireAdmin } from "@/lib/auth";

// One call gives the booking page everything it needs: the open slots
// anyone can book, and this signed-in user's own upcoming bookings.
// `?scope=admin` is the practitioner dashboard's view instead — every
// booked session, with who booked it, not just this admin's own.
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to see appointments." }, { status: 401 });

  if (req.nextUrl.searchParams.get("scope") === "admin") {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Admins only." }, { status: 403 });

    const [open, booked] = await Promise.all([
      prisma.appointment.findMany({
        where: { status: "OPEN", startsAt: { gt: new Date() } },
        orderBy: { startsAt: "asc" },
      }),
      prisma.appointment.findMany({
        where: { status: "BOOKED" },
        orderBy: { startsAt: "asc" },
        include: { customer: { select: { name: true } } },
      }),
    ]);
    return NextResponse.json({ open, booked });
  }

  const [open, mine] = await Promise.all([
    prisma.appointment.findMany({
      where: { status: "OPEN", startsAt: { gt: new Date() } },
      orderBy: { startsAt: "asc" },
    }),
    prisma.appointment.findMany({
      where: { customerId: user.id },
      orderBy: { startsAt: "asc" },
    }),
  ]);

  return NextResponse.json({ open, mine });
}

// Only the founder opens new consultation slots.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const body = await req.json().catch(() => null);
  const startsAt = typeof body?.startsAt === "string" ? new Date(body.startsAt) : null;
  const durationMinutes = Number.isFinite(body?.durationMinutes) ? Number(body.durationMinutes) : 45;

  if (!startsAt || Number.isNaN(startsAt.getTime())) {
    return NextResponse.json({ error: "A valid date/time is required." }, { status: 400 });
  }
  if (startsAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "Pick a time in the future." }, { status: 400 });
  }

  const appointment = await prisma.appointment.create({
    data: { startsAt, durationMinutes },
  });

  return NextResponse.json({ appointment }, { status: 201 });
}
