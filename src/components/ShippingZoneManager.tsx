"use client";

import { useState } from "react";
import FormMessage from "./FormMessage";
import { useToast } from "./Toast";

type Zone = { id: string; name: string; description: string; feeCents: number };

function formatRand(cents: number) {
  return `R${(cents / 100).toFixed(2)}`;
}

export default function ShippingZoneManager({ initialZones }: { initialZones: Zone[] }) {
  const [zones, setZones] = useState(initialZones);
  const [form, setForm] = useState({ name: "", description: "", feeRand: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { show } = useToast();

  async function handleAdd() {
    if (!form.name.trim()) {
      setError("Give the zone a name.");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch("/api/shipping-zones", {
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
    const { zone } = await res.json();
    setZones((list) => [...list, zone].sort((a, b) => a.feeCents - b.feeCents));
    setForm({ name: "", description: "", feeRand: "" });
    show(`"${zone.name}" zone added.`);
  }

  async function handleDelete(id: string) {
    setZones((list) => list.filter((z) => z.id !== id));
    await fetch(`/api/shipping-zones/${id}`, { method: "DELETE" });
    show("Zone removed.");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {zones.length === 0 ? (
        <p style={{ fontSize: 14, color: "#8a9a8d", fontStyle: "italic" }}>
          No delivery zones yet — customers can&apos;t check out until you add at least one below.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {zones.map((zone) => (
            <div key={zone.id} className="mk-card" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#26372a" }}>{zone.name}</p>
                {zone.description && <p style={{ fontSize: 12.5, color: "#8a9a8d" }}>{zone.description}</p>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#7a3e20" }}>{formatRand(zone.feeCents)}</span>
                <button
                  onClick={() => handleDelete(zone.id)}
                  style={{ background: "none", border: "none", color: "#b23a2e", fontSize: 12, fontWeight: 600 }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mk-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h4 style={{ fontSize: 14, color: "#26372a", fontWeight: 600 }}>Add a Delivery Zone</h4>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <label style={{ flexGrow: 1, minWidth: 140, display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12, color: "#4a5a4d", fontWeight: 600 }}>Name</span>
            <input
              className="mk-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Local, National"
            />
          </label>
          <label style={{ width: 130, flexShrink: 0, display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12, color: "#4a5a4d", fontWeight: 600 }}>Fee (R)</span>
            <input
              className="mk-input"
              type="number"
              min="0"
              step="0.01"
              value={form.feeRand}
              onChange={(e) => setForm({ ...form, feeRand: e.target.value })}
              placeholder="e.g. 60"
            />
          </label>
        </div>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 12, color: "#4a5a4d", fontWeight: 600 }}>Description (optional)</span>
          <input
            className="mk-input"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="e.g. Johannesburg & Pretoria, 1-2 days"
          />
        </label>
        {error && <FormMessage type="error">{error}</FormMessage>}
        <button onClick={handleAdd} disabled={saving} className="mk-button" style={{ alignSelf: "flex-start" }}>
          {saving ? "Saving…" : "Add Zone"}
        </button>
      </div>
    </div>
  );
}
