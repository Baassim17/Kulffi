from PIL import Image
import os
import glob

images_dir = os.path.join(os.path.dirname(__file__), "../public/images")

png_files = glob.glob(os.path.join(images_dir, "*.png"))
jpeg_files = glob.glob(os.path.join(images_dir, "*.jpg")) + glob.glob(os.path.join(images_dir, "*.jpeg"))
all_files = png_files + jpeg_files

converted = []
skipped = []

for src in all_files:
    base = os.path.splitext(src)[0]
    dst = base + ".webp"
    
    if os.path.exists(dst):
        skipped.append(os.path.basename(dst))
        continue
    
    try:
        img = Image.open(src)
        # Convert to RGB if necessary (for PNG with transparency, keep RGBA)
        if img.mode in ("P", "LA"):
            img = img.convert("RGBA")
        
        img.save(dst, "WEBP", quality=85, method=6)
        converted.append(os.path.basename(dst))
        print(f"Converted: {os.path.basename(src)} -> {os.path.basename(dst)}")
    except Exception as e:
        print(f"Error converting {os.path.basename(src)}: {e}")

print(f"\nDone! Converted {len(converted)} files. Skipped {len(skipped)} existing.")
