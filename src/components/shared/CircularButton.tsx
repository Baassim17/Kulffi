"use client";

import { ArrowRight } from "lucide-react";

interface CircularButtonProps {
  text: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}

// Exact SVG wavy-circle path from original Mr.Pops
const WAVY_CIRCLE_PATH =
  "M80.5401 3.92485L83.3167 5.48241C86.3051 7.15875 89.666 8.0593 93.0922 8.10174L96.2756 8.14117C103.069 8.22532 109.33 11.8397 112.8 17.6813L114.425 20.4185C116.175 23.3644 118.636 25.8248 121.582 27.5746L124.319 29.2005C130.16 32.6703 133.775 38.9305 133.859 45.7244L133.898 48.9078C133.941 52.334 134.841 55.6949 136.518 58.6833L138.075 61.4599C141.399 67.3857 141.399 74.6144 138.075 80.5401L136.518 83.3168C134.841 86.3051 133.941 89.666 133.898 93.0922L133.859 96.2756C133.775 103.069 130.16 109.33 124.319 112.8L121.582 114.425C118.636 116.175 116.175 118.636 114.425 121.582L112.8 124.319C109.33 130.16 103.069 133.775 96.2756 133.859L93.0922 133.898C89.666 133.941 86.3051 134.841 83.3167 136.518L80.5401 138.075C74.6144 141.399 67.3856 141.399 61.4599 138.075L58.6833 136.518C55.6949 134.841 52.334 133.941 48.9078 133.898L45.7244 133.859C38.9305 133.775 32.6703 130.16 29.2005 124.319L27.5746 121.582C25.8248 118.636 23.3644 116.175 20.4185 114.425L17.6813 112.8C11.8397 109.33 8.22531 103.069 8.14116 96.2756L8.10173 93.0922C8.05929 89.666 7.15874 86.3051 5.48241 83.3168L3.92484 80.5401C0.600782 74.6144 0.60078 67.3857 3.92484 61.4599L5.4824 58.6833C7.15874 55.6949 8.05929 52.334 8.10173 48.9078L8.14116 45.7244C8.22531 38.9305 11.8397 32.6703 17.6813 29.2005L20.4185 27.5746C23.3644 25.8248 25.8248 23.3644 27.5746 20.4185L29.2004 17.6813C32.6703 11.8397 38.9305 8.22532 45.7244 8.14117L48.9078 8.10174C52.334 8.0593 55.6949 7.15874 58.6833 5.48241L61.4599 3.92484C67.3856 0.60078 74.6144 0.60078 80.5401 3.92485Z";

export default function CircularButton({
  text,
  href,
  onClick,
  className = "",
}: CircularButtonProps) {
  const Wrapper = href ? "a" : "button";

  return (
    <Wrapper
      href={href}
      onClick={onClick}
      data-cursor-hover
      className={`group relative inline-flex h-[120px] w-[120px] items-center justify-center md:h-[142px] md:w-[142px] ${className}`}
    >
      {/* === FILL LAYER (behind rings, inside the frame) === */}
      {/* The original uses a pseudo-element with inset:0 that fills from bottom.
          We inset it slightly so the fill stays visually inside the wavy rings. */}
      <span
        className="absolute inset-[7%] overflow-hidden rounded-full"
        aria-hidden="true"
      >
        <span className="block h-full w-full bg-terracotta translate-y-[102%] transition-transform duration-[600ms] ease-out group-hover:translate-y-0" />
      </span>

      {/* === OUTER WAVY RING (rotates CW, 7s) === */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 142 142"
        fill="none"
        aria-hidden="true"
      >
        <g className="origin-center animate-spin-slow">
          <path
            d={WAVY_CIRCLE_PATH}
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </g>
      </svg>

      {/* === INNER WAVY RING (rotates CCW, 21s) === */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full scale-[0.88]"
        viewBox="0 0 142 142"
        fill="none"
        aria-hidden="true"
      >
        <g className="origin-center animate-spin-reverse-slower">
          <path
            d={WAVY_CIRCLE_PATH}
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </g>
      </svg>

      {/* === LABEL & ARROW === */}
      <span className="relative z-10 flex items-center justify-center text-cream transition-colors duration-[600ms]">
        {text && (
          <span className="mr-2 text-[10px] font-medium uppercase tracking-wider md:text-xs">
            {text}
          </span>
        )}
        <span className="relative flex overflow-hidden">
          {/* Main Arrow */}
          <ArrowRight 
            strokeWidth={1.2} 
            className="h-6 w-6 transition-all duration-[400ms] ease-out group-hover:translate-x-full group-hover:opacity-0" 
          />
          {/* Incoming Hover Arrow */}
          <ArrowRight 
            strokeWidth={1.2} 
            className="absolute inset-0 h-6 w-6 -translate-x-full opacity-0 transition-all duration-[400ms] ease-out group-hover:translate-x-0 group-hover:opacity-100" 
          />
        </span>
      </span>
    </Wrapper>
  );
}
