import json
import os

skills_dir = r"e:\Proyectos\EpicSeven\web\messages\skills"
files = ['en.json', 'es.json', 'ko.json', 'ja.json', 'zh.json', 'pt.json']

for f in files:
    filepath = os.path.join(skills_dir, f)
    data = json.load(open(filepath, encoding='utf-8'))
    print(f'{f}: {len(data)} heroes')
