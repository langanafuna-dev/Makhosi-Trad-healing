import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, requireAdmin } from "@/lib/auth";

// Public by default — anyone browsing the site sees approved testimonials,
// no sign-in required. `?scope=pending` is the admin moderation queue
// instead (unapproved ones never appear in the public list).
export async function GET(req: NextRequest) {
  const branch = req.nextUrl.searchParams.get("branch"); // JOURNEY_HOME | HERBAL_HOLISTIC | null (both)
  const scope = req.nextUrl.searchParams.get("scope");

  if (scope === "pending") {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Admins only." }, { status: 403 });

    const pending = await prisma.testimonial.findMany({
      where: { isApproved: false },
      orderBy: { createdAt: "asc" },
      include: { author: { select: { name: true } } },
    });
    return NextResponse.json({ testimonials: pending });
  }

  const testimonials = await prisma.testimonial.findMany({
    where: { isApproved: true, ...(branch ? { branch } : {}) },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return NextResponse.json({ testimonials });
}

// Any signed-in customer can share a story — it just doesn't show up
// publicly until the founder approves it.
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in to share your story." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const testimonialBody = typeof body?.body === "string" ? body.body.trim() : "";
  const branch = body?.branch === "HERBAL_HOLISTIC" ? "HERBAL_HOLISTIC" : "JOURNEY_HOME";

  if (!testimonialBody) {
    return NextResponse.json({ error: "Say a little about your experience first." }, { status: 400 });
  }
  if (testimonialBody.length > 1000) {
    return NextResponse.json({ error: "Keep it under 1000 characters." }, { status: 400 });
  }

  const testimonial = await prisma.testimonial.create({
    data: { body: testimonialBody, branch, authorId: user.id },
  });

  return NextResponse.json({ testimonial }, { status: 201 });
}
