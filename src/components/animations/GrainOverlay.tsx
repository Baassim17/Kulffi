"use client";

import { useEffect, useRef } from "react";

const NOISE_SIZE = 256;

export default function GrainOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use a small canvas for noise generation, scaled up via CSS
    canvas.width = NOISE_SIZE;
    canvas.height = NOISE_SIZE;

    let animationId: number;
    let isVisible = true;

    // Pre-allocate ImageData once
    const idata = ctx.createImageData(NOISE_SIZE, NOISE_SIZE);
    const buffer32 = new Uint32Array(idata.data.buffer);

    const generateNoise = () => {
      // Clear to transparent
      buffer32.fill(0);
      for (let i = 0; i < buffer32.length; i++) {
        if (Math.random() < 0.5) {
          buffer32[i] = 0x08000000;
        }
      }
      ctx.putImageData(idata, 0, 0);
    };

    const tick = () => {
      if (!isVisible) {
        // Don't schedule frames when tab is hidden; re-check on visibility change
        return;
      }
      generateNoise();
      setTimeout(() => {
        animationId = requestAnimationFrame(tick);
      }, 83);
    };

    const handleVisibility = () => {
      const nowVisible = !document.hidden;
      if (nowVisible && !isVisible) {
        isVisible = true;
        animationId = requestAnimationFrame(tick);
      } else {
        isVisible = nowVisible;
      }
    };

    tick();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(animationId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[50] opacity-[0.025] mix-blend-overlay"
      style={{ width: "100%", height: "100%", imageRendering: "pixelated" }}
      aria-hidden="true"
    />
  );
}