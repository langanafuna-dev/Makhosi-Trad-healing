import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const clientId = req.nextUrl.searchParams.get("clientId");
  if (!clientId) {
    return NextResponse.json({ error: "clientId is required." }, { status: 400 });
  }

  const notes = await prisma.note.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });
  return NextResponse.json({ notes });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const body = await req.json().catch(() => null);
  const clientId = typeof body?.clientId === "string" ? body.clientId : "";
  const noteBody = typeof body?.body === "string" ? body.body.trim() : "";

  if (!clientId || !noteBody) {
    return NextResponse.json({ error: "clientId and body are required." }, { status: 400 });
  }

  const note = await prisma.note.create({
    data: { clientId, body: noteBody, authorId: admin.id },
    include: { author: { select: { name: true } } },
  });

  return NextResponse.json({ note }, { status: 201 });
}
