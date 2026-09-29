import { redirect, notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NotesManager from "@/components/NotesManager";
import type { Note, Profile } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function ClientNotesPage({ params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const client = await prisma.client.findUnique({ where: { id: params.id } });
  if (!client) notFound();

  const notes = await prisma.note.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <div style={{ width: "100%", background: "#fffdf7", minHeight: "calc(100vh - 66px)" }}>
      <div style={{ padding: "50px 6vw", display: "flex", flexDirection: "column", gap: 24, maxWidth: 780, margin: "0 auto" }}>
        <div>
          <a href="/dashboard" style={{ fontSize: 13, color: "#8a9a8d" }}>
            ← All Clients
          </a>
          <h1 className="mk-serif" style={{ fontSize: 28, color: "#26372a", fontWeight: 600, marginTop: 8 }}>
            {client.name}
          </h1>
          {client.focus && <p style={{ fontSize: 13, color: "#8a7a50", marginTop: 4 }}>{client.focus}</p>}
        </div>

        <NotesManager
          clientId={client.id}
          initialNotes={notes.map((n: Note & { author: Pick<Profile, "name"> }) => ({
            id: n.id,
            body: n.body,
            createdAt: n.createdAt.toISOString(),
            authorName: n.author.name,
          }))}
        />
      </div>
    </div>
  );
}
