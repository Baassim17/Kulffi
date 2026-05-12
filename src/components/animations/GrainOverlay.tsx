"use client";

/**
 * GrainOverlay — CSS-only noise texture via SVG feTurbulence.
 * Zero JavaScript, zero rAF loops, zero CPU cost.
 * The browser rasterises the noise filter once and composites it.
 */
export default function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[50] opacity-[0.025] mix-blend-overlay"
      aria-hidden="true"
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  );
}