"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CircularButton from "@/components/shared/CircularButton";
import Marquee from "@/components/sections/Marquee";
import { ArrowDown } from "lucide-react";

interface HeroProps {
  loaded?: boolean;
}

export default function Hero({ loaded = false }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const scrollDownRef = useRef<HTMLDivElement>(null);

  // ── Scroll-driven morph animation (runs immediately) ──
  useEffect(() => {
    const section = sectionRef.current;
    const inner = innerRef.current;
    const imageWrap = imageWrapRef.current;
    const img = imgRef.current;
    const overlay = overlayRef.current;
    const headline = headlineRef.current;
    const content = contentRef.current;
    const scrollDown = scrollDownRef.current;

    if (!section || !inner || !imageWrap || !img) return;

    const tweens: gsap.core.Tween[] = [];
    const triggers: ScrollTrigger[] = [];

    const mm = gsap.matchMedia();

    // Desktop: exact Mr.Pops scroll-morph behaviour
    mm.add("(min-width: 900px)", () => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=130%",
          pin: inner,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      if (scrollTl.scrollTrigger) triggers.push(scrollTl.scrollTrigger);

      // 0-30%: image stays full-bleed, subtle parallax scale
      scrollTl.fromTo(
        img,
        { scale: 1 },
        { scale: 1.25, ease: "none" },
        0
      );

      // 15-75%: image container shrinks via clip-path from full-bleed to centered frame
      scrollTl.fromTo(
        imageWrap,
        { clipPath: "inset(0% 0% 0% 0% round 0px)" },
        { clipPath: "inset(12% 27.5% 12% 27.5% round 24px)", ease: "none" },
        0.15
      );

      // 0-20%: scroll indicator fades out immediately
      if (scrollDown) {
        scrollTl.fromTo(
          scrollDown,
          { opacity: 1 },
          { opacity: 0, ease: "power2.in" },
          0
        );
      }

      // 20-60%: headline moves up and exits (faster than image shrink)
      if (headline) {
        scrollTl.fromTo(
          headline,
          { y: "0%", opacity: 1 },
          { y: "-60vh", opacity: 0, ease: "power2.in" },
          0.2
        );
      }

      // 25-55%: side content fades out
      if (content) {
        scrollTl.fromTo(
          content,
          { y: "0%", opacity: 1 },
          { y: "-30vh", opacity: 0, ease: "power2.in" },
          0.25
        );
      }

      // 30-80%: dark overlay fades to transparent so espresso background shows around frame
      if (overlay) {
        scrollTl.fromTo(
          overlay,
          { opacity: 0.5 },
          { opacity: 0, ease: "none" },
          0.3
        );
      }

      return () => {
        scrollTl.kill();
        if (scrollTl.scrollTrigger) {
          scrollTl.scrollTrigger.kill();
        }
      };
    });

    // Mobile: simpler parallax without pin
    mm.add("(max-width: 899px)", () => {
      const imgTween = gsap.to(img, {
        scale: 1.1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      if (imgTween.scrollTrigger) triggers.push(imgTween.scrollTrigger);

      if (headline && content) {
        const textTween = gsap.to([headline, content], {
          y: -60,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "40% top",
            scrub: true,
          },
        });
        if (textTween.scrollTrigger) triggers.push(textTween.scrollTrigger);
      }

      return () => {
        // Clean up mobile-specific tweens
      };
    });

    return () => {
      mm.revert();
      tweens.forEach((t) => t.kill());
      triggers.forEach((st) => st.kill());
    };
  }, []);

  // ── Intro animation (only after preloader finishes) ──
  useEffect(() => {
    if (!loaded) return;

    const headline = headlineRef.current;
    const content = contentRef.current;
    const button = buttonRef.current;
    const scrollDown = scrollDownRef.current;

    // Ensure GSAP recalculates pinned positions now that preloader is gone
    ScrollTrigger.refresh();

    const introTl = gsap.timeline({ delay: 0.1 });

    if (headline) {
      const words = headline.querySelectorAll(".hero-word");
      gsap.set(words, { autoAlpha: 1, y: "110%", rotate: 8, transformOrigin: "top left" });
      introTl.to(
        words,
        {
          y: 0,
          rotate: 0,
          duration: 1.6,
          stagger: 0.12,
          ease: "power3.out",
        },
        0
      );
    }

    // Sub-elements share identical animation params for perfect sync
    if (content) gsap.set(content, { autoAlpha: 0, y: 20 });
    if (button) gsap.set(button, { autoAlpha: 0, y: 20 });
    if (scrollDown) gsap.set(scrollDown, { autoAlpha: 0, y: 16 });

    if (content) {
      introTl.to(
        content,
        { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" },
        1.2
      );
    }

    if (button) {
      introTl.to(
        button,
        { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" },
        1.5
      );
    }

    if (scrollDown) {
      introTl.to(
        scrollDown,
        { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" },
        1.8
      );
    }

    return () => {
      introTl.kill();
    };
  }, [loaded]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative bg-[#F5E6D3]"
      style={{ height: "230vh" }}
    >
      {/* Pinned inner viewport */}
      <div
        ref={innerRef}
        className="relative h-screen w-full overflow-hidden"
      >
        {/* Marquee background — revealed as hero frame shrinks */}
        <Marquee variant="background" />

        {/* Image wrapper — clip-path shrinks this on scroll */}
        <div
          ref={imageWrapRef}
          className="absolute inset-0 will-change-[clip-path]"
          style={{ clipPath: "inset(0% 0% 0% 0% round 0px)" }}
        >
          <img
            ref={imgRef}
            src="/images/hero.webp"
            alt="Woman enjoying ice cream in sunlit garden"
            className="h-full w-full object-cover will-change-transform"
            style={{ transform: "scale(1)" }}
            fetchPriority="high"
          />
          {/* Gradient overlay for text readability — fades as image shrinks */}
          <div
            ref={overlayRef}
            className="absolute inset-0 bg-gradient-to-t from-[#2A1810]/80 via-[#2A1810]/30 to-transparent"
            style={{ opacity: 0.5 }}
          />
        </div>

        {/* Content layer — sits above the image wrapper */}
        <div className="relative z-10 w-full h-full px-6 md:px-12 lg:px-16 flex items-center justify-center">

          {/* Main Content Wrapper - Establishes coordinate system matching text block height */}
          <div className="relative w-full max-w-[1500px] translate-y-24 md:translate-y-32 lg:translate-y-[18vh]">

            {/* Left Column — Tightly stacked massive text block */}
            <div ref={headlineRef} className="flex flex-col relative z-10 w-fit">
              <h1 className="font-blenny text-[clamp(4.5rem,18vw,14rem)] font-black not-italic leading-[0.76] tracking-tighter text-cream flex flex-col">
                <span className="block overflow-hidden pb-4 -mb-4">
                  <span className="hero-word inline-block" style={{ visibility: "hidden", WebkitTextStroke: "clamp(1.5px, 0.35vw, 4px) rgba(163,29,29,0.6)", textShadow: "4px 4px 0 rgba(163,29,29,0.75), 8px 8px 24px rgba(0,0,0,0.3)" }}>TRUE</span>
                </span>
                <span className="block overflow-hidden pb-4 -mb-4 ml-[8vw] md:ml-[1.5em]">
                  <span className="hero-word inline-block" style={{ visibility: "hidden", WebkitTextStroke: "clamp(1.5px, 0.35vw, 4px) rgba(163,29,29,0.6)", textShadow: "4px 4px 0 rgba(163,29,29,0.75), 8px 8px 24px rgba(0,0,0,0.3)" }}>ICE</span>
                </span>
                <span className="block overflow-hidden pb-4 -mb-4 ml-[8vw] md:ml-[1.5em]">
                  <span className="hero-word inline-block" style={{ visibility: "hidden", WebkitTextStroke: "clamp(1.5px, 0.35vw, 4px) rgba(163,29,29,0.6)", textShadow: "4px 4px 0 rgba(163,29,29,0.75), 8px 8px 24px rgba(0,0,0,0.3)" }}>CREAM</span>
                </span>
              </h1>
            </div>

            {/* Paragraph — Absolutely positioned relative to the left to stay near TRUE! */}
            <div
              ref={contentRef}
              className="mt-12 md:mt-0 md:absolute md:top-0 md:left-[42vw] lg:left-[36vw] md:w-[45vw] lg:w-[42vw] max-w-[500px] pointer-events-auto"
              style={{ visibility: "hidden" }}
            >
              <p className="text-[13px] md:text-[14px] lg:text-[15px] leading-[1.6] text-cream/95 md:pt-2 md:pl-4 font-medium overflow-hidden"
                style={{ maxHeight: "calc(clamp(4.5rem, 18vw, 14rem) * 0.76)" }}
              >
                Wait... why are there so many flavors here? I usually just walk past ice cream counters without thinking twice — but this looks dangerous. That caramel-dipped one looks tempting... and what&apos;s that blue one? mr.pops? Hmm, I&apos;ll try the bright orange bar — what flavor is that? Tropical mango? That first bite is freezing! And hold on — what&apos;s that crispy thing in yours? Bitss? That&apos;s actually amazing... okay, I&apos;m definitely taking this strawberry one home too.
              </p>
            </div>

          </div>

          {/* Independent Button Wrapper — completely decoupled from the headline block! */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-6 md:px-12 lg:px-16 z-30">
            <div className="relative w-full max-w-[1500px] translate-y-24 md:translate-y-32 lg:translate-y-[18vh]">
              {/* Button + label */}
              <div
                ref={buttonRef}
                className="absolute top-0 -translate-y-1/2 left-0 md:left-[48vw] lg:left-[40vw] w-full md:w-auto pointer-events-auto pl-4 md:pl-4 z-30"
                style={{ visibility: "hidden" }}
              >
                <div className="flex items-center gap-10">
                  <CircularButton text="" href="#flavors" className="scale-[0.8] md:scale-[0.9] text-cream" />
                  <span className="text-[11px] md:text-[12px] font-bold uppercase tracking-[0.3em] text-cream">
                    FLAVOURS
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Corner Scroll Indicator — bottom-right of viewport */}
        <div
          ref={scrollDownRef}
          className="absolute bottom-12 right-12 z-20 hidden md:block"
          style={{ visibility: "hidden" }}
        >
          <div className="relative">
            <svg
              width="100"
              height="100"
              viewBox="0 0 100 100"
              fill="none"
              className="text-cream/20"
            >
              <path d="M0 0V98H98" stroke="currentColor" strokeWidth="1" />
              <path d="M88 88L98 98L88 98M98 98L98 88" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
        </div>

        {/* Mobile Scroll Down Indicator — simpler */}
        <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 md:hidden">
          <ArrowDown className="h-5 w-5 animate-bounce-arrow text-cream/60" />
        </div>
      </div>
    </section>
  );
}
