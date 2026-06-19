#!/usr/bin/env python3
"""Convert SVG logos to PNG and crop all to square format."""

from PIL import Image
import os
import subprocess

def svg_to_png(svg_path, png_path, size=512):
    """Convert SVG to PNG using ImageMagick convert."""
    try:
        cmd = ['convert', '-background', 'none', '-density', '300', '-resize', f'{size}x{size}', svg_path, png_path]
        subprocess.run(cmd, check=True, capture_output=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        # Try with rsvg-convert as fallback
        try:
            cmd = ['rsvg-convert', '-w', str(size), '-h', str(size), '-f', 'png', svg_path, '-o', png_path]
            subprocess.run(cmd, check=True, capture_output=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            print(f"  Could not convert {svg_path} - ImageMagick or rsvg-convert not available")
            return False

def crop_to_square(img_path, output_path):
    """Crop image to square with transparent padding."""
    try:
        img = Image.open(img_path)
        
        # Convert to RGBA
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Get bounding box of non-transparent pixels
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
        
        # Make square
        width, height = img.size
        max_dim = max(width, height)
        
        # Create square image
        square_img = Image.new('RGBA', (max_dim, max_dim), (255, 255, 255, 0))
        offset = ((max_dim - width) // 2, (max_dim - height) // 2)
        square_img.paste(img, offset, img if img.mode == 'RGBA' else None)
        
        # Save
        square_img.save(output_path, 'PNG')
        return True
    except Exception as e:
        print(f"  Error cropping {img_path}: {e}")
        return False

if __name__ == '__main__':
    logos_dir = 'logos'
    
    print("Converting SVG to PNG and cropping to square...\n")
    
    # Process all files
    for filename in os.listdir(logos_dir):
        filepath = os.path.join(logos_dir, filename)
        name = os.path.splitext(filename)[0]
        
        if filename.endswith('.svg'):
            print(f"Converting {filename}...")
            temp_png = os.path.join(logos_dir, f'{name}_temp.png')
            final_png = os.path.join(logos_dir, f'{name}.png')
            
            if svg_to_png(filepath, temp_png):
                if crop_to_square(temp_png, final_png):
                    print(f"  ✓ Saved to {final_png}")
                    os.remove(temp_png)  # Remove temp file
                else:
                    print(f"  ✗ Failed to crop")
            else:
                print(f"  ✗ Failed to convert")
                
        elif filename.endswith('.png') and not filename.endswith('_temp.png'):
            print(f"Cropping {filename}...")
            final_png = os.path.join(logos_dir, f'{name}_square.png')
            if crop_to_square(filepath, final_png):
                print(f"  ✓ Saved to {final_png}")
                # Replace original with square version
                os.replace(final_png, filepath)
            else:
                print(f"  ✗ Failed to crop")
    
    print("\nDone!")
