#!/usr/bin/env python3
"""Check Fribbels herodata and compare with local DB."""

import urllib.request
import json

def main():
    # Download Fribbels herodata
    url = "http://e7-optimizer-game-data.s3-accelerate.amazonaws.com/herodata.json"
    
    print(f"Fetching data from Fribbels...")
    with urllib.request.urlopen(url, timeout=30) as response:
        raw_data = json.loads(response.read().decode())
    
    # Check if it's a dict (code -> hero) or list format
    if isinstance(raw_data, dict):
        data = list(raw_data.values())
        print(f"Format: Dictionary with {len(data)} heroes")
    else:
        data = raw_data
        print(f"Format: List with {len(data)} heroes")
    
    print(f"Total heroes in Fribbels: {len(data)}")
    print()
    
    # Sort by name and show last 15 heroes
    heroes_sorted = sorted(data, key=lambda h: h.get('name', '') if isinstance(h, dict) else '')
    
    print("=== Last 15 heroes (alphabetically) ===")
    for hero in heroes_sorted[-15:]:
        if isinstance(hero, dict):
            name = hero.get('name', '?')
            code = hero.get('_id', hero.get('code', '?'))
            has_skills = 'skills' in hero and hero['skills']
            has_stats = 'calculatedStatus' in hero
            print(f"  {name} ({code}) - Skills: {'Yes' if has_skills else 'No'}, Stats: {'Yes' if has_stats else 'No'}")
    
    print()
    print("=== Heroes without full data ===")
    incomplete = []
    for hero in data:
        if not isinstance(hero, dict):
            continue
        name = hero.get('name', '?')
        code = hero.get('_id', hero.get('code', '?'))
        has_skills = 'skills' in hero and hero['skills']
        has_stats = 'calculatedStatus' in hero
        
        if not has_skills or not has_stats:
            incomplete.append({
                'name': name,
                'code': code,
                'has_skills': has_skills,
                'has_stats': has_stats
            })
    
    if incomplete:
        print(f"Found {len(incomplete)} heroes with incomplete data:")
        for h in incomplete[:20]:
            print(f"  - {h['name']} ({h['code']}) - Skills: {h['has_skills']}, Stats: {h['has_stats']}")
        if len(incomplete) > 20:
            print(f"  ... and {len(incomplete) - 20} more")
    else:
        print("All heroes have complete data!")

if __name__ == "__main__":
    main()
