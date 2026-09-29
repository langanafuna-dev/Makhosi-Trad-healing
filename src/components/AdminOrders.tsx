"use client";

import { useEffect, useState } from "react";
import { useToast } from "./Toast";

type AdminOrder = {
  id: string;
  status: string;
  fulfillment: string;
  totalCents: number;
  createdAt: string;
  shippingName: string;
  shippingPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2: string;
  shippingCity: string;
  shippingProvince: string;
  shippingPostalCode: string;
  customer: { name: string };
  items: { productName: string; quantity: number }[];
  zone: { name: string } | null;
};

function formatRand(cents: number) {
  return `R${(cents / 100).toFixed(2)}`;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const { show } = useToast();

  function refresh() {
    fetch("/api/orders?scope=admin")
      .then((res) => res.json())
      .then((data) => setOrders(data.orders ?? []));
  }

  useEffect(refresh, []);

  async function toggleFulfillment(order: AdminOrder) {
    const next = order.fulfillment === "SHIPPED" ? "UNFULFILLED" : "SHIPPED";
    setOrders((list) => list?.map((o) => (o.id === order.id ? { ...o, fulfillment: next } : o)) ?? null);
    await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fulfillment: next }),
    });
    show(next === "SHIPPED" ? "Marked as shipped." : "Marked as unfulfilled.");
  }

  if (orders === null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[0, 1].map((i) => (
          <div key={i} className="mk-skeleton" style={{ height: 90 }} />
        ))}
      </div>
    );
  }

  const paid = orders.filter((o) => o.status === "PAID");

  if (paid.length === 0) {
    return <p style={{ fontSize: 14, color: "#8a9a8d", fontStyle: "italic" }}>No paid orders yet.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {paid.map((order) => (
        <div key={order.id} className="mk-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10 }}>
            <div>
              <p style={{ fontSize: 14.5, fontWeight: 600, color: "#26372a" }}>
                {order.customer.name} — Order #{order.id.slice(-8)}
              </p>
              <p style={{ fontSize: 12.5, color: "#8a9a8d" }}>
                {order.items.map((i) => `${i.productName} × ${i.quantity}`).join(", ")}
              </p>
              <p style={{ fontSize: 12.5, color: "#8a9a8d" }}>
                {order.shippingAddressLine1}
                {order.shippingAddressLine2 ? `, ${order.shippingAddressLine2}` : ""}, {order.shippingCity},{" "}
                {order.shippingProvince} {order.shippingPostalCode} · {order.shippingPhone}
                {order.zone ? ` · ${order.zone.name}` : ""}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#26372a" }}>{formatRand(order.totalCents)}</span>
              <button
                onClick={() => toggleFulfillment(order)}
                className={order.fulfillment === "SHIPPED" ? "mk-button secondary" : "mk-button"}
                style={{ padding: "6px 14px", fontSize: 12 }}
              >
                {order.fulfillment === "SHIPPED" ? "Shipped ✓" : "Mark Shipped"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
