"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Preloader from "@/components/animations/Preloader";
import SmoothScroll from "@/components/animations/SmoothScroll";
import CustomCursor from "@/components/animations/CustomCursor";
import GrainOverlay from "@/components/animations/GrainOverlay";
import Header from "@/components/sections/Header";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Flavors from "@/components/sections/Flavors";
import Story from "@/components/sections/Story";
import PopsicleHero from "@/components/sections/PopsicleHero";
import Contact from "@/components/sections/Contact";
import CartDrawer from "@/components/shared/CartDrawer";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { initScrollAnimations } from "@/lib/animations";

const ChocoBar = dynamic(() => import("@/components/sections/ChocoBar"), {
  ssr: false,
  loading: () => (
    <section className="flex items-center justify-center" style={{ height: "100vh", backgroundColor: "#FDF0DE" }}>
      <p className="text-xs tracking-widest uppercase text-[#A31D1D]/40">Loading...</p>
    </section>
  ),
});

export default function HomeClient() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    ScrollTrigger.refresh();
    const timer = setTimeout(() => {
      initScrollAnimations();
    }, 50);
    return () => clearTimeout(timer);
  }, [loaded]);

  // bfcache support: restore scroll position when user returns via back/forward
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        // Page was restored from bfcache — refresh ScrollTrigger
        ScrollTrigger.refresh();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return (
    <SmoothScroll>
      <Preloader onComplete={() => setLoaded(true)} />
      <div
        style={{
          opacity: loaded ? 1 : 0,
          pointerEvents: loaded ? "auto" : "none",
          transition: loaded ? "opacity 0.5s ease-out" : undefined,
        }}
      >
        <CustomCursor />
        <GrainOverlay />
        <Header />
        <main>
          <ErrorBoundary>
            <Hero loaded={loaded} />
          </ErrorBoundary>
          <ErrorBoundary>
            <About />
          </ErrorBoundary>
          <ErrorBoundary>
            <Flavors />
          </ErrorBoundary>
          <ErrorBoundary>
            <Story />
          </ErrorBoundary>
          <ErrorBoundary>
            <ChocoBar />
          </ErrorBoundary>
          <ErrorBoundary>
            <PopsicleHero>
              <Contact layered />
            </PopsicleHero>
          </ErrorBoundary>
        </main>
        <CartDrawer />
      </div>
    </SmoothScroll>
  );
}
