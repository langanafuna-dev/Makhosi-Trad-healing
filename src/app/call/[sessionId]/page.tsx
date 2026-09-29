"use client";

/**
 * UI-ONLY SCREEN. There is no real audio/video here — clicking these
 * controls doesn't connect to anyone.
 *
 * To make this real: pick a video provider (Twilio Video, Agora, or
 * Daily.co all have a free tier — see README "Where this can go
 * next" for per-minute pricing), install their client SDK, and swap
 * the placeholder panes below for the SDK's video element. The
 * "stay anonymous" toggle already does the one thing this screen CAN
 * do without a provider: it swaps the local preview between a camera
 * placeholder and a silhouette, which is the UI behavior you'd wire
 * the real camera stream to.
 */

import { useState } from "react";

export default function CallPage() {
  const [anonymous, setAnonymous] = useState(true);

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "40px 16px", background: "#1b2a1f", minHeight: "calc(100vh - 66px)" }}>
      <div style={{ width: "100%", maxWidth: 390, height: "min(700px, 80vh)", position: "relative", background: "#1b2a1f", borderRadius: 12, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.35)" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg,#26372a 0%,#1b2a1f 70%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#5c6e5f", fontSize: 13 }}>[REMOTE VIDEO FEED — not connected]</span>
        </div>

        <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "18px 18px 40px", background: "linear-gradient(180deg, rgba(15,23,17,0.65) 0%, rgba(15,23,17,0) 100%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span style={{ color: "#faf6ec", fontSize: 14.5, fontWeight: 600 }}>Bongiwe Langa</span>
          <span style={{ color: "#b7c4b9", fontSize: 12 }}>Journey Home Healing</span>
        </div>

        {anonymous && (
          <div style={{ position: "absolute", top: 78, left: "50%", transform: "translateX(-50%)", background: "rgba(38,55,42,0.85)", color: "#c9a15e", fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 14 }}>
            Anonymous Mode — camera off
          </div>
        )}

        <div style={{ position: "absolute", bottom: 150, right: 18, width: 110, height: 150, borderRadius: 12, overflow: "hidden", background: "#2e4030", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {anonymous ? (
            <span style={{ color: "#d7ded4", fontSize: 10.5 }}>You (anonymous)</span>
          ) : (
            <span style={{ color: "#8fa391", fontSize: 10.5 }}>[YOUR CAMERA]</span>
          )}
        </div>

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "22px 24px 34px", background: "linear-gradient(0deg, rgba(15,23,17,0.75) 0%, rgba(15,23,17,0) 100%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(250,246,236,0.1)", padding: "7px 14px", borderRadius: 16 }}>
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
            <span style={{ color: "#faf6ec", fontSize: 12.5, fontWeight: 500 }}>Stay anonymous (camera off)</span>
          </label>

          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <button aria-label="Toggle microphone (not wired up)" style={{ width: 52, height: 52, borderRadius: "50%", border: "none", background: "rgba(250,246,236,0.15)" }} />
            <button aria-label="Toggle camera (not wired up)" style={{ width: 52, height: 52, borderRadius: "50%", border: "none", background: "rgba(250,246,236,0.15)" }} />
            <button aria-label="End call" style={{ width: 52, height: 52, borderRadius: "50%", border: "none", background: "#b23a2e" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
