#!/usr/bin/env python3
"""Download PNG technology logos and crop to square format."""

import requests
from PIL import Image
from io import BytesIO
import os

# Direct PNG logo URLs
LOGOS = {
    'python': 'https://raw.githubusercontent.com/gilbarbara/logos/main/logos/python.svg',
    'sql': 'https://raw.githubusercontent.com/gilbarbara/logos/main/logos/postgresql.svg',
    'r': 'https://www.r-project.org/logo/Rlogo.png',
    'aws': 'https://raw.githubusercontent.com/gilbarbara/logos/main/logos/aws.svg',
    'powerbi': 'https://raw.githubusercontent.com/gilbarbara/logos/main/logos/microsoft-power-bi.svg',
    'excel': 'https://img.icons8.com/color/512/microsoft-excel-2019.png',
}

def download_logo(name, url, output_dir='logos'):
    """Download logo."""
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        print(f"Downloading {name} from {url[:60]}...")
        response = requests.get(url, timeout=15, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()
        
        output_path = os.path.join(output_dir, f'{name}.png' if url.endswith('.png') else f'{name}.svg')
        
        with open(output_path, 'wb') as f:
            f.write(response.content)
        
        print(f"  ✓ Saved to {output_path}")
        return True
        
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

if __name__ == '__main__':
    print("Downloading logos...\n")
    success_count = 0
    for name, url in LOGOS.items():
        if download_logo(name, url):
            success_count += 1
    print(f"\nDownloaded {success_count}/{len(LOGOS)} logos successfully!")
