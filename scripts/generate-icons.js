#!/usr/bin/env node
/**
 * Generate all required app icon sizes from the source icon-512.png.
 * Uses the 'sharp' package which is already a devDependency.
 *
 * Usage: node scripts/generate-icons.js
 */

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const SOURCE = path.join(__dirname, "../public/icon-512.png");
const OUT_DIR = path.join(__dirname, "../public");

// All sizes needed for iOS, Android, and PWA
const SIZES = [
  // PWA
  { size: 16, name: "favicon-16.png" },
  { size: 32, name: "favicon-32.png" },
  { size: 48, name: "icon-48.png" },
  { size: 72, name: "icon-72.png" },
  { size: 96, name: "icon-96.png" },
  { size: 128, name: "icon-128.png" },
  { size: 144, name: "icon-144.png" },
  { size: 152, name: "icon-152.png" },
  { size: 167, name: "icon-167.png" },
  { size: 180, name: "apple-touch-icon.png" },
  { size: 192, name: "icon-192.png" },
  { size: 256, name: "icon-256.png" },
  { size: 384, name: "icon-384.png" },
  { size: 512, name: "icon-512.png" },
  // Android adaptive (foreground layer, 432px for 108dp * 4)
  { size: 432, name: "icon-foreground.png" },
  // iOS specific
  { size: 20, name: "ios/icon-20.png" },
  { size: 29, name: "ios/icon-29.png" },
  { size: 40, name: "ios/icon-40.png" },
  { size: 58, name: "ios/icon-58.png" },
  { size: 60, name: "ios/icon-60.png" },
  { size: 76, name: "ios/icon-76.png" },
  { size: 80, name: "ios/icon-80.png" },
  { size: 87, name: "ios/icon-87.png" },
  { size: 120, name: "ios/icon-120.png" },
  { size: 152, name: "ios/icon-152.png" },
  { size: 167, name: "ios/icon-167.png" },
  { size: 180, name: "ios/icon-180.png" },
  { size: 1024, name: "ios/icon-1024.png" },
  // Android specific
  { size: 36, name: "android/mipmap-ldpi.png" },
  { size: 48, name: "android/mipmap-mdpi.png" },
  { size: 72, name: "android/mipmap-hdpi.png" },
  { size: 96, name: "android/mipmap-xhdpi.png" },
  { size: 144, name: "android/mipmap-xxhdpi.png" },
  { size: 192, name: "android/mipmap-xxxhdpi.png" },
];

async function generateIcons() {
  if (!fs.existsSync(SOURCE)) {
    console.error("Source icon not found:", SOURCE);
    process.exit(1);
  }

  // Ensure subdirectories exist
  const dirs = ["ios", "android"].map((d) => path.join(OUT_DIR, d));
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  // Read source into buffer to avoid same-file input/output error
  const sourceBuffer = fs.readFileSync(SOURCE);

  let count = 0;
  for (const { size, name } of SIZES) {
    const outPath = path.join(OUT_DIR, name);
    await sharp(sourceBuffer)
      .resize(size, size, { fit: "cover", kernel: "lanczos3" })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(outPath);
    count++;
  }

  console.log(`Generated ${count} icons from ${SOURCE}`);
}

generateIcons().catch((err) => {
  console.error("Failed to generate icons:", err);
  process.exit(1);
});
