import BookingManager from "@/components/BookingManager";
import TestimonialWall from "@/components/TestimonialWall";
import Reveal from "@/components/Reveal";
import WaveDivider from "@/components/WaveDivider";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic"; // booking + testimonials reflect who's signed in

export default async function JourneyHomePage() {
  const user = await getSessionUser();
  return (
    <div style={{ width: "100%", background: "#fffdf7" }}>
      <Reveal>
        <div style={{ padding: "80px 6vw 30px", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}>
            {/* Swap this for /public/journey-home-logo.png once the logo file is added to the repo */}
            <div style={{ fontSize: 13, letterSpacing: ".3em", textTransform: "uppercase", color: "#3e5541", fontWeight: 600 }}>
              Heal · Grow · Reconnect
            </div>
            <p className="mk-serif" style={{ marginTop: 6, fontStyle: "italic", fontSize: 19, color: "#7a3e20" }}>
              Uya phila futhi{" "}
              <span style={{ fontFamily: "var(--mk-font-sans)", fontStyle: "normal", fontSize: 14, color: "#8a7a50" }}>
                — you will live again
              </span>
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div style={{ padding: "30px 6vw 90px", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 760, display: "flex", flexDirection: "column", gap: 22, textAlign: "center" }}>
            <h2 className="mk-serif" style={{ fontSize: "clamp(26px,3.4vw,36px)", color: "#26372a", fontWeight: 600 }}>
              Not a session. A companion for the road.
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.8, color: "#4a5a4d" }}>
              Journey Home Healing was built around one conviction: healing the mind and spirit
              doesn&apos;t end when an appointment does. Support continues through ongoing
              check-ins and conversation, so the person being supported is never carrying it alone
              between visits.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.8, color: "#4a5a4d" }}>
              Every journey is tracked and understood on its own terms — a personal progress
              report built around whatever the person is actually working through, because no two
              people are healing from the same thing.
            </p>
          </div>
        </div>
      </Reveal>
      <WaveDivider fill="#f0e9d6" />

      {/* HOW IT WORKS */}
      <div style={{ padding: "70px 6vw 90px", display: "flex", justifyContent: "center", background: "#f0e9d6" }}>
        <Reveal>
          <div style={{ width: "100%", maxWidth: 1080, display: "flex", flexDirection: "column", gap: 44 }}>
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 13, letterSpacing: ".24em", textTransform: "uppercase", color: "#7a3e20", fontWeight: 600 }}>
                How It Works
              </div>
              <h2 className="mk-serif" style={{ fontSize: "clamp(24px,3vw,32px)", color: "#26372a", fontWeight: 600 }}>
                Four steps, one ongoing relationship
              </h2>
            </div>
            <div className="mk-grid-4">
              {[
                ["01", "Reach out", "You share what you're carrying — no diagnosis needed, no situation too small or too big."],
                ["02", "A path is shaped around you", "No one-size-fits-all plan. Support is built around the specific thing you're working through."],
                ["03", "Ongoing contact, not one visit", "Check-ins continue by chat between conversations, so you're accompanied, not scheduled and forgotten."],
                ["04", "A progress report, built for you", "Your emotional and mental progress on that specific struggle is tracked and reflected back to you over time."],
              ].map(([n, title, body]) => (
                <div key={n} className="mk-card mk-card-hover" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="mk-serif" style={{ fontSize: 30, color: "#c9a15e", fontWeight: 600 }}>{n}</div>
                  <h3 style={{ fontSize: 17, color: "#26372a", fontWeight: 600 }}>{title}</h3>
                  <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "#4a5a4d" }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
      <WaveDivider fill="#fffdf7" />

      {/* BOOKING */}
      <div style={{ padding: "70px 6vw 90px", display: "flex", justifyContent: "center" }}>
        <Reveal>
          <div style={{ width: "100%", maxWidth: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 13, letterSpacing: ".24em", textTransform: "uppercase", color: "#7a3e20", fontWeight: 600 }}>
                Book A Conversation
              </div>
              <h2 className="mk-serif" style={{ fontSize: "clamp(24px,3vw,32px)", color: "#26372a", fontWeight: 600 }}>
                You don&apos;t have to carry it alone.
              </h2>
              <p style={{ fontSize: 15.5, color: "#4a5a4d", maxWidth: 520 }}>
                Reach out, and the road home starts with one conversation.
              </p>
            </div>
            <BookingManager isSignedIn={!!user} isAdmin={user?.role === "ADMIN"} />
          </div>
        </Reveal>
      </div>
      <WaveDivider fill="#f0e9d6" />

      {/* TESTIMONIALS */}
      <div style={{ padding: "10px 6vw 90px", display: "flex", justifyContent: "center", background: "#f0e9d6" }}>
        <Reveal>
          <div style={{ width: "100%", maxWidth: 1080, display: "flex", flexDirection: "column", gap: 30 }}>
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 13, letterSpacing: ".24em", textTransform: "uppercase", color: "#7a3e20", fontWeight: 600 }}>
                In Their Words
              </div>
              <h2 className="mk-serif" style={{ fontSize: "clamp(24px,3vw,32px)", color: "#26372a", fontWeight: 600 }}>
                Stories from the journey home
              </h2>
            </div>
            <TestimonialWall branch="JOURNEY_HOME" isSignedIn={!!user} />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
