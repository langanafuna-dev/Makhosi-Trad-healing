import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function DELETE(_req: Request, { params }: { params: { productId: string } }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to manage favorites." }, { status: 401 });

  await prisma.favorite
    .delete({ where: { userId_productId: { userId: user.id, productId: params.productId } } })
    .catch(() => null); // already removed — treat as success either way

  return NextResponse.json({ ok: true });
}
