import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import ProductManager from "@/components/ProductManager";
import TestimonialWall from "@/components/TestimonialWall";
import Reveal from "@/components/Reveal";
import WaveDivider from "@/components/WaveDivider";
import type { Product } from "@prisma/client";

export const dynamic = "force-dynamic"; // always read the current product list

export default async function HerbalHolisticPage() {
  const [products, user] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "asc" } }),
    getSessionUser(),
  ]);

  const herbal = products.filter((p: Product) => p.category === "HERBAL");
  const holistic = products.filter((p: Product) => p.category === "HOLISTIC");
  const isAdmin = user?.role === "ADMIN";

  const favorites = user
    ? await prisma.favorite.findMany({ where: { userId: user.id }, select: { productId: true } })
    : [];

  return (
    <div style={{ width: "100%", background: "#f4f1e4" }}>
      <Reveal>
        <div style={{ padding: "90px 6vw 20px", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
            <div style={{ fontSize: 13, letterSpacing: ".24em", textTransform: "uppercase", color: "#3e5541", fontWeight: 600 }}>
              Branch Two
            </div>
            <h2 className="mk-serif" style={{ fontSize: "clamp(28px,4vw,42px)", color: "#26372a", fontWeight: 600, maxWidth: 700 }}>
              Makosi Herbal &amp; Holistic Products
            </h2>
            <p style={{ maxWidth: 640, fontSize: 16.5, lineHeight: 1.8, color: "#4a5a4d" }}>
              The same knowledge that guides Journey Home Healing, carried into the body: herbal
              remedies and holistic wellness products prepared the traditional way.
            </p>
            {user && (
              <a href="/favorites" className="mk-nav-link" style={{ fontSize: 13.5, fontWeight: 600, color: "#7a3e20" }}>
                ❤️ View My Favorites
              </a>
            )}
          </div>
        </div>
      </Reveal>

      <ProductManager
        initialHerbal={herbal}
        initialHolistic={holistic}
        isAdmin={isAdmin}
        isSignedIn={!!user}
        initialFavoriteIds={favorites.map((f) => f.productId)}
      />

      <Reveal>
        <div style={{ padding: "40px 6vw 90px", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 640, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" }}>
            <p style={{ fontSize: 15.5, lineHeight: 1.7, color: "#4a5a4d" }}>
              Every remedy is prepared by hand, the same way it has always been.
            </p>
            <a
              href="mailto:[CONTACT EMAIL]"
              className="mk-button secondary"
            >
              Inquire About Our Products
            </a>
          </div>
        </div>
      </Reveal>
      <WaveDivider fill="#fffdf7" />

      {/* TESTIMONIALS */}
      <div style={{ padding: "10px 6vw 90px", display: "flex", justifyContent: "center", background: "#fffdf7" }}>
        <Reveal>
          <div style={{ width: "100%", maxWidth: 1080, display: "flex", flexDirection: "column", gap: 30 }}>
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 13, letterSpacing: ".24em", textTransform: "uppercase", color: "#3e5541", fontWeight: 600 }}>
                In Their Words
              </div>
              <h2 className="mk-serif" style={{ fontSize: "clamp(24px,3vw,32px)", color: "#26372a", fontWeight: 600 }}>
                What customers are saying
              </h2>
            </div>
            <TestimonialWall branch="HERBAL_HOLISTIC" isSignedIn={!!user} />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
