import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// Public — the checkout page needs this list to let the customer pick a
// zone, no sign-in required to view pricing.
export async function GET() {
  const zones = await prisma.shippingZone.findMany({ orderBy: { feeCents: "asc" } });
  return NextResponse.json({ zones });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const feeRand = Number(body?.feeRand);

  if (!name) return NextResponse.json({ error: "Give the zone a name." }, { status: 400 });
  if (!Number.isFinite(feeRand) || feeRand < 0) {
    return NextResponse.json({ error: "Enter a valid fee in Rands." }, { status: 400 });
  }

  const zone = await prisma.shippingZone.create({
    data: { name, description, feeCents: Math.round(feeRand * 100) },
  });

  return NextResponse.json({ zone }, { status: 201 });
}
