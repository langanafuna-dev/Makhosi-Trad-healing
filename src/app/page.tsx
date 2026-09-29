import WellnessQuiz from "@/components/WellnessQuiz";
import TestimonialWall from "@/components/TestimonialWall";
import Reveal from "@/components/Reveal";
import WaveDivider from "@/components/WaveDivider";
import BrandMark from "@/components/BrandMark";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic"; // the testimonial wall reflects who's signed in

export default async function HomePage() {
  const user = await getSessionUser();
  return (
    <div style={{ width: "100%", background: "#faf6ec" }}>
      {/* VIDEO HERO — drone footage over the Tugela River Gorge, Drakensberg,
          where Thukela Falls falls. See README "Hero video" for the source
          and how to swap it for different footage. */}
      <div
        style={{
          position: "relative",
          minHeight: "clamp(460px, 88vh, 820px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: "#1c2a20",
        }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        >
          <source src="/videos/uthekela-falls.mp4" type="video/mp4" />
        </video>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(28,42,32,0.42) 0%, rgba(28,42,32,0.58) 55%, rgba(28,42,32,0.94) 100%)",
          }}
        />

        <Reveal>
          <div
            style={{
              position: "relative",
              zIndex: 1,
              textAlign: "center",
              padding: "0 6vw",
              maxWidth: 820,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 22,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <BrandMark size={26} />
              <div style={{ fontSize: 13, letterSpacing: ".24em", textTransform: "uppercase", color: "#c9a15e", fontWeight: 600 }}>
                Makosi Traditional Healing
              </div>
            </div>
            <h1 className="mk-serif" style={{ fontSize: "clamp(30px,4.4vw,46px)", lineHeight: 1.25, color: "#faf6ec", fontWeight: 600, maxWidth: 700 }}>
              Before it had a name, this was just what our family did for people who were hurting.
            </h1>
            <p style={{ fontSize: 16.5, color: "#c9a15e", fontWeight: 500, fontStyle: "italic" }}>
              Some things can&apos;t be fixed in an hour. Some need a remedy you can hold.
            </p>
            <p style={{ maxWidth: 640, fontSize: 17, lineHeight: 1.7, color: "#d7ded4" }}>
              Now carried forward through two branches — one for the mind and spirit, one for the
              body: <strong style={{ color: "#faf6ec" }}>Journey Home Healing</strong> and{" "}
              <strong style={{ color: "#faf6ec" }}>Makosi Herbal &amp; Holistic Products</strong>.
            </p>
          </div>
        </Reveal>

        <p
          style={{
            position: "absolute",
            bottom: 16,
            left: "6vw",
            zIndex: 1,
            fontSize: 11.5,
            letterSpacing: ".04em",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          Tugela River Gorge, Drakensberg
        </p>

        <div className="mk-scroll-cue" style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)", zIndex: 1 }} aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M5 9l7 7 7-7" stroke="rgba(255,255,255,0.75)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <WaveDivider fill="#faf6ec" />

      {/* THE TWO BRANCHES */}
      <div style={{ padding: "10px 6vw 90px", display: "flex", justifyContent: "center" }}>
        <Reveal>
          <div className="mk-grid-2" style={{ width: "100%", maxWidth: 1080 }}>
            <a
              href="/journey-home"
              className="mk-card-hover"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                padding: "36px 32px",
                background: "#26372a",
                border: "1px solid #26372a",
                borderRadius: 4,
              }}
            >
              <div style={{ fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase", color: "#c9a15e", fontWeight: 600 }}>
                Branch One
              </div>
              <h3 className="mk-serif" style={{ fontSize: 26, color: "#faf6ec", fontWeight: 600 }}>
                Journey Home Healing
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: "#d7ded4" }}>
                Ongoing emotional and mental support — ancestral wisdom and a grounding in
                psychology, walked alongside real life, not confined to a single session.
              </p>
              <span style={{ marginTop: 8, fontSize: 14, fontWeight: 600, color: "#c9a15e" }}>
                Explore this branch →
              </span>
            </a>

            <a
              href="/herbal-holistic"
              className="mk-card-hover"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                padding: "36px 32px",
                background: "#3e5541",
                borderRadius: 4,
                border: "1px solid #4c6650",
              }}
            >
              <div style={{ fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase", color: "#c9a15e", fontWeight: 600 }}>
                Branch Two
              </div>
              <h3 className="mk-serif" style={{ fontSize: 26, color: "#faf6ec", fontWeight: 600 }}>
                Makosi Herbal &amp; Holistic Products
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: "#d7ded4" }}>
                Traditional herbal remedies and holistic wellness products, drawn from the same
                well of knowledge, for the body rather than the mind.
              </p>
              <span style={{ marginTop: 8, fontSize: 14, fontWeight: 600, color: "#c9a15e" }}>
                Explore this branch →
              </span>
            </a>
          </div>
        </Reveal>
      </div>

      {/* WELLNESS QUIZ */}
      <div style={{ padding: "10px 6vw 90px", display: "flex", justifyContent: "center", background: "#f0e9d6" }}>
        <Reveal>
          <div style={{ width: "100%", maxWidth: 1080, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 13, letterSpacing: ".24em", textTransform: "uppercase", color: "#7a3e20", fontWeight: 600 }}>
                Not Sure Where To Start?
              </div>
              <h2 className="mk-serif" style={{ fontSize: "clamp(24px,3vw,32px)", color: "#26372a", fontWeight: 600 }}>
                Take a minute. Find your path.
              </h2>
            </div>
            <WellnessQuiz />
          </div>
        </Reveal>
      </div>
      <WaveDivider fill="#fffdf7" />

      {/* TESTIMONIALS */}
      <div style={{ padding: "10px 6vw 90px", display: "flex", justifyContent: "center", background: "#fffdf7" }}>
        <Reveal>
          <div style={{ width: "100%", maxWidth: 1080, display: "flex", flexDirection: "column", gap: 30 }}>
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 13, letterSpacing: ".24em", textTransform: "uppercase", color: "#7a3e20", fontWeight: 600 }}>
                In Their Words
              </div>
              <h2 className="mk-serif" style={{ fontSize: "clamp(24px,3vw,32px)", color: "#26372a", fontWeight: 600 }}>
                Stories from the journey
              </h2>
            </div>
            <TestimonialWall isSignedIn={!!user} />
          </div>
        </Reveal>
      </div>
      <WaveDivider fill="#26372a" />

      {/* FOUNDER */}
      <div style={{ padding: "10px 6vw 90px", display: "flex", justifyContent: "center", background: "#26372a" }}>
        <Reveal>
          <div style={{ width: "100%", maxWidth: 820, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" }}>
            <div style={{ fontSize: 13, letterSpacing: ".24em", textTransform: "uppercase", color: "#c9a15e", fontWeight: 600 }}>
              Guided By
            </div>
            <h2 className="mk-serif" style={{ fontSize: "clamp(24px,3vw,32px)", color: "#faf6ec", fontWeight: 600 }}>
              Bongiwe Langa
            </h2>
            <p style={{ maxWidth: 600, fontSize: 16.5, lineHeight: 1.85, color: "#d7ded4" }}>
              A traditional healer with a deep grounding in psychology, holding both worlds at
              once — ancestral practice and an understanding of the mind — so that both branches,
              support and remedies alike, come from one authentic source.
            </p>
          </div>
        </Reveal>
      </div>
      <WaveDivider fill="#faf6ec" />

      {/* FOOTER */}
      <div
        style={{
          padding: "40px 6vw",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          alignItems: "center",
          textAlign: "center",
          background: "#faf6ec",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <BrandMark size={18} />
          <span className="mk-serif" style={{ fontSize: 15, fontWeight: 600, color: "#26372a" }}>
            Makosi Traditional Healing
          </span>
        </div>
        <p style={{ fontSize: 13.5, color: "#8a9a8d" }}>
          Journey Home Healing · Makosi Herbal &amp; Holistic Products
        </p>
        <p style={{ fontSize: 12.5, color: "#b0ae99" }}>
          [CONTACT DETAILS] &nbsp;·&nbsp; © {new Date().getFullYear()} Makosi Traditional Healing
        </p>
      </div>
    </div>
  );
}
