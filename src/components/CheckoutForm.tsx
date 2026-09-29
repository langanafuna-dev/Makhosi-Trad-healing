"use client";

import { useState } from "react";
import FormMessage from "./FormMessage";

const SA_PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];

type CartLine = { productId: string; name: string; unitPriceCents: number; quantity: number };
type Zone = { id: string; name: string; description: string; feeCents: number };

function formatRand(cents: number) {
  return `R${(cents / 100).toFixed(2)}`;
}

export default function CheckoutForm({ items, zones }: { items: CartLine[]; zones: Zone[] }) {
  const [form, setForm] = useState({
    shippingName: "",
    shippingPhone: "",
    shippingAddressLine1: "",
    shippingAddressLine2: "",
    shippingCity: "",
    shippingProvince: SA_PROVINCES[2], // Gauteng — the most common default for this audience
    shippingPostalCode: "",
    zoneId: zones[0]?.id ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const subtotalCents = items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);
  const selectedZone = zones.find((z) => z.id === form.zoneId);
  const totalCents = subtotalCents + (selectedZone?.feeCents ?? 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.zoneId) {
      setError("Choose a delivery zone.");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      setSubmitting(false);
      const data = await res.json().catch(() => null);
      setError(data?.error || "Couldn't start checkout. Please try again.");
      return;
    }

    const data = await res.json();
    // Full navigation to Yoco's hosted payment page — not a fetch redirect,
    // this genuinely leaves the site until Yoco sends the customer back.
    window.location.href = data.redirectUrl;
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="mk-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <h3 style={{ fontSize: 16, color: "#26372a", fontWeight: 600 }}>Delivery Details</h3>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <label style={{ flexGrow: 1, minWidth: 180, display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12, color: "#4a5a4d", fontWeight: 600 }}>Full name</span>
            <input
              className="mk-input"
              required
              value={form.shippingName}
              onChange={(e) => setForm({ ...form, shippingName: e.target.value })}
            />
          </label>
          <label style={{ width: 170, flexShrink: 0, display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12, color: "#4a5a4d", fontWeight: 600 }}>Phone</span>
            <input
              className="mk-input"
              type="tel"
              required
              value={form.shippingPhone}
              onChange={(e) => setForm({ ...form, shippingPhone: e.target.value })}
              placeholder="082 123 4567"
            />
          </label>
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 12, color: "#4a5a4d", fontWeight: 600 }}>Address line 1</span>
          <input
            className="mk-input"
            required
            value={form.shippingAddressLine1}
            onChange={(e) => setForm({ ...form, shippingAddressLine1: e.target.value })}
            placeholder="Street address"
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 12, color: "#4a5a4d", fontWeight: 600 }}>Address line 2 (optional)</span>
          <input
            className="mk-input"
            value={form.shippingAddressLine2}
            onChange={(e) => setForm({ ...form, shippingAddressLine2: e.target.value })}
            placeholder="Apartment, complex, unit"
          />
        </label>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <label style={{ flexGrow: 1, minWidth: 140, display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12, color: "#4a5a4d", fontWeight: 600 }}>City</span>
            <input
              className="mk-input"
              required
              value={form.shippingCity}
              onChange={(e) => setForm({ ...form, shippingCity: e.target.value })}
            />
          </label>
          <label style={{ width: 170, flexShrink: 0, display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12, color: "#4a5a4d", fontWeight: 600 }}>Province</span>
            <select
              className="mk-input"
              value={form.shippingProvince}
              onChange={(e) => setForm({ ...form, shippingProvince: e.target.value })}
            >
              {SA_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label style={{ width: 130, flexShrink: 0, display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12, color: "#4a5a4d", fontWeight: 600 }}>Postal code</span>
            <input
              className="mk-input"
              required
              value={form.shippingPostalCode}
              onChange={(e) => setForm({ ...form, shippingPostalCode: e.target.value })}
            />
          </label>
        </div>
      </div>

      <div className="mk-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h3 style={{ fontSize: 16, color: "#26372a", fontWeight: 600 }}>Delivery Zone</h3>
        {zones.length === 0 ? (
          <p style={{ fontSize: 13.5, color: "#8a9a8d", fontStyle: "italic" }}>
            No delivery zones are set up yet — please check back soon.
          </p>
        ) : (
          zones.map((zone) => (
            <label
              key={zone.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 5,
                border: `1px solid ${form.zoneId === zone.id ? "#c9a15e" : "var(--mk-border)"}`,
                background: form.zoneId === zone.id ? "#fbf6ea" : "#fff",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="zone"
                checked={form.zoneId === zone.id}
                onChange={() => setForm({ ...form, zoneId: zone.id })}
              />
              <div style={{ flexGrow: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#26372a" }}>{zone.name}</p>
                {zone.description && <p style={{ fontSize: 12, color: "#8a9a8d" }}>{zone.description}</p>}
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#7a3e20" }}>{formatRand(zone.feeCents)}</span>
            </label>
          ))
        )}
      </div>

      <div className="mk-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <h3 style={{ fontSize: 16, color: "#26372a", fontWeight: 600 }}>Order Summary</h3>
        {items.map((i) => (
          <div key={i.productId} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "#4a5a4d" }}>
            <span>
              {i.name} × {i.quantity}
            </span>
            <span>{formatRand(i.unitPriceCents * i.quantity)}</span>
          </div>
        ))}
        <div style={{ borderTop: "1px solid #e9e2cc", marginTop: 4, paddingTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "#4a5a4d" }}>
            <span>Subtotal</span>
            <span>{formatRand(subtotalCents)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "#4a5a4d" }}>
            <span>Shipping</span>
            <span>{selectedZone ? formatRand(selectedZone.feeCents) : "—"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: "#26372a", marginTop: 4 }}>
            <span>Total</span>
            <span>{formatRand(totalCents)}</span>
          </div>
        </div>
      </div>

      {error && <FormMessage type="error">{error}</FormMessage>}

      <button type="submit" disabled={submitting || zones.length === 0} className="mk-button" style={{ alignSelf: "flex-start" }}>
        {submitting ? "Redirecting to payment…" : `Pay ${formatRand(totalCents)} with Yoco`}
      </button>
    </form>
  );
}
