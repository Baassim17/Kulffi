from PIL import Image, ImageDraw, ImageFont
import os

public_dir = r"C:\Users\mbaas\OneDrive\Documents\Antigravity Proj\ai-website-cloner-template-master\public"

# Brand colors
bg = "#A31D1D"  # terracotta
fg = "#FCE9D5"  # cream

def create_icon(size, filename):
    img = Image.new("RGB", (size, size), bg)
    draw = ImageDraw.Draw(img)
    # Draw a cream circle in the center
    margin = size // 4
    draw.ellipse([margin, margin, size - margin, size - margin], fill=fg)
    img.save(filename, "PNG")

def create_ico(filename):
    # Create multi-resolution ICO: 16, 32, 48
    sizes = [16, 32, 48]
    images = []
    for s in sizes:
        img = Image.new("RGB", (s, s), bg)
        draw = ImageDraw.Draw(img)
        margin = s // 4
        draw.ellipse([margin, margin, s - margin, s - margin], fill=fg)
        images.append(img)
    images[0].save(filename, format="ICO", sizes=[(16,16), (32,32), (48,48)])

# Generate favicon.ico
create_ico(os.path.join(public_dir, "favicon.ico"))

# Generate apple-touch-icon.png (180x180)
create_icon(180, os.path.join(public_dir, "apple-touch-icon.png"))

# Generate 192x192 and 512x512 for manifest
create_icon(192, os.path.join(public_dir, "icon-192x192.png"))
create_icon(512, os.path.join(public_dir, "icon-512x512.png"))

# Create site.webmanifest
manifest = """{
  "name": "Kulffi — Handcrafted Ice Cream",
  "short_name": "Kulffi",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F5E6D3",
  "theme_color": "#F5E6D3",
  "icons": [
    { "src": "/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}"""

with open(os.path.join(public_dir, "site.webmanifest"), "w") as f:
    f.write(manifest)

print("Generated favicon.ico, apple-touch-icon.png, icons, and site.webmanifest")
