import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import CheckoutForm from "@/components/CheckoutForm";
import FormMessage from "@/components/FormMessage";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ searchParams }: { searchParams?: { error?: string } }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [cartItems, zones] = await Promise.all([
    prisma.cartItem.findMany({ where: { userId: user.id }, include: { product: true } }),
    prisma.shippingZone.findMany({ orderBy: { feeCents: "asc" } }),
  ]);

  const items = cartItems.filter((i) => i.product.priceCents != null);
  if (items.length === 0) redirect("/cart");

  return (
    <div style={{ width: "100%", background: "#fffdf7", minHeight: "calc(100vh - 66px)" }}>
      <div style={{ padding: "50px 6vw", display: "flex", flexDirection: "column", gap: 30 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, letterSpacing: ".2em", textTransform: "uppercase", color: "#7a3e20", fontWeight: 600 }}>
            Herbal &amp; Holistic
          </div>
          <h1 className="mk-serif" style={{ fontSize: 30, color: "#26372a", fontWeight: 600, marginTop: 6 }}>
            Checkout
          </h1>
        </div>

        {searchParams?.error === "payment_failed" && (
          <div style={{ maxWidth: 720, margin: "0 auto", width: "100%" }}>
            <FormMessage type="error">
              Your payment didn&apos;t go through. Your cart wasn&apos;t touched — please try again.
            </FormMessage>
          </div>
        )}

        <CheckoutForm
          items={items.map((i) => ({
            productId: i.productId,
            name: i.product.name,
            unitPriceCents: i.product.priceCents!,
            quantity: i.quantity,
          }))}
          zones={zones.map((z) => ({ id: z.id, name: z.name, description: z.description, feeCents: z.feeCents }))}
        />
      </div>
    </div>
  );
}
