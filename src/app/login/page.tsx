"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import BrandMark from "@/components/BrandMark";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  auth_failed: "That sign-in link didn't work — it may have expired. Please try again.",
};

export default function LoginPage({ searchParams }: { searchParams?: { error?: string } }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [isSignIn, setIsSignIn] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState(
    (searchParams?.error && AUTH_ERROR_MESSAGES[searchParams.error]) || ""
  );
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!isSignIn && !agreed) {
      setError("Please agree to the terms and privacy policy first.");
      return;
    }

    setLoading(true);

    if (isSignIn) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (signInError) {
        setError(signInError.message);
        return;
      }
      // One account, both branches — send them back to the branch that
      // makes sense to browse first.
      router.push("/herbal-holistic");
      router.refresh();
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      // Email confirmation is off for this project — already signed in.
      router.push("/herbal-holistic");
      router.refresh();
      return;
    }

    // Confirmation email required before the account can sign in.
    setIsSignIn(true);
    setInfo("Almost there — check your email for a confirmation link, then sign in.");
  }

  async function handleGoogle() {
    setError("");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    // Supabase navigates the browser to Google from here — nothing to do.
  }

  return (
    <div
      style={{
        position: "relative",
        minHeight: "calc(100vh - 66px)",
        background: "linear-gradient(160deg,#26372a 0%,#3e5541 55%,#26372a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 26,
        padding: "60px 20px",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 680,
          height: 680,
          background: "radial-gradient(circle, rgba(201,161,94,0.16) 0%, rgba(201,161,94,0) 70%)",
          pointerEvents: "none",
        }}
      />
      <div className="mk-pop-in" style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
        <BrandMark size={28} />
        <span className="mk-serif" style={{ fontSize: 18, fontWeight: 600, color: "#faf6ec" }}>
          Makosi Traditional Healing
        </span>
      </div>
      <div className="mk-pop-in" style={{ position: "relative", width: "100%", maxWidth: 420, background: "#fffdf7", borderRadius: 8, boxShadow: "0 20px 60px rgba(0,0,0,0.35)", overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: "1px solid #efe7d2" }}>
          <button
            onClick={() => setIsSignIn(true)}
            style={{
              flex: 1,
              padding: "12px 0",
              background: "none",
              border: "none",
              borderBottom: isSignIn ? "2px solid #7a3e20" : "2px solid transparent",
              color: isSignIn ? "#26372a" : "#9aa69c",
              fontWeight: 600,
              fontSize: 14.5,
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsSignIn(false)}
            style={{
              flex: 1,
              padding: "12px 0",
              background: "none",
              border: "none",
              borderBottom: !isSignIn ? "2px solid #7a3e20" : "2px solid transparent",
              color: !isSignIn ? "#26372a" : "#9aa69c",
              fontWeight: 600,
              fontSize: 14.5,
            }}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "30px 30px 34px", display: "flex", flexDirection: "column", gap: 16 }}>
          {isSignIn ? (
            <>
              <div>
                <h2 className="mk-serif" style={{ fontSize: 20, color: "#26372a", fontWeight: 600 }}>
                  Welcome back
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8a9a8d" }}>One account, both branches.</p>
              </div>
              <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <span style={{ fontSize: 12.5, color: "#4a5a4d", fontWeight: 600 }}>Email</span>
                <input className="mk-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <span style={{ fontSize: 12.5, color: "#4a5a4d", fontWeight: 600 }}>Password</span>
                <input className="mk-input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </label>
            </>
          ) : (
            <>
              <div>
                <h2 className="mk-serif" style={{ fontSize: 20, color: "#26372a", fontWeight: 600 }}>
                  Create your account
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#8a9a8d" }}>
                  Access Journey Home Healing and the Herbal &amp; Holistic shop with one login.
                </p>
              </div>
              <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <span style={{ fontSize: 12.5, color: "#4a5a4d", fontWeight: 600 }}>Full name</span>
                <input className="mk-input" type="text" required value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <span style={{ fontSize: 12.5, color: "#4a5a4d", fontWeight: 600 }}>Email</span>
                <input className="mk-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <span style={{ fontSize: 12.5, color: "#4a5a4d", fontWeight: 600 }}>Password</span>
                <input className="mk-input" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
              </label>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 3 }} />
                <span style={{ fontSize: 12, color: "#8a9a8d", lineHeight: 1.5 }}>
                  I agree to the [TERMS] and [PRIVACY POLICY].
                </span>
              </label>
            </>
          )}

          {error && <p style={{ fontSize: 12.5, color: "#b23a2e" }}>{error}</p>}
          {info && <p style={{ fontSize: 12.5, color: "#3e5541" }}>{info}</p>}

          <button type="submit" disabled={loading} className={isSignIn ? "mk-button" : "mk-button secondary"}>
            {loading ? "Please wait…" : isSignIn ? "Sign In" : "Create Account"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "2px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#efe7d2" }} />
            <span style={{ fontSize: 11.5, color: "#9aa69c" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "#efe7d2" }} />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "10px 0",
              borderRadius: 4,
              border: "1px solid #d9d0b8",
              background: "#fff",
              color: "#26372a",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
            </svg>
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
}
