"use client";

import { useEffect, useState } from "react";

type BookedAppointment = {
  id: string;
  startsAt: string;
  durationMinutes: number;
  note: string;
  customer: { name: string } | null;
};

function formatSlot(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// The founder's view of who's actually coming — open-slot management
// itself lives on the public /journey-home page (visible to the admin
// too), so it isn't duplicated here.
export default function AdminBookings() {
  const [booked, setBooked] = useState<BookedAppointment[] | null>(null);

  function refresh() {
    fetch("/api/appointments?scope=admin")
      .then((res) => res.json())
      .then((data) => setBooked(data.booked ?? []));
  }

  useEffect(refresh, []);

  async function handleCancel(id: string) {
    await fetch(`/api/appointments/${id}/cancel`, { method: "POST" });
    refresh();
  }

  if (booked === null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[0, 1].map((i) => (
          <div key={i} className="mk-skeleton" style={{ height: 56 }} />
        ))}
      </div>
    );
  }

  if (booked.length === 0) {
    return <p style={{ fontSize: 14, color: "#8a9a8d", fontStyle: "italic" }}>No sessions booked yet.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {booked.map((a) => (
        <div key={a.id} className="mk-card" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <p style={{ fontSize: 14.5, fontWeight: 600, color: "#26372a" }}>
              {a.customer?.name ?? "Someone"} — {formatSlot(a.startsAt)}
            </p>
            <p style={{ fontSize: 12.5, color: "#8a9a8d" }}>
              {a.durationMinutes} minutes{a.note ? ` · ${a.note}` : ""}
            </p>
          </div>
          <button
            onClick={() => handleCancel(a.id)}
            style={{ background: "none", border: "none", color: "#b23a2e", fontSize: 12.5, fontWeight: 600 }}
          >
            Cancel
          </button>
        </div>
      ))}
    </div>
  );
}
