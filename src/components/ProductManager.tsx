"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import FormMessage from "./FormMessage";
import { useToast } from "./Toast";

type Product = {
  id: string;
  name: string;
  category: string; // HERBAL | HOLISTIC — see prisma/schema.prisma for why this isn't a literal union
  description: string;
  price: string;
  priceCents?: number | null; // set => purchasable online; null => label-only ("Contact for price")
  imageUrl?: string | null;
};

function formatRand(cents: number) {
  return `R${(cents / 100).toFixed(2)}`;
}

function ProductGrid({
  title,
  products,
  isAdmin,
  isSignedIn,
  favoriteIds,
  onDelete,
  onToggleFavorite,
  onAddToCart,
  emptyLabel,
}: {
  title: string;
  products: Product[];
  isAdmin: boolean;
  isSignedIn: boolean;
  favoriteIds: Set<string>;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onAddToCart: (id: string) => void;
  emptyLabel: string;
}) {
  return (
    <div style={{ padding: "10px 6vw 10px", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 1080, display: "flex", flexDirection: "column", gap: 18 }}>
        <h3 className="mk-serif" style={{ fontSize: 20, color: "#26372a", fontWeight: 600, textAlign: "left" }}>
          {title}
        </h3>

        {products.length === 0 ? (
          <p style={{ fontSize: 14, color: "#8a9a8d", fontStyle: "italic" }}>{emptyLabel}</p>
        ) : (
          <div className="mk-grid-3">
            {products.map((p) => (
              <div key={p.id} className="mk-card mk-card-hover" style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left", padding: p.imageUrl ? 0 : "22px 20px", overflow: "hidden" }}>
                {p.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- product photos are user-uploaded to Supabase Storage, not build-time assets
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    style={{ width: "100%", height: 160, objectFit: "cover" }}
                  />
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: p.imageUrl ? "14px 16px 18px" : 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                    <h4 style={{ fontSize: 15.5, color: "#26372a", fontWeight: 600 }}>{p.name}</h4>
                    {p.priceCents != null ? (
                      <span style={{ fontSize: 14, color: "#7a3e20", fontWeight: 700, whiteSpace: "nowrap" }}>
                        {formatRand(p.priceCents)}
                      </span>
                    ) : (
                      p.price && (
                        <span style={{ fontSize: 13, color: "#7a3e20", fontWeight: 600, whiteSpace: "nowrap" }}>
                          {p.price}
                        </span>
                      )
                    )}
                  </div>
                  {p.description && (
                    <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#4a5a4d" }}>{p.description}</p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4, gap: 10 }}>
                    {isAdmin ? (
                      <button
                        onClick={() => onDelete(p.id)}
                        style={{ background: "none", border: "none", padding: 0, fontSize: 12, color: "#b23a2e", fontWeight: 600 }}
                      >
                        Remove
                      </button>
                    ) : p.priceCents != null && isSignedIn ? (
                      <button
                        onClick={() => onAddToCart(p.id)}
                        className="mk-button"
                        style={{ padding: "7px 14px", fontSize: 12.5 }}
                      >
                        Add to Cart
                      </button>
                    ) : p.priceCents != null ? (
                      <a href="/login" style={{ fontSize: 12.5, fontWeight: 600, color: "#7a3e20" }}>
                        Sign in to buy
                      </a>
                    ) : (
                      <span />
                    )}
                    {isSignedIn && (
                      <button
                        key={favoriteIds.has(p.id) ? "on" : "off"}
                        onClick={() => onToggleFavorite(p.id)}
                        className="mk-heart mk-heart-burst"
                        aria-label={favoriteIds.has(p.id) ? "Remove from favorites" : "Save to favorites"}
                        title={favoriteIds.has(p.id) ? "Remove from favorites" : "Save to favorites"}
                      >
                        {favoriteIds.has(p.id) ? "❤️" : "🤍"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductManager({
  initialHerbal,
  initialHolistic,
  isAdmin,
  isSignedIn,
  initialFavoriteIds,
}: {
  initialHerbal: Product[];
  initialHolistic: Product[];
  isAdmin: boolean;
  isSignedIn: boolean;
  initialFavoriteIds: string[];
}) {
  const [herbal, setHerbal] = useState(initialHerbal);
  const [holistic, setHolistic] = useState(initialHolistic);
  const [favoriteIds, setFavoriteIds] = useState(new Set(initialFavoriteIds));
  const [form, setForm] = useState({
    name: "",
    category: "HERBAL" as "HERBAL" | "HOLISTIC",
    description: "",
    price: "",
    priceRand: "",
    imageUrl: "",
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { show } = useToast();

  async function handleDelete(id: string) {
    setHerbal((list) => list.filter((p) => p.id !== id));
    setHolistic((list) => list.filter((p) => p.id !== id));
    await fetch(`/api/products/${id}`, { method: "DELETE" });
  }

  async function handleAddToCart(id: string) {
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id, quantity: 1 }),
    });
    show("🛒 Added to cart");
  }

  async function handleToggleFavorite(id: string) {
    const wasFavorited = favoriteIds.has(id);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (wasFavorited) next.delete(id);
      else next.add(id);
      return next;
    });
    if (wasFavorited) {
      await fetch(`/api/favorites/${id}`, { method: "DELETE" });
      show("Removed from favorites");
    } else {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
      });
      show("❤️ Added to favorites");
    }
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const supabase = createClient();
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
    setUploading(false);
    if (uploadError) {
      setError(`Image upload failed: ${uploadError.message}`);
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setForm((f) => ({ ...f, imageUrl: data.publicUrl }));
  }

  async function handleAdd() {
    if (!form.name.trim()) {
      setError("Give the product a name first.");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Could not save. Please try again.");
      return;
    }
    const { product } = await res.json();
    if (product.category === "HERBAL") setHerbal((list) => [...list, product]);
    else setHolistic((list) => [...list, product]);
    setForm({ name: "", category: form.category, description: "", price: "", priceRand: "", imageUrl: "" });
    show(`"${product.name}" added.`);
  }

  return (
    <>
      <ProductGrid
        title="Herbal Products"
        products={herbal}
        isAdmin={isAdmin}
        isSignedIn={isSignedIn}
        favoriteIds={favoriteIds}
        onDelete={handleDelete}
        onToggleFavorite={handleToggleFavorite}
        onAddToCart={handleAddToCart}
        emptyLabel="No herbal products added yet."
      />
      <ProductGrid
        title="Holistic Products"
        products={holistic}
        isAdmin={isAdmin}
        isSignedIn={isSignedIn}
        favoriteIds={favoriteIds}
        onDelete={handleDelete}
        onToggleFavorite={handleToggleFavorite}
        onAddToCart={handleAddToCart}
        emptyLabel="No holistic products added yet."
      />

      {isAdmin && (
        <div style={{ padding: "22px 6vw 20px", display: "flex", justifyContent: "center" }}>
          <div className="mk-card" style={{ width: "100%", maxWidth: 620, display: "flex", flexDirection: "column", gap: 14, textAlign: "left" }}>
            <h4 style={{ fontSize: 15, color: "#26372a", fontWeight: 600 }}>Add a Product</h4>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <label style={{ flexGrow: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, color: "#4a5a4d", fontWeight: 600 }}>Name</span>
                <input
                  className="mk-input"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Rooibos Calm Blend"
                />
              </label>
              <label style={{ width: 150, flexShrink: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, color: "#4a5a4d", fontWeight: 600 }}>Category</span>
                <select
                  className="mk-input"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as "HERBAL" | "HOLISTIC" })}
                >
                  <option value="HERBAL">Herbal</option>
                  <option value="HOLISTIC">Holistic</option>
                </select>
              </label>
            </div>

            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 12, color: "#4a5a4d", fontWeight: 600 }}>Description</span>
              <textarea
                className="mk-input"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What it is, what it's for"
                style={{ resize: "vertical" }}
              />
            </label>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <label style={{ width: 170, flexShrink: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, color: "#4a5a4d", fontWeight: 600 }}>Online price (R)</span>
                <input
                  className="mk-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.priceRand}
                  onChange={(e) => setForm({ ...form, priceRand: e.target.value })}
                  placeholder="e.g. 120"
                />
              </label>
              <label style={{ width: 170, flexShrink: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, color: "#4a5a4d", fontWeight: 600 }}>Price label (optional)</span>
                <input
                  className="mk-input"
                  type="text"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="e.g. Contact for price"
                />
              </label>
              <label style={{ flexGrow: 1, minWidth: 180, display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 12, color: "#4a5a4d", fontWeight: 600 }}>Photo (optional)</span>
                <input className="mk-input" type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} />
              </label>
            </div>
            <p style={{ fontSize: 11.5, color: "#8a9a8d", marginTop: -8 }}>
              Set an online price and customers can buy it right on the site. Leave it blank — with just a
              price label like &quot;Contact for price&quot; — to keep this one browse/inquiry-only.
            </p>
            {uploading && <p style={{ fontSize: 12, color: "#8a9a8d" }}>Uploading photo…</p>}
            {form.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- inline admin preview of an already-uploaded Storage file
              <img src={form.imageUrl} alt="" style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 4 }} />
            )}

            {error && <FormMessage type="error">{error}</FormMessage>}

            <button onClick={handleAdd} disabled={saving || uploading} className="mk-button" style={{ alignSelf: "flex-start" }}>
              {saving ? "Saving…" : "Add Product"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
