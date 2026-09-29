import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import CartManager from "@/components/CartManager";
import FormMessage from "@/components/FormMessage";

export const dynamic = "force-dynamic";

export default async function CartPage({ searchParams }: { searchParams?: { checkout?: string } }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    include: { product: true },
  });

  return (
    <div style={{ width: "100%", background: "#fffdf7", minHeight: "calc(100vh - 66px)" }}>
      <div style={{ padding: "50px 6vw", display: "flex", flexDirection: "column", gap: 30 }}>
        <div>
          <div style={{ fontSize: 13, letterSpacing: ".2em", textTransform: "uppercase", color: "#7a3e20", fontWeight: 600 }}>
            Herbal &amp; Holistic
          </div>
          <h1 className="mk-serif" style={{ fontSize: 30, color: "#26372a", fontWeight: 600, marginTop: 6 }}>
            Your Cart
          </h1>
        </div>

        {searchParams?.checkout === "cancelled" && (
          <div style={{ maxWidth: 640, margin: "0 auto", width: "100%" }}>
            <FormMessage type="error">Checkout was cancelled — your cart is still here whenever you're ready.</FormMessage>
          </div>
        )}

        <CartManager
          initialItems={items
            .filter((i) => i.product.priceCents != null)
            .map((i) => ({
              productId: i.productId,
              name: i.product.name,
              imageUrl: i.product.imageUrl,
              unitPriceCents: i.product.priceCents!,
              quantity: i.quantity,
            }))}
        />
      </div>
    </div>
  );
}
