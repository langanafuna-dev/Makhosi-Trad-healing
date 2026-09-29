"use client";

import { useEffect, useState } from "react";
import { useToast } from "./Toast";

type Pending = { id: string; body: string; branch: string; author: { name: string } };

export default function TestimonialModeration() {
  const [pending, setPending] = useState<Pending[] | null>(null);
  const { show } = useToast();

  function refresh() {
    fetch("/api/testimonials?scope=pending")
      .then((res) => res.json())
      .then((data) => setPending(data.testimonials ?? []));
  }

  useEffect(refresh, []);

  async function handleApprove(id: string) {
    setPending((list) => list?.filter((t) => t.id !== id) ?? null);
    await fetch(`/api/testimonials/${id}`, { method: "PATCH" });
    show("Testimonial approved — now live.");
  }

  async function handleReject(id: string) {
    setPending((list) => list?.filter((t) => t.id !== id) ?? null);
    await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
    show("Testimonial rejected.");
  }

  if (pending === null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[0, 1].map((i) => (
          <div key={i} className="mk-skeleton" style={{ height: 90 }} />
        ))}
      </div>
    );
  }

  if (pending.length === 0) {
    return <p style={{ fontSize: 14, color: "#8a9a8d", fontStyle: "italic" }}>Nothing waiting on review.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {pending.map((t) => (
        <div key={t.id} className="mk-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ fontSize: 12, color: "#8a9a8d" }}>
            {t.author.name} · {t.branch === "JOURNEY_HOME" ? "Journey Home Healing" : "Herbal & Holistic"}
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "#4a5a4d" }}>{t.body}</p>
          <div style={{ display: "flex", gap: 14 }}>
            <button onClick={() => handleApprove(t.id)} className="mk-button" style={{ padding: "7px 16px", fontSize: 12.5 }}>
              Approve
            </button>
            <button
              onClick={() => handleReject(t.id)}
              style={{ background: "none", border: "none", color: "#b23a2e", fontSize: 12.5, fontWeight: 600 }}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
