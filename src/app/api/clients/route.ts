import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const clients = await prisma.client.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ clients });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const focus = typeof body?.focus === "string" ? body.focus.trim() : "";

  if (!name) return NextResponse.json({ error: "Give the client a name." }, { status: 400 });

  const client = await prisma.client.create({ data: { name, focus } });
  return NextResponse.json({ client }, { status: 201 });
}
