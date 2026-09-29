"use client";

import { useState } from "react";
import Link from "next/link";
import FormMessage from "./FormMessage";
import { useToast } from "./Toast";

// status is ACTIVE | PAUSED — a plain string, not a literal union, to
// match how prisma/schema.prisma enforces allowed values in the API
// routes rather than at the DB level (see that file for why)
type Client = { id: string; name: string; focus: string; status: string };

function formatStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function ClientManager({ initialClients }: { initialClients: Client[] }) {
  const [clients, setClients] = useState(initialClients);
  const [name, setName] = useState("");
  const [focus, setFocus] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { show } = useToast();

  async function handleAdd() {
    if (!name.trim()) {
      setError("Give the client a name first.");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, focus }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Could not save. Please try again.");
      return;
    }
    const { client } = await res.json();
    setClients((list) => [...list, client]);
    setName("");
    setFocus("");
    show(`"${client.name}" added.`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {clients.length === 0 ? (
        <p style={{ fontSize: 14, color: "#8a9a8d", fontStyle: "italic" }}>
          No clients yet — add your first one below.
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
          {clients.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/clients/${c.id}`}
              className="mk-card mk-card-hover"
              style={{ display: "flex", alignItems: "center", gap: 12, color: "#26372a" }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#7a3e20",
                  color: "#faf6ec",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {c.name.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{c.name}</span>
                <span style={{ fontSize: 12.5, color: "#8a9a8d" }}>{c.focus || formatStatus(c.status)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mk-card" style={{ maxWidth: 460, display: "flex", flexDirection: "column", gap: 12 }}>
        <h4 style={{ fontSize: 15, color: "#26372a", fontWeight: 600 }}>Add a Client</h4>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 12, color: "#4a5a4d", fontWeight: 600 }}>Name</span>
          <input className="mk-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. [PLACEHOLDER] Client name" />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 12, color: "#4a5a4d", fontWeight: 600 }}>What they're working through</span>
          <input className="mk-input" value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="e.g. Grief & transition" />
        </label>
        {error && <FormMessage type="error">{error}</FormMessage>}
        <button onClick={handleAdd} disabled={saving} className="mk-button" style={{ alignSelf: "flex-start" }}>
          {saving ? "Saving…" : "Add Client"}
        </button>
      </div>
    </div>
  );
}
