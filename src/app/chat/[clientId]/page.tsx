import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

/**
 * UI-ONLY SCREEN. The messages below are placeholders — this page does
 * not send or receive anything yet.
 *
 * To make this real: stand up the WhatsApp Business Platform (Cloud
 * API), point its webhook at src/app/api/whatsapp/webhook/route.ts
 * (stubbed there), and store incoming/outgoing messages in a Message
 * model (add one to prisma/schema.prisma) keyed by clientId. This page
 * would then read from that table instead of the array below.
 * See README "Where this can go next" for the full checklist.
 */
export default async function ChatPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const messages = [
    { fromMe: false, text: "[PLACEHOLDER] Good morning — just checking in. How did the week feel after our last conversation?", time: "08:12" },
    { fromMe: true, text: "[PLACEHOLDER] Better than last week, thank you for asking. Still working through it, but I felt calmer.", time: "08:40" },
    { fromMe: false, text: "[PLACEHOLDER] That's real progress. Let's build on that in our next check-in.", time: "08:43" },
  ];

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "40px 16px", background: "#f0e9d6", minHeight: "calc(100vh - 66px)" }}>
      <div style={{ width: "100%", maxWidth: 390, height: "min(700px, 80vh)", background: "#f0e9d6", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 10px 40px rgba(0,0,0,0.15)" }}>
        <div style={{ background: "#26372a", padding: "18px 18px 14px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#c9a15e", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, color: "#26372a", flexShrink: 0 }}>
            BL
          </div>
          <div>
            <div style={{ color: "#faf6ec", fontSize: 15, fontWeight: 600 }}>Bongiwe Langa</div>
            <div style={{ color: "#b7c4b9", fontSize: 11.5 }}>Journey Home Healing · not yet connected to WhatsApp</div>
          </div>
        </div>

        <div style={{ flexGrow: 1, padding: 16, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.fromMe ? "flex-end" : "flex-start",
                maxWidth: "78%",
                background: m.fromMe ? "#7a3e20" : "#fffdf7",
                color: m.fromMe ? "#faf6ec" : "#26372a",
                padding: "10px 14px",
                borderRadius: m.fromMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
              }}
            >
              <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5 }}>{m.text}</p>
              <span style={{ display: "block", marginTop: 4, fontSize: 10.5, textAlign: "right", opacity: 0.7 }}>{m.time}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: "10px 12px 16px", display: "flex", gap: 10, borderTop: "1px solid #e3d7b6" }}>
          <input className="mk-input" placeholder="Message… (not yet wired up)" disabled style={{ borderRadius: 20 }} />
        </div>
      </div>
    </div>
  );
}
