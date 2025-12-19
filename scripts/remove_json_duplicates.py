import json
import os
from collections import OrderedDict

def remove_duplicates_from_json(file_path):
    """
    Remove duplicate keys from JSON file, keeping only the first occurrence.
    Uses a custom JSON parser to handle duplicates.
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Parse JSON while tracking duplicates
    seen_keys = set()
    duplicates = []
    
    def object_pairs_hook(pairs):
        result = OrderedDict()
        for key, value in pairs:
            if key in result:
                duplicates.append(key)
            else:
                result[key] = value
        return result
    
    # Parse with custom hook
    data = json.loads(content, object_pairs_hook=object_pairs_hook)
    
    if duplicates:
        print(f"\n{file_path}:")
        print(f"  Found {len(duplicates)} duplicate keys:")
        for dup in duplicates:
            print(f"    - {dup}")
        
        # Write cleaned JSON back
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        
        print(f"  ✅ Removed duplicates and saved file")
        return len(duplicates)
    else:
        print(f"\n{file_path}: No duplicates found")
        return 0

def main():
    skills_dir = r"e:\Proyectos\EpicSeven\web\messages\skills"
    
    json_files = [
        "en.json",
        "es.json",
        "ko.json",
        "ja.json",
        "zh.json",
        "pt.json"
    ]
    
    total_duplicates = 0
    
    for json_file in json_files:
        file_path = os.path.join(skills_dir, json_file)
        if os.path.exists(file_path):
            total_duplicates += remove_duplicates_from_json(file_path)
    
    print(f"\n{'='*50}")
    print(f"Total duplicates removed: {total_duplicates}")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()
