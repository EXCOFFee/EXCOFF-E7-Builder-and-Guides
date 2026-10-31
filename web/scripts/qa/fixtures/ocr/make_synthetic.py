"""Genera capturas sintéticas de la pantalla de stats para probar la lectura (OCR).

Uso: python -I web/scripts/qa/fixtures/ocr/make_synthetic.py   (necesita Pillow)
Son de prueba: las capturas reales del juego van en esta misma carpeta, cada una con su
<nombre>.json de valores esperados (mismo formato que estas).
"""
import json
import os

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONT = 'C:/Windows/Fonts/arial.ttf'
FONT_KO = 'C:/Windows/Fonts/malgun.ttf'

SAMPLES = {
    'synthetic_es': (FONT, ['Ataque', 'Defensa', 'Vida', 'Velocidad', 'Prob. crítico', 'Daño crítico', 'Efectividad', 'Resistencia'],
                     ['3,868', '863', '9,696', '271', '100%', '296%', '0%', '18%']),
    'synthetic_ko': (FONT_KO, ['공격력', '방어력', '생명력', '속도', '치명타 확률', '치명타 피해', '효과적중', '효과저항'],
                     ['1,612', '1,566', '18,013', '259', '23%', '150%', '174%', '0%']),
}

for name, (font_path, labels, values) in SAMPLES.items():
    font = ImageFont.truetype(font_path, 26)
    img = Image.new('RGB', (620, 60 + 52 * len(labels)), (24, 26, 38))
    draw = ImageDraw.Draw(img)
    for i, (label, value) in enumerate(zip(labels, values)):
        y = 30 + i * 52
        draw.text((40, y), label, font=font, fill=(200, 196, 180))
        width = draw.textlength(value, font=font)
        draw.text((580 - width, y), value, font=font, fill=(245, 240, 225))
    img.save(os.path.join(HERE, f'{name}.png'))
    keys = ['atk', 'def', 'hp', 'spd', 'crit_chance', 'crit_dmg', 'eff', 'res']
    expected = {k: v.replace(',', '').replace('%', '') for k, v in zip(keys, values)}
    with open(os.path.join(HERE, f'{name}.json'), 'w', encoding='utf-8') as f:
        json.dump(expected, f, indent=2)
print('ok')
