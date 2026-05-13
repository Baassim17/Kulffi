"use client";

import { useRef, useEffect, useState } from "react";
import { useChocoScene } from "@/hooks/useChocoScene";
import { FLAVORS } from "@/lib/choco/flavors";
import { lenisRef } from "@/lib/lenis";

/** Clamp */
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Ease-out cubic for reveal */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Get raw target progress for a text block based on scroll */
function getRawBlockProgress(scrollProgress: number, textIndex: number): number {
  const p = clamp(scrollProgress, 0, 1);
  const phaseStart = textIndex * 0.20;
  const phaseEnd = phaseStart + 0.20;
  const revealStart = phaseStart;
  const holdStart = phaseStart + 0.12;
  const exitStart = phaseEnd - 0.06;

  if (p < revealStart) return 0;
  if (p < holdStart) return (p - revealStart) / (holdStart - revealStart);
  if (p < exitStart) return 1;
  if (p < phaseEnd) return 1 - (p - exitStart) / (phaseEnd - exitStart);
  return 0;
}

export default function ChocoBar() {
  const sectionRef = useRef<HTMLElement>(null);
  const { canvasRef, isLoading, loadFlavor, activeFlavorIndex, scrollRef } = useChocoScene();

  const rawScrollRef = useRef(0);
  const smoothScrollRef = useRef(0);

  // Text block refs
  const containerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wordRefs = useRef<(HTMLSpanElement | null)[][]>(
    Array.from({ length: 5 }, () => [null, null, null])
  );
  const descRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const currentFlavor = FLAVORS[activeFlavorIndex];

  // Track flavor switch for cross-fade
  const [isSwitching, setIsSwitching] = useState(false);

  // Unified scroll + text animation loop
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let rafId: number;
    let isVisible = true;

    // Cache section dimensions to avoid forced layout on every scroll event
    const sectionDims = { top: 0, height: 0, vh: window.innerHeight };
    const updateDims = () => {
      const rect = section.getBoundingClientRect();
      sectionDims.top = rect.top;
      sectionDims.height = rect.height;
      sectionDims.vh = window.innerHeight;
    };

    const onScroll = () => {
      sectionDims.top = section.getBoundingClientRect().top;
      rawScrollRef.current = Math.max(0, Math.min(1, -sectionDims.top / (sectionDims.height - sectionDims.vh)));
    };

    const resizeObs = new ResizeObserver(updateDims);
    resizeObs.observe(section);
    updateDims();

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) updateDims();
      },
      { threshold: 0 }
    );
    observer.observe(section);

    const loop = () => {
      rafId = requestAnimationFrame(loop);
      if (!isVisible) return;

      // Dimension updates come from ResizeObserver + onScroll; no getBoundingClientRect in rAF

      // Single smoothing layer shared with 3D
      smoothScrollRef.current += (rawScrollRef.current - smoothScrollRef.current) * 0.08;
      scrollRef.current = smoothScrollRef.current;
      const sp = smoothScrollRef.current;

      currentFlavor.textBlocks.forEach((block, index) => {
        const rawProgress = getRawBlockProgress(sp, index);
        const easedProgress = easeOutCubic(rawProgress);

        // Container transform (GPU-only: opacity + translate3d + scale)
        const container = containerRefs.current[index];
        if (container) {
          const direction = block.side === "left" ? -1 : 1;
          const offset = (1 - easedProgress) * 80 * direction;
          const parallax = (1 - easedProgress) * 20;
          const scale = 0.94 + easedProgress * 0.06;
          const opacity = easedProgress > 0.001 ? easedProgress : 0;

          container.style.opacity = String(Math.max(0, opacity));
          container.style.transform = `translate3d(${offset}px, ${parallax}px, 0) scale(${scale})`;
        }

        // Word stagger — only translateY, parent overflow:hidden handles clipping
        block.headline.forEach((_, wi) => {
          const wordDelay = wi * 0.05;
          let targetWordProgress = 0;
          if (easedProgress > wordDelay) {
            targetWordProgress = clamp((easedProgress - wordDelay) / (0.7 - wordDelay), 0, 1);
            targetWordProgress = easeOutCubic(targetWordProgress);
          }

          const wordEl = wordRefs.current[index]?.[wi];
          if (wordEl) {
            wordEl.style.transform = `translate3d(0, ${(1 - targetWordProgress) * 50}px, 0)`;
          }
        });

        // Description — no blur, only opacity + translateY
        const descDelay = 0.25;
        let targetDescProgress = 0;
        if (easedProgress > descDelay) {
          targetDescProgress = clamp((easedProgress - descDelay) / 0.4, 0, 1);
          targetDescProgress = easeOutCubic(targetDescProgress);
        }

        const descEl = descRefs.current[index];
        if (descEl) {
          descEl.style.opacity = String(Math.max(0, targetDescProgress));
          descEl.style.transform = `translate3d(0, ${(1 - targetDescProgress) * 20}px, 0)`;
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
      observer.disconnect();
      resizeObs.disconnect();
    };
  }, [currentFlavor, scrollRef]);

  const handleFlavorSwitch = (index: number) => {
    if (index === activeFlavorIndex || isLoading) return;

    const el = document.getElementById("choco-scroll-section");
    if (!el) return;

    // 1. Fade text out
    setIsSwitching(true);

    // 2. Instant scroll to top of section via Lenis (syncs ScrollTrigger + our refs)
    const sectionTop = el.offsetTop;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(sectionTop, { immediate: true });
    } else {
      window.scrollTo({ top: sectionTop, behavior: "instant" });
    }

    // 3. Reset scroll refs immediately so text starts at Phase 1
    rawScrollRef.current = 0;
    smoothScrollRef.current = 0;
    scrollRef.current = 0;

    // 4. Switch model after text fade-out completes
    setTimeout(() => {
      loadFlavor(index);
      setIsSwitching(false);
    }, 250);
  };

  return (
    <section
      ref={sectionRef}
      id="choco-scroll-section"
      className="relative"
      style={{ height: "500vh", backgroundColor: "#FDF0DE" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden" style={{ backgroundColor: "#FDF0DE" }}>
        {/* 3D Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none" style={{ backgroundColor: "rgba(253, 240, 222, 0.5)" }}>
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-[3px] border-[#A31D1D]/20 border-t-[#A31D1D] animate-spin" />
              <span className="text-xs tracking-widest uppercase text-[#A31D1D]/70">
                Loading 3D model...
              </span>
            </div>
          </div>
        )}

        {/* Text Blocks */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ opacity: isSwitching ? 0 : 1 }}
        >
          {currentFlavor.textBlocks.map((block, index) => (
            <div
              key={`${activeFlavorIndex}-${index}`}
              ref={(el) => { containerRefs.current[index] = el; }}
              className={`pointer-events-none absolute top-0 h-full flex items-start pt-[12vh] sm:pt-[15vh] md:pt-0 md:items-center w-full md:w-auto px-4 md:px-0 justify-center md:justify-start ${
                block.side === "left"
                  ? "left-0 md:pl-16 lg:pl-24"
                  : "right-0 md:pr-16 lg:pr-24"
              }`}
              style={{ opacity: 0, willChange: "transform, opacity" }}
            >
              <div className={`max-w-[300px] md:max-w-[380px] lg:max-w-[440px] ${
                block.side === "left" ? "text-left" : "text-right"
              }`}>
                {/* Stacked headline */}
                <h2 className="font-serif font-bold leading-[0.92] tracking-tight mb-5 md:mb-6">
                  {block.headline.map((word, wi) => (
                    <span key={wi} className="block overflow-hidden">
                      <span
                        ref={(el) => {
                          if (!wordRefs.current[index]) wordRefs.current[index] = [];
                          wordRefs.current[index][wi] = el;
                        }}
                        className="inline-block"
                        style={{
                          color: "#A31D1D",
                          fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)",
                          transform: "translate3d(0, 50px, 0)",
                          willChange: "transform",
                        }}
                      >
                        {word}
                      </span>
                    </span>
                  ))}
                </h2>

                {/* Description — no blur, GPU-only properties */}
                <p
                  ref={(el) => { descRefs.current[index] = el; }}
                  className="leading-[1.6]"
                  style={{
                    color: "#A31D1D",
                    fontSize: "clamp(0.95rem, 1.2vw, 1.15rem)",
                    opacity: 0,
                    transform: "translate3d(0, 20px, 0)",
                    willChange: "transform, opacity",
                  }}
                >
                  {block.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Flavor Switcher Pills */}
        <div className="absolute bottom-10 md:bottom-14 left-0 right-0 z-20 flex justify-center px-4">
          <div
            className="flex items-center gap-2 overflow-x-auto px-2 py-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {FLAVORS.map((flavor, i) => {
              const isActive = i === activeFlavorIndex;
              return (
                <button
                  key={flavor.id}
                  onClick={() => handleFlavorSwitch(i)}
                  disabled={isLoading && !isActive}
                  className={`shrink-0 px-4 py-2 rounded-full text-[11px] font-semibold tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    isActive
                      ? "bg-[#A31D1D] text-[#FDF0DE] scale-105"
                      : "bg-transparent text-[#C4785C] border border-[rgba(163,29,29,0.25)] hover:border-[#A31D1D] hover:text-[#A31D1D]"
                  }`}
                  style={{
                    boxShadow: isActive ? "0 4px 20px rgba(163, 29, 29, 0.2)" : "none",
                  }}
                >
                  {isLoading && !isActive ? (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full border border-current border-t-transparent animate-spin inline-block" />
                      {flavor.name}
                    </span>
                  ) : (
                    flavor.name
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
