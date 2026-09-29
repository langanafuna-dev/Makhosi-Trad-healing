import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import FavoritesGrid from "@/components/FavoritesGrid";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { product: true },
  });

  return (
    <div style={{ width: "100%", background: "#fffdf7", minHeight: "calc(100vh - 66px)" }}>
      <div style={{ padding: "50px 6vw", display: "flex", flexDirection: "column", gap: 30 }}>
        <Reveal>
          <div>
            <div style={{ fontSize: 13, letterSpacing: ".2em", textTransform: "uppercase", color: "#7a3e20", fontWeight: 600 }}>
              Your Wishlist
            </div>
            <h1 className="mk-serif" style={{ fontSize: 30, color: "#26372a", fontWeight: 600, marginTop: 6 }}>
              My Favorites
            </h1>
          </div>
        </Reveal>

        <FavoritesGrid
          initialFavorites={favorites.map((f) => ({
            productId: f.product.id,
            name: f.product.name,
            category: f.product.category,
            description: f.product.description,
            price: f.product.price,
            imageUrl: f.product.imageUrl,
          }))}
        />
      </div>
    </div>
  );
}
