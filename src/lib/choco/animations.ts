export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export interface PhaseValues {
  barY: number;
  barRotX: number;
  barRotY: number;
  barScale: number;
  camZ: number;
  camX: number;
  camY: number;
}

/**
 * 5-phase scroll animation — each phase is 20%
 */
export function computePhases(scrollProgress: number, time: number): PhaseValues {
  const p = clamp(scrollProgress, 0, 1);

  let barY = 0;
  let barRotX = 0;
  let barRotY = 0;
  let barScale = 1;
  let camZ = 5.5;
  let camX = 0;
  const camY = 0;

  if (p < 0.20) {
    const t = easeOutCubic(p / 0.20);
    barY = lerp(-4, 0, t);
    barRotX = lerp(-0.3, 0, t);
    camZ = lerp(8, 5.5, t);
  } else if (p < 0.40) {
    const t = easeOutCubic((p - 0.20) / 0.20);
    barY = Math.sin(time * 1.2) * 0.08;
    barRotY = lerp(0, Math.PI * 0.4, t);
    camX = Math.sin(time * 0.6) * 0.2;
  } else if (p < 0.60) {
    const t = easeOutCubic((p - 0.40) / 0.20);
    barRotY = lerp(Math.PI * 0.4, Math.PI * 0.6, t);
    camZ = lerp(5.5, 3.8, t);
    barScale = lerp(1, 1.05, t);
  } else if (p < 0.80) {
    const t = easeOutCubic((p - 0.60) / 0.20);
    barRotY = lerp(Math.PI * 0.6, Math.PI * 1.1, t);
    camZ = lerp(3.8, 5, t);
    barScale = lerp(1.05, 1, t);
  } else {
    const t = easeOutCubic((p - 0.80) / 0.20);
    barRotY = lerp(Math.PI * 1.1, 0, t);
    barScale = lerp(1, 1.03, t);
    camZ = lerp(5, 5.2, t);
  }

  return { barY, barRotX, barRotY, barScale, camZ, camX, camY };
}

/**
 * Text block visibility envelope — tightly synced to 3D phases
 * Each block gets: settle → reveal → hold → exit
 */
export function getTextBlockProgress(
  scrollProgress: number,
  textIndex: number
): number {
  const p = clamp(scrollProgress, 0, 1);
  const phaseStart = textIndex * 0.20;
  const phaseEnd = phaseStart + 0.20;

  // Slower, more gradual reveal
  const revealStart = phaseStart;
  const holdStart = phaseStart + 0.12;
  const exitStart = phaseEnd - 0.06;

  if (p < revealStart) return 0;
  if (p < holdStart) return easeOutCubic((p - revealStart) / (holdStart - revealStart));
  if (p < exitStart) return 1;
  if (p < phaseEnd) return 1 - easeInOutCubic((p - exitStart) / (phaseEnd - exitStart));
  return 0;
}

/**
 * Word-level stagger progress for each text block
 * wordIndex: 0, 1, 2...
 * Returns 0-1 for each word's individual reveal
 */
export function getWordProgress(
  scrollProgress: number,
  textIndex: number,
  wordIndex: number,
  staggerDelay = 0.05
): number {
  const blockProgress = getTextBlockProgress(scrollProgress, textIndex);
  const wordDelay = wordIndex * staggerDelay;
  if (blockProgress <= wordDelay) return 0;
  const t = clamp((blockProgress - wordDelay) / (0.6 - wordDelay), 0, 1);
  return easeOutQuart(t);
}

/**
 * Description reveal progress — delayed after headline
 */
export function getDescProgress(
  scrollProgress: number,
  textIndex: number
): number {
  const blockProgress = getTextBlockProgress(scrollProgress, textIndex);
  const delay = 0.25;
  if (blockProgress <= delay) return 0;
  return easeOutCubic(clamp((blockProgress - delay) / 0.4, 0, 1));
}

/**
 * Text block horizontal offset for slide-in effect
 */
export function getTextOffset(
  scrollProgress: number,
  textIndex: number,
  isLeft: boolean
): number {
  const progress = getTextBlockProgress(scrollProgress, textIndex);
  const direction = isLeft ? -1 : 1;
  return (1 - easeOutCubic(progress)) * 80 * direction;
}

/**
 * Text block vertical parallax offset
 */
export function getTextParallax(
  scrollProgress: number,
  textIndex: number
): number {
  const progress = getTextBlockProgress(scrollProgress, textIndex);
  return (1 - easeOutCubic(progress)) * 20;
}

/**
 * Text block scale — subtle zoom-in on reveal
 */
export function getTextScale(
  scrollProgress: number,
  textIndex: number
): number {
  const progress = getTextBlockProgress(scrollProgress, textIndex);
  return 0.94 + easeOutCubic(progress) * 0.06;
}

/**
 * Get active text index based on scroll progress
 */
export function getActiveTextIndex(scrollProgress: number): number {
  const p = clamp(scrollProgress, 0, 1);
  if (p < 0.18) return 0;
  if (p < 0.38) return 1;
  if (p < 0.58) return 2;
  if (p < 0.78) return 3;
  return 4;
}

/**
 * Legacy opacity — maps to new block progress
 */
export function getTextOpacity(
  scrollProgress: number,
  textIndex: number
): number {
  return getTextBlockProgress(scrollProgress, textIndex);
}
