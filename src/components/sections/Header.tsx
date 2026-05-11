"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import gsap from "gsap";
import { useCart } from "@/hooks/useCart";
import { ShoppingBag, Package } from "lucide-react";
import Link from "next/link";
import { NAV_ITEMS } from "@/lib/constants/navigation";
import { lenisRef } from "@/lib/lenis";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { totalCount, setIsOpen } = useCart();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (menuOpen && menuRef.current) {
      gsap.fromTo(
        menuRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
      gsap.fromTo(
        menuRef.current.querySelectorAll("a, button"),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, delay: 0.1 }
      );
    }
  }, [menuOpen]);

  const scrollTo = useCallback((id: string) => {
    setMenuOpen(false);
    if (lenisRef.current) {
      const el = document.querySelector(id);
      if (el) lenisRef.current.scrollTo(el, { offset: 0, duration: 1.2 });
    } else {
      const el = document.querySelector(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-start justify-between px-6 py-6 md:px-12 bg-transparent pointer-events-none"
      >
        {/* Logo: Kulffi */}
        <a
          href="#"
          className="pointer-events-auto flex flex-col items-start leading-[0.8] tracking-tighter mt-2"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <span className="font-blenny text-4xl md:text-5xl text-[#A31D1D] drop-shadow-[2px_2px_0_#FCE9D5] md:drop-shadow-[3px_3px_0_#FCE9D5]">
            KULFFI
          </span>
        </a>

        {/* Cartoonish Navigation Buttons */}
        <div className="flex items-start gap-4 pointer-events-auto">
          
          <div className="flex items-center gap-4">
            {/* Orders Button */}
            <Link
              href="/orders"
              className="group hidden sm:flex items-center gap-3 px-5 py-2.5 bg-[#FCE9D5] border-2 border-[#A31D1D] rounded-full text-[#A31D1D] font-display font-bold text-[13px] uppercase tracking-[0.15em] shadow-[4px_4px_0_#A31D1D] transition-all duration-300 hover:bg-[#A31D1D] hover:text-[#FCE9D5] hover:-translate-y-1 hover:shadow-[6px_6px_0_#2A1810] active:translate-y-[2px] active:shadow-[2px_2px_0_#2A1810]"
            >
              <div className="flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Package className="h-[15px] w-[15px]" strokeWidth={2} />
              </div>
              <span>Orders</span>
            </Link>

            {/* Cart Button — Desktop & Mobile */}
            <button 
              onClick={() => setIsOpen(true)}
              className="group flex items-center gap-3 px-5 py-2.5 bg-[#FCE9D5] border-2 border-[#A31D1D] rounded-full text-[#A31D1D] font-display font-bold text-[13px] uppercase tracking-[0.15em] shadow-[4px_4px_0_#A31D1D] transition-all duration-300 hover:bg-[#A31D1D] hover:text-[#FCE9D5] hover:-translate-y-1 hover:shadow-[6px_6px_0_#2A1810] active:translate-y-[2px] active:shadow-[2px_2px_0_#2A1810]"
            >
              <div className="flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <ShoppingBag className="h-[15px] w-[15px]" strokeWidth={2} />
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-[#A31D1D] group-hover:bg-[#FCE9D5] transition-colors duration-300" />
              <div className="flex items-center justify-center transition-transform duration-300 group-hover:scale-110 min-w-[1ch]">
                {totalCount}
              </div>
            </button>

          </div>

          {/* Menu Button (Desktop & Mobile) */}
          <button 
            className="group flex items-center gap-4 px-6 py-2.5 bg-[#FCE9D5] border-2 border-[#A31D1D] rounded-full text-[#A31D1D] font-display font-bold text-[13px] uppercase tracking-[0.15em] shadow-[4px_4px_0_#A31D1D] transition-all duration-300 hover:bg-[#A31D1D] hover:text-[#FCE9D5] hover:-translate-y-1 hover:shadow-[6px_6px_0_#2A1810] active:translate-y-[2px] active:shadow-[2px_2px_0_#2A1810]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">Menu</span>
            <div className="relative flex flex-col justify-between w-[22px] h-[12px]">
              <span className="absolute top-0 left-0 h-[2px] w-full bg-[#A31D1D] transition-all duration-300 group-hover:bg-[#FCE9D5] group-hover:top-1/2 group-hover:-translate-y-1/2" />
              <span className="absolute top-1/2 -translate-y-1/2 left-0 h-[2px] w-full bg-[#A31D1D] transition-all duration-300 group-hover:bg-[#FCE9D5]" />
              <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#A31D1D] transition-all duration-300 group-hover:bg-[#FCE9D5] group-hover:bottom-1/2 group-hover:translate-y-1/2" />
            </div>
          </button>

        </div>
      </header>

      {menuOpen && (
        <div
          ref={menuRef}
          className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#FCE9D5]/95 backdrop-blur-lg border-[10px] border-[#A31D1D]"
        >
          <button 
            className="absolute top-8 right-8 md:top-12 md:right-12 text-[#A31D1D]"
            onClick={() => setMenuOpen(false)}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          <nav className="flex flex-col items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="font-blenny text-4xl text-[#A31D1D] transition-transform hover:scale-110 hover:drop-shadow-[4px_4px_0_rgba(163,29,29,0.3)] md:text-6xl"
              >
                {item.label}
              </button>
            ))}
            <Link
              href="/orders"
              onClick={() => setMenuOpen(false)}
              className="font-blenny text-4xl text-[#A31D1D] transition-transform hover:scale-110 hover:drop-shadow-[4px_4px_0_rgba(163,29,29,0.3)] md:text-6xl"
            >
              Track Orders
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
