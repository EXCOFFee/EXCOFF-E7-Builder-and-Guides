#!/usr/bin/env python3
"""Check Fribbels skills format and descriptions."""

import urllib.request
import json

def main():
    url = "http://e7-optimizer-game-data.s3-accelerate.amazonaws.com/herodata.json"
    
    print("Fetching data from Fribbels...")
    with urllib.request.urlopen(url, timeout=30) as response:
        raw_data = json.loads(response.read().decode())
    
    heroes = list(raw_data.values()) if isinstance(raw_data, dict) else raw_data
    
    # Check full hero data for Setsuka
    for h in heroes:
        if h.get('name') == 'Setsuka':
            print("\n=== Full Setsuka Data ===")
            # Print all keys
            print("Keys:", list(h.keys()))
            # Check if there are skill descriptions anywhere
            skills = h.get('skills', {})
            for sk_name, sk_data in skills.items():
                print(f"\n{sk_name} keys: {list(sk_data.keys())}")
                if 'description' in sk_data:
                    print(f"  description: {sk_data['description']}")
            break

if __name__ == "__main__":
    main()
