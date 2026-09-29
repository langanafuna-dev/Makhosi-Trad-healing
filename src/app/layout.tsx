import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import "../styles/globals.css";
import Navbar from "@/components/Navbar";
import { ToastProvider } from "@/components/Toast";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const description =
  "Journey Home Healing and Makosi Herbal & Holistic Products — one family, two branches. Ongoing emotional support, traditional herbal remedies, one account either way.";

export const metadata: Metadata = {
  title: "Makosi Traditional Healing",
  description,
  openGraph: {
    title: "Makosi Traditional Healing",
    description,
    type: "website",
    locale: "en_ZA",
  },
};

// Next.js only emits the <meta name="viewport"> tag from exactly what's
// listed here — width/initialScale don't come free once you add a custom
// viewport export, so they're spelled out explicitly. Without this, phones
// render the page at desktop width and zoom out, which would undo the
// responsive work in globals.css entirely.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#26372a",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  const cartCount = user
    ? await prisma.cartItem.aggregate({ where: { userId: user.id }, _sum: { quantity: true } })
    : null;

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Work+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ToastProvider>
          <Navbar user={user} cartCount={cartCount?._sum.quantity ?? 0} />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
