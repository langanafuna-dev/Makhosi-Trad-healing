"use client";

import { useState } from "react";
import { useToast } from "./Toast";

type FavoriteProduct = {
  productId: string;
  name: string;
  category: string;
  description: string;
  price: string;
  imageUrl: string | null;
};

export default function FavoritesGrid({ initialFavorites }: { initialFavorites: FavoriteProduct[] }) {
  const [favorites, setFavorites] = useState(initialFavorites);
  const { show } = useToast();

  async function handleRemove(productId: string) {
    setFavorites((list) => list.filter((f) => f.productId !== productId));
    await fetch(`/api/favorites/${productId}`, { method: "DELETE" });
    show("Removed from favorites");
  }

  if (favorites.length === 0) {
    return (
      <div className="mk-card" style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 14, maxWidth: 480, margin: "0 auto" }}>
        <p style={{ fontSize: 15, color: "#4a5a4d" }}>Nothing saved yet.</p>
        <a href="/herbal-holistic" className="mk-button" style={{ alignSelf: "center" }}>
          Browse Products
        </a>
      </div>
    );
  }

  return (
    <div className="mk-grid-3">
      {favorites.map((p) => (
        <div key={p.productId} className="mk-card mk-card-hover mk-pop-in" style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left", padding: p.imageUrl ? 0 : "22px 20px", overflow: "hidden" }}>
          {p.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URL, not a build-time asset
            <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: 160, objectFit: "cover" }} />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: p.imageUrl ? "14px 16px 18px" : 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
              <h4 style={{ fontSize: 15.5, color: "#26372a", fontWeight: 600 }}>{p.name}</h4>
              {p.price && (
                <span style={{ fontSize: 13, color: "#7a3e20", fontWeight: 600, whiteSpace: "nowrap" }}>{p.price}</span>
              )}
            </div>
            {p.description && <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#4a5a4d" }}>{p.description}</p>}
            <button
              onClick={() => handleRemove(p.productId)}
              className="mk-heart"
              style={{ alignSelf: "flex-start", fontSize: 13 }}
              aria-label="Remove from favorites"
            >
              ❤️ Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
