"use client";

import { useState } from "react";
import FormMessage from "./FormMessage";
import { useToast } from "./Toast";

type Note = { id: string; body: string; createdAt: string; authorName: string };

export default function NotesManager({ clientId, initialNotes }: { clientId: string; initialNotes: Note[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { show } = useToast();

  async function handleAdd() {
    if (!body.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, body }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Could not save. Please try again.");
      return;
    }
    const { note } = await res.json();
    setNotes((list) => [
      { id: note.id, body: note.body, createdAt: note.createdAt, authorName: note.author.name },
      ...list,
    ]);
    setBody("");
    show("Note saved.");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="mk-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#3e5541" }}>New session note</label>
        <textarea
          className="mk-input"
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Record how this session went, what shifted, and what to follow up on next time…"
          style={{ resize: "vertical" }}
        />
        {error && <FormMessage type="error">{error}</FormMessage>}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={handleAdd} disabled={saving} className="mk-button">
            {saving ? "Saving…" : "Save Note"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <span style={{ fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", color: "#9aa69c", fontWeight: 600 }}>
          Previous Notes
        </span>
        {notes.length === 0 && (
          <p style={{ fontSize: 14, color: "#8a9a8d", fontStyle: "italic" }}>No notes yet for this client.</p>
        )}
        {notes.map((n) => (
          <div key={n.id} className="mk-pop-in" style={{ padding: 16, background: "#f0e9d6", borderRadius: 6, display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, color: "#8a7a50", fontWeight: 600 }}>
              {new Date(n.createdAt).toLocaleString()} · {n.authorName}
            </span>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "#3b4a3d" }}>{n.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
