import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const EASE_PRESETS = {
  easeOutSine: "power2.out",
  easeInOutSine: "power2.inOut",
  easeOutExpo: "power3.out",
  easeInOutExpo: "power3.inOut",
  elasticOut: "elastic.out(1, 0.3)",
} as const;

export const DEFAULT_DURATION = 1;
export const DEFAULT_STAGGER = 0.05;

export function initScrollAnimations() {
  // Fade up sections
  gsap.utils.toArray<HTMLElement>(".js-fade-up").forEach((el) => {
    gsap.from(el, {
      y: 32,
      opacity: 0,
      duration: 1,
      ease: EASE_PRESETS.easeOutSine,
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  });

  // Simple fade in
  gsap.utils.toArray<HTMLElement>(".js-fade-in").forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      duration: 1,
      ease: EASE_PRESETS.easeOutSine,
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  });

  // Parallax images
  gsap.utils.toArray<HTMLElement>(".js-parallax").forEach((container) => {
    const img = container.querySelector("img, .parallax-inner");
    if (!img) return;
    gsap.to(img, {
      y: -80,
      ease: "none",
      scrollTrigger: {
        trigger: container,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });

  // Image reveal mask
  gsap.utils.toArray<HTMLElement>(".js-img-reveal").forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: "inset(0 100% 0 0)" },
      {
        clipPath: "inset(0 0% 0 0)",
        duration: 1.2,
        ease: EASE_PRESETS.easeInOutExpo,
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );
  });
}

export function splitTextReveal(
  element: HTMLElement,
  options?: { duration?: number; stagger?: number; delay?: number }
) {
  const words = element.querySelectorAll(".split-word");
  if (words.length === 0) return null;

  return gsap.fromTo(
    words,
    { y: "100%", rotate: 2 },
    {
      y: 0,
      rotate: 0,
      duration: options?.duration ?? 1,
      stagger: options?.stagger ?? 0.05,
      ease: EASE_PRESETS.easeOutExpo,
      delay: options?.delay ?? 0,
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    }
  );
}
