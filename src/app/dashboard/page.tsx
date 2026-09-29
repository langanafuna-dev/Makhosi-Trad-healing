import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ClientManager from "@/components/ClientManager";
import AdminBookings from "@/components/AdminBookings";
import TestimonialModeration from "@/components/TestimonialModeration";
import AdminOrders from "@/components/AdminOrders";
import ShippingZoneManager from "@/components/ShippingZoneManager";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/login");

  const [clients, zones] = await Promise.all([
    prisma.client.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.shippingZone.findMany({ orderBy: { feeCents: "asc" } }),
  ]);

  return (
    <div style={{ width: "100%", background: "#fffdf7", minHeight: "calc(100vh - 66px)" }}>
      <div style={{ padding: "50px 6vw", display: "flex", flexDirection: "column", gap: 46 }}>
        <div>
          <div style={{ fontSize: 13, letterSpacing: ".2em", textTransform: "uppercase", color: "#7a3e20", fontWeight: 600 }}>
            Practitioner Dashboard
          </div>
          <h1 className="mk-serif" style={{ fontSize: 30, color: "#26372a", fontWeight: 600, marginTop: 6 }}>
            Your Clients
          </h1>
        </div>

        <ClientManager initialClients={clients} />

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 className="mk-serif" style={{ fontSize: 22, color: "#26372a", fontWeight: 600 }}>
            Upcoming Bookings
          </h2>
          <p style={{ fontSize: 13.5, color: "#8a9a8d", marginTop: -10 }}>
            To open or remove consultation times, visit the booking section on the{" "}
            <a href="/journey-home">Journey Home Healing</a> page — you&apos;ll see the admin controls there too.
          </p>
          <AdminBookings />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 className="mk-serif" style={{ fontSize: 22, color: "#26372a", fontWeight: 600 }}>
            Testimonials Awaiting Review
          </h2>
          <TestimonialModeration />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 className="mk-serif" style={{ fontSize: 22, color: "#26372a", fontWeight: 600 }}>
            Orders To Fulfill
          </h2>
          <AdminOrders />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h2 className="mk-serif" style={{ fontSize: 22, color: "#26372a", fontWeight: 600 }}>
            Delivery Zones
          </h2>
          <p style={{ fontSize: 13.5, color: "#8a9a8d", marginTop: -10 }}>
            These are the courier fee options customers choose from at checkout.
          </p>
          <ShippingZoneManager
            initialZones={zones.map((z) => ({ id: z.id, name: z.name, description: z.description, feeCents: z.feeCents }))}
          />
        </div>
      </div>
    </div>
  );
}
