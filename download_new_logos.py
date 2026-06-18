#!/usr/bin/env python3
"""Download GCP and Spark logos."""

import requests

LOGOS = {
    'gcp': 'https://raw.githubusercontent.com/gilbarbara/logos/main/logos/google-cloud.svg',
    'spark': 'https://raw.githubusercontent.com/gilbarbara/logos/main/logos/apache-spark.svg',
}

def download_logo(name, url, output_dir='logos'):
    """Download logo from URL."""
    try:
        print(f"Downloading {name}...")
        response = requests.get(url, timeout=15, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()
        
        output_path = f'{output_dir}/{name}.svg'
        with open(output_path, 'wb') as f:
            f.write(response.content)
        
        print(f"  ✓ Saved to {output_path}")
        return True
        
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

if __name__ == '__main__':
    print("Downloading GCP and Spark logos...\n")
    for name, url in LOGOS.items():
        download_logo(name, url)
    print("\nDone!")
