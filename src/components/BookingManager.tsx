"use client";

import { useEffect, useState } from "react";
import FormMessage from "./FormMessage";
import { useToast } from "./Toast";

type Appointment = {
  id: string;
  startsAt: string;
  durationMinutes: number;
  status: string; // OPEN | BOOKED
  note: string;
};

function formatSlot(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function BookingManager({ isSignedIn, isAdmin }: { isSignedIn: boolean; isAdmin: boolean }) {
  const [open, setOpen] = useState<Appointment[] | null>(null);
  const [mine, setMine] = useState<Appointment[]>([]);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [newSlot, setNewSlot] = useState({ startsAt: "", durationMinutes: 45 });
  const { show } = useToast();

  async function refresh() {
    const res = await fetch("/api/appointments");
    if (!res.ok) return;
    const data = await res.json();
    setOpen(data.open ?? []);
    setMine(data.mine ?? []);
  }

  useEffect(() => {
    if (isSignedIn) refresh();
  }, [isSignedIn]);

  async function handleBook(id: string) {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/appointments/${id}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Couldn't book that slot.");
      return;
    }
    setBookingId(null);
    setNote("");
    refresh();
    show("Session booked — see you then.");
  }

  async function handleCancel(id: string) {
    setBusy(true);
    await fetch(`/api/appointments/${id}/cancel`, { method: "POST" });
    setBusy(false);
    refresh();
    show("Booking cancelled.");
  }

  async function handleCreateSlot() {
    if (!newSlot.startsAt) {
      setError("Pick a date and time first.");
      return;
    }
    setBusy(true);
    setError("");
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startsAt: new Date(newSlot.startsAt).toISOString(),
        durationMinutes: newSlot.durationMinutes,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Couldn't open that slot.");
      return;
    }
    setNewSlot({ startsAt: "", durationMinutes: 45 });
    refresh();
    show("New slot opened.");
  }

  async function handleDeleteSlot(id: string) {
    setBusy(true);
    await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    setBusy(false);
    refresh();
    show("Slot removed.");
  }

  if (!isSignedIn) {
    return (
      <div className="mk-card" style={{ width: "100%", maxWidth: 560, textAlign: "center", display: "flex", flexDirection: "column", gap: 14 }}>
        <h3 className="mk-serif" style={{ fontSize: 20, color: "#26372a", fontWeight: 600 }}>
          Ready to talk?
        </h3>
        <p style={{ fontSize: 14.5, color: "#4a5a4d", lineHeight: 1.6 }}>
          Sign in to see open consultation times and book one directly.
        </p>
        <a href="/login" className="mk-button" style={{ alignSelf: "center" }}>
          Sign In to Book
        </a>
      </div>
    );
  }

  const upcoming = mine.filter((a) => a.status === "BOOKED" && new Date(a.startsAt).getTime() > Date.now());

  return (
    <div style={{ width: "100%", maxWidth: 720, display: "flex", flexDirection: "column", gap: 30 }}>
      {upcoming.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h3 className="mk-serif" style={{ fontSize: 18, color: "#26372a", fontWeight: 600 }}>
            Your Upcoming Sessions
          </h3>
          {upcoming.map((a) => (
            <div key={a.id} className="mk-card" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <p style={{ fontSize: 14.5, fontWeight: 600, color: "#26372a" }}>{formatSlot(a.startsAt)}</p>
                <p style={{ fontSize: 12.5, color: "#8a9a8d" }}>{a.durationMinutes} minutes{a.note ? ` · ${a.note}` : ""}</p>
              </div>
              <button
                onClick={() => handleCancel(a.id)}
                disabled={busy}
                style={{ background: "none", border: "none", color: "#b23a2e", fontSize: 12.5, fontWeight: 600 }}
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h3 className="mk-serif" style={{ fontSize: 18, color: "#26372a", fontWeight: 600 }}>
          Open Times
        </h3>

        {error && <FormMessage type="error">{error}</FormMessage>}

        {open === null ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="mk-skeleton" style={{ height: 64 }} />
            ))}
          </div>
        ) : open.length === 0 ? (
          <p style={{ fontSize: 14, color: "#8a9a8d", fontStyle: "italic" }}>
            No open times right now — check back soon.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {open.map((a) => (
              <div key={a.id} className="mk-card mk-pop-in" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 14.5, fontWeight: 600, color: "#26372a" }}>{formatSlot(a.startsAt)}</p>
                    <p style={{ fontSize: 12.5, color: "#8a9a8d" }}>{a.durationMinutes} minutes</p>
                  </div>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteSlot(a.id)}
                        disabled={busy}
                        style={{ background: "none", border: "none", color: "#8a9a8d", fontSize: 12, fontWeight: 600 }}
                      >
                        Remove
                      </button>
                    )}
                    <button
                      onClick={() => setBookingId(bookingId === a.id ? null : a.id)}
                      className="mk-button"
                      style={{ padding: "8px 16px", fontSize: 13 }}
                    >
                      {bookingId === a.id ? "Cancel" : "Book"}
                    </button>
                  </div>
                </div>
                {bookingId === a.id && (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <input
                      className="mk-input"
                      placeholder="What would you like to talk through? (optional)"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      style={{ flex: 1, minWidth: 200 }}
                    />
                    <button onClick={() => handleBook(a.id)} disabled={busy} className="mk-button secondary" style={{ flexShrink: 0 }}>
                      Confirm
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="mk-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h4 style={{ fontSize: 15, color: "#26372a", fontWeight: 600 }}>Open a New Slot</h4>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              className="mk-input"
              type="datetime-local"
              value={newSlot.startsAt}
              onChange={(e) => setNewSlot({ ...newSlot, startsAt: e.target.value })}
              style={{ flex: 1, minWidth: 200 }}
            />
            <select
              className="mk-input"
              value={newSlot.durationMinutes}
              onChange={(e) => setNewSlot({ ...newSlot, durationMinutes: Number(e.target.value) })}
              style={{ width: 140 }}
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
          <button onClick={handleCreateSlot} disabled={busy} className="mk-button" style={{ alignSelf: "flex-start" }}>
            Open Slot
          </button>
        </div>
      )}
    </div>
  );
}
