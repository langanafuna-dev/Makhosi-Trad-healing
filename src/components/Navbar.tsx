import Link from "next/link";
import type { SessionUser } from "@/lib/auth";
import BrandMark from "./BrandMark";

export default function Navbar({ user, cartCount = 0 }: { user: SessionUser | null; cartCount?: number }) {
  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "16px 6vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        borderBottom: "1px solid #e7dec7",
        position: "sticky",
        top: 0,
        background: "rgba(250,246,236,0.94)",
        backdropFilter: "blur(6px)",
        zIndex: 10,
      }}
    >
      <Link
        href="/"
        style={{ display: "flex", alignItems: "center", gap: 10, color: "#26372a" }}
      >
        <BrandMark size={24} />
        <span className="mk-serif" style={{ fontSize: 17, fontWeight: 600 }}>
          Makosi Traditional Healing
        </span>
      </Link>

      <div className="mk-nav-links">
        <Link href="/journey-home" className="mk-nav-link" style={{ color: "#3e5541", fontWeight: 500 }}>
          Journey Home Healing
        </Link>
        <Link href="/herbal-holistic" className="mk-nav-link" style={{ color: "#3e5541", fontWeight: 500 }}>
          Herbal &amp; Holistic
        </Link>

        {user && (
          <>
            <Link href="/favorites" className="mk-nav-link" style={{ color: "#3e5541", fontWeight: 500 }}>
              Favorites
            </Link>
            <Link href="/orders" className="mk-nav-link" style={{ color: "#3e5541", fontWeight: 500 }}>
              Orders
            </Link>
            <Link href="/cart" className="mk-nav-link" style={{ color: "#3e5541", fontWeight: 500 }}>
              Cart{cartCount > 0 ? ` (${cartCount})` : ""}
            </Link>
          </>
        )}

        {user?.role === "ADMIN" && (
          <Link href="/dashboard" className="mk-nav-link" style={{ color: "#3e5541", fontWeight: 500 }}>
            Dashboard
          </Link>
        )}

        {user ? (
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              style={{
                background: "none",
                border: "none",
                color: "#7a3e20",
                fontWeight: 600,
                fontSize: 14.5,
                padding: 0,
              }}
            >
              Sign out ({user.name.split(" ")[0]})
            </button>
          </form>
        ) : (
          <Link
            href="/login"
            className="mk-button"
            style={{
              padding: "9px 18px",
              fontSize: 14.5,
            }}
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
