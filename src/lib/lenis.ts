import Lenis from "lenis";

/** Shared Lenis instance ref — set by SmoothScroll, consumed by components that need programmatic scroll */
export const lenisRef = { current: null as Lenis | null };
