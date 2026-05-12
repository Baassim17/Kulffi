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
    if (!menuRef.current) return;

    if (menuOpen) {
      gsap.set(menuRef.current, { display: "flex", pointerEvents: "auto", opacity: 0 });
      const tl = gsap.timeline();
      
      // Fast fade-in for background
      tl.to(menuRef.current, 
        { opacity: 1, duration: 0.25, ease: "power2.out" }
      );
      
      // Fast glide up for links, starting almost immediately
      tl.fromTo(menuRef.current.querySelectorAll(".menu-link-inner"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, stagger: 0.03, ease: "power3.out" },
        0.05
      );

      // Fast fade for footer
      tl.fromTo(menuRef.current.querySelectorAll(".menu-fade"),
        { opacity: 0 },
        { opacity: 1, duration: 0.3 },
        0.15
      );
    } else {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(menuRef.current, { display: "none", pointerEvents: "none" });
        }
      });
      
      // Fast glide down and fade out
      tl.to(menuRef.current.querySelectorAll(".menu-link-inner"), {
        y: 10, opacity: 0, duration: 0.2, stagger: -0.02, ease: "power2.in"
      });
      
      tl.to(menuRef.current.querySelectorAll(".menu-fade"), {
        opacity: 0, duration: 0.2
      }, 0);
      
      tl.to(menuRef.current, {
        opacity: 0, duration: 0.25, ease: "power2.out"
      }, 0.1);
    }
  }, [menuOpen]);

  const scrollTo = useCallback((id: string) => {
    setMenuOpen(false);
    if (lenisRef.current) {
      const el = document.querySelector(id) as HTMLElement | null;
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

      {/* Overlay Menu */}
      <div
        ref={menuRef}
        className="fixed inset-0 z-[60] hidden flex-col items-center justify-center bg-[#FCE9D5]/95 backdrop-blur-md text-[#A31D1D] pointer-events-none"
      >
        {/* Close Button */}
        <button 
          className="absolute top-8 right-8 md:top-12 md:right-12 z-50 text-[#A31D1D] hover:rotate-90 transition-transform duration-500"
          onClick={() => setMenuOpen(false)}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        {/* Main Links */}
        <nav className="flex flex-col items-center gap-6 md:gap-8">
          {[...NAV_ITEMS, { id: "/orders", label: "Track Orders" }].map((item) => (
            <div key={item.id} className="overflow-hidden">
              {item.id.startsWith("/") ? (
                <Link
                  href={item.id}
                  onClick={() => setMenuOpen(false)}
                  className="menu-link-inner block font-blenny text-4xl md:text-5xl tracking-wide text-[#A31D1D] transition-all duration-500 hover:text-[#A31D1D]/60 hover:-translate-y-1"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  onClick={() => scrollTo(item.id)}
                  className="menu-link-inner block font-blenny text-4xl md:text-5xl tracking-wide text-[#A31D1D] transition-all duration-500 hover:text-[#A31D1D]/60 hover:-translate-y-1"
                >
                  {item.label}
                </button>
              )}
            </div>
          ))}
        </nav>
        
        {/* Simple Footer */}
        <div className="absolute bottom-10 menu-fade flex flex-col items-center gap-2">
          <p className="font-display text-xs tracking-[0.2em] uppercase text-[#A31D1D]/60 text-center">
             hello@kulffi.com
          </p>
          <div className="flex gap-4 font-display text-[10px] tracking-widest uppercase text-[#A31D1D]/40">
            <a href="#" className="hover:text-[#A31D1D] transition-colors">INSTA</a>
            <a href="#" className="hover:text-[#A31D1D] transition-colors">TIKTOK</a>
          </div>
        </div>
      </div>
    </>
  );
}
