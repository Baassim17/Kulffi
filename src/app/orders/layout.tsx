import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Orders — Kulffi",
  description: "View your Kulffi order history and track delivery status in real-time.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
