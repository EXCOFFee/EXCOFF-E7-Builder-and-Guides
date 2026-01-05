#!/usr/bin/env python3
"""Analyze heroes to find missing data."""

import urllib.request
import json

def main():
    url = "http://e7-optimizer-game-data.s3-accelerate.amazonaws.com/herodata.json"
    
    print("Fetching data from Fribbels...")
    with urllib.request.urlopen(url, timeout=60) as response:
        raw_data = json.loads(response.read().decode())
    
    heroes = list(raw_data.values()) if isinstance(raw_data, dict) else raw_data
    print(f"Total heroes: {len(heroes)}")
    
    # Analyze each hero
    missing_skills = []
    missing_rate = []
    has_soulburn = []
    no_soulburn = []
    
    for h in heroes:
        name = h.get('name', '?')
        skills = h.get('skills', {})
        
        if not skills:
            missing_skills.append(name)
            continue
        
        # Check each skill
        has_all_rates = True
        hero_has_sb = False
        
        for sk_name, sk_data in skills.items():
            if not sk_data.get('rate') and not sk_data.get('hitTypes'):
                # Non-damage skill, skip rate check
                pass
            elif sk_data.get('hitTypes') and not sk_data.get('rate'):
                has_all_rates = False
            
            if sk_data.get('soulburn'):
                hero_has_sb = True
        
        if not has_all_rates and name not in missing_skills:
            missing_rate.append(name)
        
        if hero_has_sb:
            has_soulburn.append(name)
        else:
            no_soulburn.append(name)
    
    # Output results
    results = {
        "summary": {
            "total_heroes": len(heroes),
            "heroes_missing_skills_completely": len(missing_skills),
            "heroes_missing_some_rates": len(missing_rate),
            "heroes_with_soulburn_data": len(has_soulburn),
            "heroes_without_soulburn_data": len(no_soulburn)
        },
        "missing_skills_completely": missing_skills[:50],
        "missing_some_rates": missing_rate[:50],
        "sample_heroes_no_soulburn": no_soulburn[:30]
    }
    
    with open('scripts/hero_analysis.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print("\n=== Summary ===")
    print(f"Heroes missing skills completely: {len(missing_skills)}")
    print(f"Heroes missing some rates: {len(missing_rate)}")
    print(f"Heroes WITH soulburn data in Fribbels: {len(has_soulburn)}")
    print(f"Heroes WITHOUT soulburn in Fribbels: {len(no_soulburn)}")
    print("\nSaved detailed analysis to scripts/hero_analysis.json")

if __name__ == "__main__":
    main()
