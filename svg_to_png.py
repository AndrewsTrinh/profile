#!/usr/bin/env python3
"""Convert SVG logos to PNG with transparent backgrounds using cairosvg."""

import os
try:
    import cairosvg
    from PIL import Image
    from io import BytesIO
    
    def svg_to_png_transparent(svg_path, png_path):
        """Convert SVG to PNG with transparent background."""
        try:
            # Convert SVG to PNG bytes
            png_bytes = cairosvg.svg2png(url=svg_path, background_color=None)
            
            # Open with PIL
            img = Image.open(BytesIO(png_bytes))
            
            # Ensure RGBA mode
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
            
            # Crop to content (remove extra transparent space)
            bbox = img.getbbox()
            if bbox:
                img = img.crop(bbox)
            
            # Save
            img.save(png_path, 'PNG')
            print(f"✓ Converted {os.path.basename(svg_path)} -> {os.path.basename(png_path)}")
            return True
            
        except Exception as e:
            print(f"✗ Error converting {svg_path}: {e}")
            return False
    
    if __name__ == '__main__':
        logos_dir = 'logos'
        
        print("Converting SVG logos to PNG with transparent backgrounds...\n")
        
        # Convert SVG files
        svg_files = ['python.svg', 'sql.svg', 'aws.svg', 'powerbi.svg']
        
        for svg_file in svg_files:
            svg_path = os.path.join(logos_dir, svg_file)
            png_file = svg_file.replace('.svg', '.png')
            png_path = os.path.join(logos_dir, png_file)
            
            if os.path.exists(svg_path):
                svg_to_png_transparent(svg_path, png_path)
        
        print("\nDone!")

except ImportError:
    print("cairosvg not installed. Installing...")
    import subprocess
    subprocess.run(['pip3', 'install', 'cairosvg'], check=True)
    print("\nPlease run this script again.")
