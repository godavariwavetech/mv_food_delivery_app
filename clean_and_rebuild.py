#!/usr/bin/env python3
"""
Complete clean and rebuild script for MV Delivery app with new launcher icon
"""
import os
import shutil
import subprocess
import sys

print("=" * 70)
print("MV DELIVERY - CLEAN AND REBUILD WITH NEW LAUNCHER ICON")
print("=" * 70)

# Step 1: Clean local caches
print("\n📁 Step 1: Cleaning local project caches...")
clean_dirs = [
    "android/app/build",
    "android/build",
    ".gradle",
    "node_modules/.gradle"
]

for dir_path in clean_dirs:
    if os.path.exists(dir_path):
        try:
            shutil.rmtree(dir_path)
            print(f"  ✓ Removed {dir_path}")
        except Exception as e:
            print(f"  ✗ Failed to remove {dir_path}: {e}")

# Step 2: Verify icon files
print("\n🎨 Step 2: Verifying launcher icon files...")
densities = ["ldpi", "mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"]
all_icons_present = True

for density in densities:
    icon_path = f"android/app/src/main/res/mipmap-{density}/ic_launcher_foreground.png"
    if os.path.exists(icon_path):
        size_kb = os.path.getsize(icon_path) / 1024
        print(f"  ✓ mipmap-{density}/ic_launcher_foreground.png ({size_kb:.2f}KB)")
    else:
        print(f"  ✗ Missing: mipmap-{density}/ic_launcher_foreground.png")
        all_icons_present = False

if not all_icons_present:
    print("\n❌ ERROR: Some icon files are missing!")
    sys.exit(1)

# Step 3: Verify adaptive icon configuration
print("\n📋 Step 3: Verifying adaptive icon configuration...")
adaptive_icon_path = "android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml"
with open(adaptive_icon_path, 'r') as f:
    content = f.read()
    if "ic_launcher_background" in content and "ic_launcher_foreground" in content:
        print("  ✓ Adaptive icon correctly configured")
    else:
        print("  ✗ Adaptive icon configuration may be incorrect")

print("\n" + "=" * 70)
print("✅ CLEANUP COMPLETE!")
print("=" * 70)
print("\n📱 NEXT STEPS:")
print("1. Connect your Android device")
print("2. Uninstall the old app: adb uninstall com.multivendordelivery")
print("3. Run: npm start (in one terminal)")
print("4. Run: react-native run-android (in another terminal)")
print("\nThe new mvAppIcon launcher should now appear!")
print("=" * 70)
