#!/usr/bin/env python3
"""Remove backgrounds from logos and make them truly transparent."""

from PIL import Image
import os

def remove_background(input_path, output_path):
    """Remove background and make image transparent."""
    try:
        img = Image.open(input_path)
        
        # Convert to RGBA if needed
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Get pixel data
        data = img.getdata()
        
        # Create new image data with transparency
        new_data = []
        for item in data:
            # Check if pixel is grey/checkered background (various grey tones)
            # or if it's close to black/dark grey
            r, g, b, a = item
            
            # Remove grey checkered backgrounds (grey tones between 50-200)
            if (50 < r < 200 and 50 < g < 200 and 50 < b < 200 and 
                abs(r - g) < 30 and abs(g - b) < 30 and abs(r - b) < 30):
                new_data.append((255, 255, 255, 0))  # Make transparent
            # Also remove very dark backgrounds (close to black)
            elif r < 40 and g < 40 and b < 40:
                new_data.append((255, 255, 255, 0))  # Make transparent
            else:
                new_data.append(item)  # Keep original
        
        img.putdata(new_data)
        
        # Crop to content
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
        
        # Make square with transparent padding
        width, height = img.size
        max_dim = max(width, height)
        square_img = Image.new('RGBA', (max_dim, max_dim), (255, 255, 255, 0))
        offset = ((max_dim - width) // 2, (max_dim - height) // 2)
        square_img.paste(img, offset, img)
        
        # Save
        square_img.save(output_path, 'PNG')
        print(f"✓ Cleaned {os.path.basename(input_path)}")
        return True
        
    except Exception as e:
        print(f"✗ Error processing {input_path}: {e}")
        return False

if __name__ == '__main__':
    logos_dir = 'logos'
    
    print("Removing backgrounds from logos...\n")
    
    # Process specific logos that need background removal
    logos_to_clean = ['python.png', 'sql.png', 'aws.png', 'powerbi.png']
    
    for logo in logos_to_clean:
        input_path = os.path.join(logos_dir, logo)
        if os.path.exists(input_path):
            remove_background(input_path, input_path)
    
    print("\nDone!")
