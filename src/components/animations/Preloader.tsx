"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

interface PreloaderProps {
  onComplete?: () => void;
}

// ── Critical assets only ──
const CRITICAL_IMAGES = ["/images/hero.webp"];

const FLAVOR_NAMES = [
  "Saffron", "Mango", "Pistachio", "Dark Chocolate",
  "Malai Almond", "Filter Kaapi", "Coco-Choc", "Honey Fig",
];

const TOTAL_TASKS = CRITICAL_IMAGES.length + 1; // +1 for fonts

function playPopSound() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(520, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Silent fallback
  }
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

/** Load remaining non-critical images in background after page is interactive.
 *  GLB models are NOT preloaded — they load on-demand when user clicks a flavor. */
function loadBackgroundImages() {
  const bgImages = [
    "/images/about.webp",
    "/images/friends-popsicle.webp",
    "/images/ice_cream_bar.webp",
    "/images/mango_bar.webp",
    "/images/dark_choc_bar.webp",
    "/images/saffron.webp",
    "/images/malai.webp",
    "/images/coffee.webp",
    "/images/coconut.webp",
    "/images/fig.webp",
  ];

  const schedule = () => {
    bgImages.forEach((src, i) => {
      setTimeout(() => { const img = new Image(); img.src = src; }, i * 150);
    });
  };

  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(schedule, { timeout: 3000 });
  } else {
    setTimeout(schedule, 2000);
  }
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const tasksDoneRef = useRef(0);
  const displayPctRef = useRef(0);
  const rafRef = useRef(0);
  const startTimeRef = useRef(0);
  const isCompleteRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  const triggerExit = useCallback(() => {
    playPopSound();
    const container = containerRef.current;
    if (!container) {
      onCompleteRef.current?.();
      return;
    }
    const exitTl = gsap.timeline({
      onComplete: () => {
        container.style.display = "none";
        onCompleteRef.current?.();
      },
    });
    exitTl.to({}, { duration: 0.3 });
    const elements = [ringRef.current, dotRef.current, brandRef.current, percentRef.current, statusRef.current].filter(Boolean);
    exitTl.to(elements, {
      scale: 1.08, autoAlpha: 0, duration: 0.6, stagger: 0.03, ease: "power2.inOut",
    }, "-=0.1");
    exitTl.to(container, {
      autoAlpha: 0, duration: 0.4, ease: "power2.out",
    }, "-=0.2");
  }, []);

  // Entrance animation
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.1 });
    if (ringRef.current) {
      gsap.set(ringRef.current, { strokeDashoffset: 565, autoAlpha: 0 });
      tl.to(ringRef.current, { autoAlpha: 1, duration: 0.8, ease: "power2.out" });
    }
    if (dotRef.current) {
      gsap.set(dotRef.current, { scale: 0, autoAlpha: 0 });
      tl.to(dotRef.current, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "back.out(2)" }, "-=0.4");
    }
    if (brandRef.current) {
      gsap.set(brandRef.current, { y: 16, autoAlpha: 0 });
      tl.to(brandRef.current, { y: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out" }, "-=0.3");
    }
    if (percentRef.current) {
      gsap.set(percentRef.current, { y: 8, autoAlpha: 0 });
      tl.to(percentRef.current, { y: 0, autoAlpha: 1, duration: 0.6, ease: "power2.out" }, "-=0.4");
    }
    if (statusRef.current) {
      gsap.set(statusRef.current, { y: 6, autoAlpha: 0 });
      tl.to(statusRef.current, { y: 0, autoAlpha: 1, duration: 0.5, ease: "power2.out" }, "-=0.3");
    }
    return () => { tl.kill(); };
  }, []);

  // Resource loading
  useEffect(() => {
    startTimeRef.current = performance.now();

    function updateProgress() {
      tasksDoneRef.current++;
      const rawPct = Math.min((tasksDoneRef.current / TOTAL_TASKS) * 100, 100);
      const targetVal = Math.round(rawPct);
      const startVal = displayPctRef.current;
      const startTime = performance.now();
      const duration = 300;

      function tick() {
        const elapsed = performance.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        displayPctRef.current = Math.round(startVal + (targetVal - startVal) * eased);
        const pct = displayPctRef.current;

        const ring = ringRef.current;
        const dot = dotRef.current;
        const percent = percentRef.current;
        const status = statusRef.current;

        if (percent) percent.textContent = `${pct}%`;
        if (ring) {
          const circumference = 2 * Math.PI * 90;
          ring.style.strokeDashoffset = String(circumference * (1 - pct / 100));
        }
        if (dot) {
          const angle = (pct / 100) * Math.PI * 2 - Math.PI / 2;
          const r = 90;
          dot.style.transform = `translate(${Math.cos(angle) * r}px, ${Math.sin(angle) * r}px)`;
        }
        if (status) {
          const fi = Math.floor((pct / 100) * FLAVOR_NAMES.length);
          status.textContent = `Preparing ${FLAVOR_NAMES[Math.min(fi, FLAVOR_NAMES.length - 1)]}...`;
        }

        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else if (rawPct >= 100) {
          checkComplete();
        }
      }

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
    }

    function checkComplete() {
      if (isCompleteRef.current) return;
      const elapsed = performance.now() - startTimeRef.current;
      const minTime = 500;
      const remaining = Math.max(0, minTime - elapsed);

      setTimeout(() => {
        if (isCompleteRef.current) return;
        isCompleteRef.current = true;
        triggerExit();
        loadBackgroundImages();
      }, remaining);
    }

    CRITICAL_IMAGES.forEach((src) => preloadImage(src).then(updateProgress));

    Promise.all([
      document.fonts.ready,
      document.fonts.load("900 16px Blenny"),
      document.fonts.load("400 16px Space Grotesk"),
      document.fonts.load("400 16px Inter"),
    ]).then(() => {
      updateProgress();
    });

    const safetyTimer = setTimeout(() => {
      if (!isCompleteRef.current) {
        tasksDoneRef.current = TOTAL_TASKS;
        checkComplete();
      }
    }, 2000);

    return () => {
      clearTimeout(safetyTimer);
      cancelAnimationFrame(rafRef.current);
    };
  }, [triggerExit]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F5E6D3]"
    >
      <div className="relative flex flex-col items-center">
        <div className="relative w-[200px] h-[200px] md:w-[240px] md:h-[240px]">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="#A31D1D" strokeWidth="2" strokeOpacity="0.12" />
            <circle
              ref={ringRef}
              cx="100" cy="100" r="90" fill="none" stroke="#A31D1D" strokeWidth="2.5" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 90} strokeDashoffset={2 * Math.PI * 90}
              style={{ transform: "rotate(-90deg)", transformOrigin: "center", opacity: 0 }}
            />
          </svg>
          <div
            ref={dotRef}
            className="absolute top-1/2 left-1/2 w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-[#FCE9D5] border-[2.5px] border-[#A31D1D]"
            style={{ marginLeft: -7, marginTop: -7, transform: "translate(0px, -90px)", opacity: 0 }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <div ref={brandRef} className="font-blenny text-[clamp(1.6rem,4.5vw,2.6rem)] text-[#A31D1D] leading-none tracking-tight" style={{ opacity: 0 }}>
              KULFFI
            </div>
            <div ref={percentRef} className="font-display text-[11px] md:text-xs font-bold tracking-[0.2em] text-[#A31D1D]/50 tabular-nums" style={{ opacity: 0 }}>
              0%
            </div>
          </div>
        </div>
        <div ref={statusRef} className="mt-6 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em] text-[#A31D1D]/35 h-4" style={{ opacity: 0 }}>
          Preparing flavors...
        </div>
      </div>
    </div>
  );
}
