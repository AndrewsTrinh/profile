#!/usr/bin/env python3
"""Download general SQL database logo."""

import requests

# Try multiple SQL logo sources
SQL_LOGOS = [
    'https://cdn.worldvectorlogo.com/logos/logo-mysql-mysql-and-myphp-heroes-unmasked.svg',
    'https://www.svgrepo.com/download/303229/microsoft-sql-server-logo.svg',
    'https://upload.wikimedia.org/wikipedia/commons/8/87/Sql_data_base_with_logo.png',
]

def download_logo(urls, output_path):
    """Try downloading from multiple URLs."""
    for i, url in enumerate(urls):
        try:
            print(f"Trying source {i+1}/{len(urls)}: {url[:50]}...")
            response = requests.get(url, timeout=15, headers={'User-Agent': 'Mozilla/5.0'})
            response.raise_for_status()
            
            with open(output_path, 'wb') as f:
                f.write(response.content)
            
            print(f"✓ Successfully downloaded to {output_path}")
            return True
            
        except Exception as e:
            print(f"  ✗ Failed: {e}")
            continue
    
    print("✗ All sources failed")
    return False

if __name__ == '__main__':
    download_logo(SQL_LOGOS, 'logos/sql_new.png')
