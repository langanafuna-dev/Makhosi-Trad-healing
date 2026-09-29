import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatRand(cents: number) {
  return `R${(cents / 100).toFixed(2)}`;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Confirming payment",
  PAID: "Paid",
  FAILED: "Payment failed",
};

export default async function OrdersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div style={{ width: "100%", background: "#fffdf7", minHeight: "calc(100vh - 66px)" }}>
      <div style={{ padding: "50px 6vw", display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <div style={{ fontSize: 13, letterSpacing: ".2em", textTransform: "uppercase", color: "#7a3e20", fontWeight: 600 }}>
            Herbal &amp; Holistic
          </div>
          <h1 className="mk-serif" style={{ fontSize: 30, color: "#26372a", fontWeight: 600, marginTop: 6 }}>
            My Orders
          </h1>
        </div>

        {orders.length === 0 ? (
          <div className="mk-card" style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 14, maxWidth: 480 }}>
            <p style={{ fontSize: 15, color: "#4a5a4d" }}>No orders yet.</p>
            <a href="/herbal-holistic" className="mk-button" style={{ alignSelf: "center" }}>
              Browse Products
            </a>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 640 }}>
            {orders.map((order) => (
              <a
                key={order.id}
                href={`/orders/${order.id}`}
                className="mk-card mk-card-hover"
                style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10, color: "#26372a" }}
              >
                <div>
                  <p style={{ fontSize: 14.5, fontWeight: 600 }}>
                    Order #{order.id.slice(-8)} · {order.items.length} item{order.items.length === 1 ? "" : "s"}
                  </p>
                  <p style={{ fontSize: 12.5, color: "#8a9a8d" }}>
                    {new Date(order.createdAt).toLocaleDateString()} · {STATUS_LABEL[order.status] ?? order.status}
                    {order.status === "PAID" && order.fulfillment === "SHIPPED" ? " · Shipped" : ""}
                  </p>
                </div>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{formatRand(order.totalCents)}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
