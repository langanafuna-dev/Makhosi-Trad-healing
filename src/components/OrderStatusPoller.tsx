"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Yoco's webhook is the source of truth for "paid", and it can land a few
// seconds after the browser redirect back here. Rather than tell the
// customer to hit refresh themselves, this polls quietly and refreshes
// the (server-rendered) page once the status has actually changed.
export default function OrderStatusPoller({ orderId }: { orderId: string }) {
  const router = useRouter();

  useEffect(() => {
    let tries = 0;
    const interval = setInterval(async () => {
      tries += 1;
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const { order } = await res.json();
        if (order.status !== "PENDING") {
          clearInterval(interval);
          router.refresh();
          return;
        }
      }
      if (tries >= 15) clearInterval(interval); // ~30s — after that, a manual refresh is reasonable
    }, 2000);

    return () => clearInterval(interval);
  }, [orderId, router]);

  return null;
}
