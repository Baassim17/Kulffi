# Plan: 3D Chocolate Bar Ice Cream Section (Three.js)

## Goal
Replace the existing GiftBox section with a 400vh scroll-driven 3D chocolate bar ice cream animation using Three.js.

## Files
- src/lib/choco/scene.ts
- src/lib/choco/geometry.ts
- src/lib/choco/materials.ts
- src/lib/choco/particles.ts
- src/lib/choco/animations.ts
- src/lib/choco/postprocess.ts
- src/hooks/useChocoScene.ts
- src/components/sections/ChocoBar.tsx

## Mods
- src/app/page.tsx: replace GiftBox with ChocoBar
- src/app/layout.tsx: add Playfair Display font
- Delete src/components/sections/GiftBox.tsx
