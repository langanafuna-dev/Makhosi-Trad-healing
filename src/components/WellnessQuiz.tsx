"use client";

import { useState } from "react";

type Option = { label: string; mind: number; body: number };
type Question = { prompt: string; options: Option[] };

const QUESTIONS: Question[] = [
  {
    prompt: "What brought you here today?",
    options: [
      { label: "I'm carrying something emotionally heavy", mind: 2, body: 0 },
      { label: "I want to feel better physically", mind: 0, body: 2 },
      { label: "Both, if I'm honest", mind: 1, body: 1 },
    ],
  },
  {
    prompt: "When life gets hard, you usually reach for...",
    options: [
      { label: "A conversation with someone who gets it", mind: 2, body: 0 },
      { label: "Something to hold, drink, or do with my hands", mind: 0, body: 2 },
      { label: "Whatever's close by, honestly", mind: 1, body: 1 },
    ],
  },
  {
    prompt: "Pick the word that speaks to you right now",
    options: [
      { label: "Clarity", mind: 2, body: 0 },
      { label: "Grounding", mind: 0, body: 2 },
      { label: "Renewal", mind: 1, body: 1 },
    ],
  },
  {
    prompt: "How would you like to be supported?",
    options: [
      { label: "Ongoing check-ins and conversation", mind: 2, body: 0 },
      { label: "A remedy or ritual I can return to", mind: 0, body: 2 },
    ],
  },
];

type Result = { title: string; body: string; href: string; cta: string; tint: string };

function getResult(mind: number, body: number): Result {
  if (mind > body + 1) {
    return {
      title: "Journey Home Healing sounds right for you.",
      body: "It sounds like what you're carrying is more than one conversation can hold. Journey Home Healing is built for exactly that — ongoing support, not a single session.",
      href: "/journey-home",
      cta: "Explore Journey Home Healing",
      tint: "#26372a",
    };
  }
  if (body > mind + 1) {
    return {
      title: "Start with Herbal & Holistic.",
      body: "Sounds like your body is asking for something tangible. Browse remedies and holistic products prepared the traditional way.",
      href: "/herbal-holistic",
      cta: "Explore Herbal & Holistic Products",
      tint: "#3e5541",
    };
  }
  return {
    title: "Both paths meet where you are.",
    body: "Mind and body, carried together — that's exactly what Makosi was built around. A free first conversation is the easiest place to start either way.",
    href: "/journey-home",
    cta: "Begin with a Conversation",
    tint: "#7a3e20",
  };
}

export default function WellnessQuiz() {
  const [step, setStep] = useState(0);
  const [mind, setMind] = useState(0);
  const [body, setBody] = useState(0);

  function choose(option: Option) {
    setMind((m) => m + option.mind);
    setBody((b) => b + option.body);
    setStep((s) => s + 1);
  }

  function restart() {
    setStep(0);
    setMind(0);
    setBody(0);
  }

  const done = step >= QUESTIONS.length;
  const result = done ? getResult(mind, body) : null;

  return (
    <div
      className="mk-card mk-pop-in"
      key={step} // replays the pop-in animation on every step/result change
      style={{ width: "100%", maxWidth: 560, display: "flex", flexDirection: "column", gap: 18, textAlign: "left" }}
    >
      {!done ? (
        <>
          <div style={{ display: "flex", gap: 5 }}>
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  background: i <= step ? "#c9a15e" : "#e9e2cc",
                }}
              />
            ))}
          </div>
          <p style={{ fontSize: 11.5, letterSpacing: ".18em", textTransform: "uppercase", color: "#8a7a50", fontWeight: 600 }}>
            Find Your Path &nbsp;·&nbsp; {step + 1} of {QUESTIONS.length}
          </p>
          <h3 className="mk-serif" style={{ fontSize: 21, color: "#26372a", fontWeight: 600 }}>
            {QUESTIONS[step].prompt}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {QUESTIONS[step].options.map((opt) => (
              <button
                key={opt.label}
                onClick={() => choose(opt)}
                style={{
                  textAlign: "left",
                  padding: "13px 16px",
                  borderRadius: 5,
                  border: "1px solid var(--mk-border)",
                  background: "#fffdf7",
                  color: "#26372a",
                  fontSize: 14.5,
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#c9a15e")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--mk-border)")}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        result && (
          <>
            <p style={{ fontSize: 11.5, letterSpacing: ".18em", textTransform: "uppercase", color: "#8a7a50", fontWeight: 600 }}>
              Your Path
            </p>
            <h3 className="mk-serif" style={{ fontSize: 23, color: result.tint, fontWeight: 600 }}>
              {result.title}
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "#4a5a4d" }}>{result.body}</p>
            <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
              <a href={result.href} className="mk-button">
                {result.cta}
              </a>
              <button
                onClick={restart}
                style={{ background: "none", border: "none", color: "#8a9a8d", fontSize: 13, fontWeight: 600, padding: 0 }}
              >
                Retake the quiz
              </button>
            </div>
          </>
        )
      )}
    </div>
  );
}
