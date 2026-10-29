"""Capturas de la ficha de héroe en escritorio y móvil, una por elemento.

Uso: python -I web/scripts/qa/hero_design_shots.py <base_url> <carpeta_salida> [slug ...]
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright  # noqa: E402

from _shared import DESKTOP, MOBILE, add_cors_shim  # noqa: E402

BASE, OUT = sys.argv[1], sys.argv[2]
SLUGS = sys.argv[3:] or ['abyssal-yufine', 'assassin-cartuja', 'straze', 'silvertide-christy', 'notos']
os.makedirs(OUT, exist_ok=True)
sys.stdout.reconfigure(encoding='utf-8')

with sync_playwright() as p:
    browser = p.chromium.launch()
    for name, device in (('desktop', DESKTOP), ('mobile', MOBILE)):
        context = browser.new_context(**device)
        add_cors_shim(context, BASE)
        context.add_cookies([{'name': 'locale', 'value': 'es', 'url': BASE}])
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)[:200]))
        for slug in SLUGS:
            page.goto(f'{BASE}/heroes/{slug}/', wait_until='networkidle', timeout=90000)
            page.wait_for_timeout(800)
            page.screenshot(path=os.path.join(OUT, f'{slug}-{name}-top.png'))
            page.screenshot(path=os.path.join(OUT, f'{slug}-{name}-full.png'), full_page=True)
            overflow = page.evaluate('document.documentElement.scrollWidth - window.innerWidth')
            print(f'{name} {slug}: overflow horizontal {overflow}px, errores JS {errors[:1]}')
            errors.clear()
        context.close()
    browser.close()
