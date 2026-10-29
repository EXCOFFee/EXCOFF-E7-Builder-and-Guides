"""Capturas de varias páginas en escritorio y móvil, con desborde horizontal y errores de JS.

Uso: python -I web/scripts/qa/page_shots.py <base_url> <carpeta_salida> <ruta> [<ruta> ...]
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright  # noqa: E402

from _shared import DESKTOP, MOBILE, add_cors_shim  # noqa: E402

BASE, OUT, PATHS = sys.argv[1], sys.argv[2], sys.argv[3:]
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
        for path in PATHS:
            slug = re.sub(r'[^a-z0-9]+', '-', path.strip('/').lower()) or 'home'
            page.goto(f'{BASE}{path}', wait_until='networkidle', timeout=90000)
            page.wait_for_timeout(800)
            page.screenshot(path=os.path.join(OUT, f'{slug}-{name}.png'), full_page=True)
            overflow = page.evaluate('document.documentElement.scrollWidth - window.innerWidth')
            # error.tsx muestra "Error ID": un error de render del servidor no llega como pageerror
            boundary = page.get_by_text('Error ID').count() > 0
            print(f'{name} {path}: overflow {overflow}px, errores JS {errors[:1]}'
                  + (' | PANTALLA DE ERROR' if boundary else ''))
            errors.clear()
        context.close()
    browser.close()
