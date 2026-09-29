"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./Toast";

type CartLine = {
  productId: string;
  name: string;
  imageUrl: string | null;
  unitPriceCents: number;
  quantity: number;
};

function formatRand(cents: number) {
  return `R${(cents / 100).toFixed(2)}`;
}

export default function CartManager({ initialItems }: { initialItems: CartLine[] }) {
  const [items, setItems] = useState(initialItems);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { show } = useToast();

  async function setQuantity(productId: string, quantity: number) {
    setBusy(true);
    if (quantity <= 0) {
      setItems((list) => list.filter((i) => i.productId !== productId));
    } else {
      setItems((list) => list.map((i) => (i.productId === productId ? { ...i, quantity } : i)));
    }
    await fetch(`/api/cart/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    setBusy(false);
  }

  async function handleRemove(productId: string) {
    setItems((list) => list.filter((i) => i.productId !== productId));
    await fetch(`/api/cart/${productId}`, { method: "DELETE" });
    show("Removed from cart");
  }

  const subtotalCents = items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="mk-card" style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 14, maxWidth: 480, margin: "0 auto" }}>
        <p style={{ fontSize: 15, color: "#4a5a4d" }}>Your cart is empty.</p>
        <a href="/herbal-holistic" className="mk-button" style={{ alignSelf: "center" }}>
          Browse Products
        </a>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item) => (
          <div key={item.productId} className="mk-card" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            {item.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- Supabase Storage URL
              <img src={item.imageUrl} alt="" style={{ width: 56, height: 56, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
            )}
            <div style={{ flexGrow: 1, minWidth: 140 }}>
              <p style={{ fontSize: 14.5, fontWeight: 600, color: "#26372a" }}>{item.name}</p>
              <p style={{ fontSize: 12.5, color: "#8a9a8d" }}>{formatRand(item.unitPriceCents)} each</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={() => setQuantity(item.productId, item.quantity - 1)}
                disabled={busy}
                style={{ width: 28, height: 28, borderRadius: 5, border: "1px solid var(--mk-border)", background: "#fff" }}
              >
                −
              </button>
              <span style={{ fontSize: 14, fontWeight: 600, minWidth: 18, textAlign: "center" }}>{item.quantity}</span>
              <button
                onClick={() => setQuantity(item.productId, item.quantity + 1)}
                disabled={busy}
                style={{ width: 28, height: 28, borderRadius: 5, border: "1px solid var(--mk-border)", background: "#fff" }}
              >
                +
              </button>
            </div>
            <span style={{ fontSize: 14.5, fontWeight: 700, color: "#26372a", minWidth: 70, textAlign: "right" }}>
              {formatRand(item.unitPriceCents * item.quantity)}
            </span>
            <button
              onClick={() => handleRemove(item.productId)}
              style={{ background: "none", border: "none", color: "#b23a2e", fontSize: 12, fontWeight: 600 }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mk-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15 }}>
          <span style={{ color: "#4a5a4d" }}>Subtotal</span>
          <strong style={{ color: "#26372a" }}>{formatRand(subtotalCents)}</strong>
        </div>
        <p style={{ fontSize: 12.5, color: "#8a9a8d", marginTop: -6 }}>Shipping is calculated at checkout.</p>
        <button onClick={() => router.push("/checkout")} className="mk-button" style={{ alignSelf: "flex-start" }}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
