"use client";

import { CartProvider } from "@/hooks/useCart";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
