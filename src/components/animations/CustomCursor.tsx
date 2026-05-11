"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";

function getIsTouchDevice() {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const isHoveringRef = useRef(false);
  const isTouchDevice = useSyncExternalStore(
    () => () => {},
    getIsTouchDevice,
    () => false
  );

  useEffect(() => {
    if (isTouchDevice) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    const quickX = gsap.quickTo(cursor, "x", { duration: 0.08, ease: "power2.out" });
    const quickY = gsap.quickTo(cursor, "y", { duration: 0.08, ease: "power2.out" });

    const moveCursor = (e: MouseEvent) => {
      quickX(e.clientX);
      quickY(e.clientY);
    };

    // Event delegation: listen on document for all interactive elements
    // This automatically handles dynamically added/removed elements
    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a, button, [data-cursor-hover]");
      if (target) {
        isHoveringRef.current = true;
        cursor.classList.add("h-12", "w-12");
        cursor.classList.remove("h-2", "w-2");
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a, button, [data-cursor-hover]");
      if (target) {
        isHoveringRef.current = false;
        cursor.classList.remove("h-12", "w-12");
        cursor.classList.add("h-2", "w-2");
      }
    };

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [isTouchDevice]);

  if (isTouchDevice) return null;

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed z-[9999] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-terracotta mix-blend-difference transition-[width,height] duration-200"
      style={{ left: 0, top: 0 }}
    />
  );
}