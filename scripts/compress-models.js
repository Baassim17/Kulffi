const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const inputDir = path.resolve("public/Models");
const outputDir = path.resolve("public/Models/compressed");

const models = [
  "chocobar.glb",
  "cocochoc.glb",
  "darkchocolate.glb",
  "Alphonso.glb",
  "malaialmond.glb",
];

console.log("=== GLB Compression Pipeline ===\n");
console.log("Steps per model: resize textures to 2K → Draco compress geometry\n");

for (const file of models) {
  const inputPath = path.join(inputDir, file);
  const outputPath = path.join(outputDir, file);

  if (!fs.existsSync(inputPath)) {
    console.warn(`  SKIP: ${file} not found`);
    continue;
  }

  const beforeSize = (fs.statSync(inputPath).size / 1024 / 1024).toFixed(1);
  console.log(`\n▶ ${file} (${beforeSize} MB)`);

  try {
    // Step 1: Resize textures to 2K max
    const tempPath = path.join(outputDir, `.tmp.${file}`);
    console.log(`  1/2 Resizing textures to 2048px...`);
    execSync(
      `npx gltf-transform resize "${inputPath}" "${tempPath}" --width 2048 --height 2048`,
      { stdio: "inherit" }
    );

    // Step 2: Draco compress geometry
    console.log(`  2/2 Draco compressing geometry...`);
    execSync(
      `npx gltf-transform draco "${tempPath}" "${outputPath}"`,
      { stdio: "inherit" }
    );

    // Clean up temp file
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }

    const afterSize = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(1);
    const ratio = ((parseFloat(afterSize) / parseFloat(beforeSize)) * 100).toFixed(1);
    console.log(`  ✓ Done: ${afterSize} MB (${ratio}% of original)`);
  } catch (err) {
    console.error(`  ✗ Failed: ${err.message}`);
  }
}

console.log("\n=== Compression Complete ===");
