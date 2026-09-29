#!/usr/bin/env python3
"""
Convert mvAppIcon.jpeg to PNG and replace all launcher icons across all mipmap directories
"""
from PIL import Image
import os
import shutil

# Source image
source_path = "src/assets/mvAppIcon.jpeg"

# Define all mipmap directories with their required icon sizes
mipmap_dirs = {
    "mipmap-ldpi": 36,
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192
}

base_path = "android/app/src/main/res"

print(f"Loading source image: {source_path}")
img = Image.open(source_path)
print(f"✓ Source image loaded: {img.size}")

# Convert to RGB if it has alpha channel (for PNG compatibility)
if img.mode == 'RGBA':
    print("✓ Converting RGBA to RGB")
    background = Image.new('RGB', img.size, (255, 255, 255))
    background.paste(img, mask=img.split()[3])
    img = background

for mipmap, size in mipmap_dirs.items():
    mipmap_path = os.path.join(base_path, mipmap)
    print(f"\n📁 Processing {mipmap} ({size}x{size})...")
    
    # Resize image
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    
    icon_files = ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png', 'ic_launcher_monochrome.png']
    
    for icon_file in icon_files:
        icon_path = os.path.join(mipmap_path, icon_file)
        resized.save(icon_path, 'PNG')
        print(f"  ✓ {icon_file}")
    
    # Delete background icon if it exists
    bg_icon_path = os.path.join(mipmap_path, 'ic_launcher_background.png')
    if os.path.exists(bg_icon_path):
        os.remove(bg_icon_path)
        print(f"  ✓ Removed ic_launcher_background.png")

print("\n✅ All launcher icons updated successfully!")
print("✓ ic_launcher_background.png removed from all directories")
print("✓ ic_launcher_monochrome.png matches new launcher icon")
print("\nNext steps:")
print("1. Run: react-native run-android")
print("2. Uninstall old app if still installed")
print("3. The new icon should now appear")
