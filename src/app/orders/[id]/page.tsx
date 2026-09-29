import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import OrderStatusPoller from "@/components/OrderStatusPoller";

export const dynamic = "force-dynamic";

function formatRand(cents: number) {
  return `R${(cents / 100).toFixed(2)}`;
}

const STATUS_COPY: Record<string, { title: string; body: string; tint: string }> = {
  PAID: {
    title: "Thank you — your order is confirmed.",
    body: "A confirmation of your order is below. We'll get it packed and on its way.",
    tint: "#3e5541",
  },
  FAILED: {
    title: "That payment didn't go through.",
    body: "Nothing was charged, and your cart is exactly as you left it — you're welcome to try again.",
    tint: "#b23a2e",
  },
  PENDING: {
    title: "Confirming your payment…",
    body: "This usually takes just a few seconds. This page will update on its own.",
    tint: "#8a7a50",
  },
};

export default async function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, zone: true },
  });
  if (!order) notFound();
  if (order.customerId !== user.id && user.role !== "ADMIN") notFound();

  const copy = STATUS_COPY[order.status] ?? STATUS_COPY.PENDING;

  return (
    <div style={{ width: "100%", background: "#fffdf7", minHeight: "calc(100vh - 66px)" }}>
      {order.status === "PENDING" && <OrderStatusPoller orderId={order.id} />}

      <div style={{ padding: "60px 6vw", display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 640, display: "flex", flexDirection: "column", gap: 26 }}>
          <div style={{ textAlign: "center" }}>
            <h1 className="mk-serif" style={{ fontSize: 26, color: copy.tint, fontWeight: 600 }}>
              {copy.title}
            </h1>
            <p style={{ fontSize: 14.5, color: "#4a5a4d", marginTop: 8 }}>{copy.body}</p>
          </div>

          {order.status === "FAILED" && (
            <a href="/checkout" className="mk-button" style={{ alignSelf: "center" }}>
              Try Again
            </a>
          )}

          <div className="mk-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <h3 style={{ fontSize: 15, color: "#26372a", fontWeight: 600 }}>Order #{order.id.slice(-8)}</h3>
            {order.items.map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "#4a5a4d" }}>
                <span>
                  {item.productName} × {item.quantity}
                </span>
                <span>{formatRand(item.unitPriceCents * item.quantity)}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid #e9e2cc", marginTop: 4, paddingTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "#4a5a4d" }}>
                <span>Subtotal</span>
                <span>{formatRand(order.subtotalCents)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: "#4a5a4d" }}>
                <span>Shipping {order.zone ? `(${order.zone.name})` : ""}</span>
                <span>{formatRand(order.shippingFeeCents)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15.5, fontWeight: 700, color: "#26372a" }}>
                <span>Total</span>
                <span>{formatRand(order.totalCents)}</span>
              </div>
            </div>
          </div>

          <div className="mk-card" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <h3 style={{ fontSize: 15, color: "#26372a", fontWeight: 600, marginBottom: 6 }}>Delivering To</h3>
            <p style={{ fontSize: 13.5, color: "#4a5a4d" }}>{order.shippingName} · {order.shippingPhone}</p>
            <p style={{ fontSize: 13.5, color: "#4a5a4d" }}>
              {order.shippingAddressLine1}
              {order.shippingAddressLine2 ? `, ${order.shippingAddressLine2}` : ""}
            </p>
            <p style={{ fontSize: 13.5, color: "#4a5a4d" }}>
              {order.shippingCity}, {order.shippingProvince} {order.shippingPostalCode}
            </p>
          </div>

          <a href="/orders" style={{ fontSize: 13, color: "#8a9a8d", textAlign: "center" }}>
            View all my orders →
          </a>
        </div>
      </div>
    </div>
  );
}
