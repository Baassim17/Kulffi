// Flavor paths (compressed)
export const FLAVOR_PATHS = [
  "/Models/compressed/chocobar.glb",
  "/Models/compressed/cocochoc.glb",
  "/Models/compressed/darkchocolate.glb",
  "/Models/compressed/Alphonso.glb",
  "/Models/compressed/malaialmond.glb",
];

export function getFlavorModelPath(index: number): string {
  return FLAVOR_PATHS[index] ?? "";
}

export function getFlavorCount(): number {
  return FLAVOR_PATHS.length;
}
