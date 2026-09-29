"use client";

import { useEffect, useState } from "react";
import FormMessage from "./FormMessage";

type Testimonial = { id: string; body: string; author: { name: string } };

export default function TestimonialWall({
  branch,
  isSignedIn = false,
}: {
  branch?: "JOURNEY_HOME" | "HERBAL_HOLISTIC";
  isSignedIn?: boolean;
}) {
  const [testimonials, setTestimonials] = useState<Testimonial[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const qs = branch ? `?branch=${branch}` : "";
    fetch(`/api/testimonials${qs}`)
      .then((res) => res.json())
      .then((data) => setTestimonials(data.testimonials ?? []))
      .catch(() => setTestimonials([]));
  }, [branch]);

  async function handleSubmit() {
    if (!body.trim()) {
      setError("Share a little about your experience first.");
      return;
    }
    setSaving(true);
    setError("");
    const res = await fetch("/api/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, branch: branch || "JOURNEY_HOME" }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Couldn't submit that — please try again.");
      return;
    }
    setBody("");
    setSubmitted(true);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      {testimonials === null ? (
        <div style={{ display: "flex", gap: 18, overflow: "hidden" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="mk-skeleton" style={{ minWidth: 280, maxWidth: 320, flexShrink: 0, height: 168, borderRadius: 6 }} />
          ))}
        </div>
      ) : testimonials.length === 0 ? (
        <p style={{ fontSize: 14, color: "#8a9a8d", fontStyle: "italic", textAlign: "center" }}>
          Be the first to share your story.
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            gap: 18,
            overflowX: "auto",
            paddingBottom: 8,
          }}
        >
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="mk-card mk-card-hover mk-pop-in"
              style={{ minWidth: 280, maxWidth: 320, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div className="mk-serif" style={{ fontSize: 30, color: "#c9a15e", lineHeight: 1 }}>&ldquo;</div>
              <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "#4a5a4d" }}>{t.body}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#7a3e20" }}>— {t.author.name}</p>
            </div>
          ))}
        </div>
      )}

      {isSignedIn && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          {submitted ? (
            <FormMessage type="success">
              Thank you — your story is being reviewed and will appear here once approved.
            </FormMessage>
          ) : showForm ? (
            <div className="mk-card" style={{ width: "100%", maxWidth: 520, display: "flex", flexDirection: "column", gap: 12 }}>
              <h4 style={{ fontSize: 14.5, color: "#26372a", fontWeight: 600 }}>Share your story</h4>
              <textarea
                className="mk-input"
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What was your experience like?"
                style={{ resize: "vertical" }}
              />
              {error && <FormMessage type="error">{error}</FormMessage>}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={handleSubmit} disabled={saving} className="mk-button" style={{ alignSelf: "flex-start" }}>
                  {saving ? "Sending…" : "Submit"}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  style={{ background: "none", border: "none", color: "#8a9a8d", fontSize: 13, fontWeight: 600 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowForm(true)} className="mk-button secondary">
              Share Your Story
            </button>
          )}
        </div>
      )}
    </div>
  );
}
