"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Marquee from "@/components/sections/Marquee";

export default function ImageReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const inner = innerRef.current;
    const imageWrap = imageWrapRef.current;
    const img = imgRef.current;
    const overlay = overlayRef.current;

    if (!section || !inner || !imageWrap || !img) return;

    const triggers: ScrollTrigger[] = [];

    const mm = gsap.matchMedia();

    // Desktop: clip-path morph reveal
    mm.add("(min-width: 900px)", () => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=200%",
          pin: inner,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      if (scrollTl.scrollTrigger) triggers.push(scrollTl.scrollTrigger);

      // 0-30%: image parallax scale
      scrollTl.fromTo(
        img,
        { scale: 1 },
        { scale: 1.25, ease: "none" },
        0
      );

      // 10-55%: image container shrinks via clip-path
      scrollTl.fromTo(
        imageWrap,
        { clipPath: "inset(0% 0% 0% 0% round 0px)" },
        { clipPath: "inset(12% 27.5% 12% 27.5% round 24px)", ease: "none" },
        0.1
      );

      // 20-55%: overlay fades
      if (overlay) {
        scrollTl.fromTo(
          overlay,
          { opacity: 0.35 },
          { opacity: 0, ease: "none" },
          0.2
        );
      }

      return () => {
        scrollTl.kill();
        if (scrollTl.scrollTrigger) scrollTl.scrollTrigger.kill();
      };
    });

    // Mobile: simpler parallax
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

      return () => {};
    });

    return () => {
      mm.revert();
      triggers.forEach((st) => st.kill());
    };
  }, []);

  return (
    <section
      id="image-reveal"
      ref={sectionRef}
      className="relative bg-[#F5E6D3]"
      style={{ height: "300vh" }}
    >
      <div
        ref={innerRef}
        className="relative h-screen w-full overflow-hidden"
        style={{ willChange: "transform" }}
      >
        {/* Marquee background */}
        <Marquee variant="background" />

        {/* Image wrapper */}
        <div
          ref={imageWrapRef}
          className="absolute inset-0 will-change-[clip-path]"
          style={{ clipPath: "inset(0% 0% 0% 0% round 0px)" }}
        >
          <img
            ref={imgRef}
            src="/images/ChatGPT Image May 3, 2026, 10_01_49 PM.webp"
            alt="Woman enjoying chocolate ice cream"
            className="h-full w-full object-cover will-change-transform"
            style={{ transform: "scale(1)" }}
            loading="lazy"
          />
          <div
            ref={overlayRef}
            className="absolute inset-0 bg-gradient-to-t from-[#2A1810]/60 via-[#2A1810]/20 to-transparent"
            style={{ opacity: 0.35 }}
          />
        </div>
      </div>
    </section>
  );
}
