import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// Anyone can browse the product list (it's a storefront) — no auth
// required on GET.
export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ products });
}

// Only the founder's admin account can add products — enforced here,
// not just hidden in the UI.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Sign in as an admin to add products." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const category = body?.category === "HOLISTIC" ? "HOLISTIC" : "HERBAL";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const price = typeof body?.price === "string" ? body.price.trim() : "";
  // Set by ProductManager.tsx after it uploads the file straight to Supabase
  // Storage from the browser — this route never touches the image bytes.
  const imageUrl = typeof body?.imageUrl === "string" && body.imageUrl.trim() ? body.imageUrl.trim() : null;
  // Rands in, cents stored — this is what actually makes the product
  // purchasable online; leave it out and it's browse/inquiry only.
  const priceRand = Number(body?.priceRand);
  const priceCents = Number.isFinite(priceRand) && priceRand > 0 ? Math.round(priceRand * 100) : null;

  if (!name) {
    return NextResponse.json({ error: "Give the product a name." }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: { name, category, description, price, imageUrl, priceCents },
  });

  return NextResponse.json({ product }, { status: 201 });
}
