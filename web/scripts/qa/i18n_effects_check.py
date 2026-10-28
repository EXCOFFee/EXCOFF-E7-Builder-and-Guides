"""Comprueba que los tooltips de efectos y el login salgan en el idioma elegido.

Uso: python -I web/scripts/qa/i18n_effects_check.py <base_url>
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright  # noqa: E402

from _shared import DESKTOP, add_cors_shim  # noqa: E402

BASE = sys.argv[1]
WEB = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
sys.stdout.reconfigure(encoding='utf-8')
EFFECTS = json.load(open(os.path.join(WEB, 'src', 'data', 'effects.json'), encoding='utf-8'))
ok = True
HANGUL = re.compile(r'[가-힣]')
KANA = re.compile(r'[぀-ヿ]')


def check(cond, msg):
    global ok
    ok &= bool(cond)
    print(('OK   ' if cond else 'FAIL ') + msg)


def first_effect_tooltip(page):
    """Pasa el mouse por el primer ícono de efecto y devuelve (nombre, descripción) del tooltip."""
    icon = page.locator('span.cursor-help[aria-label]').first
    icon.wait_for(timeout=15000)
    icon.hover()
    tip = page.locator('[data-slot="tooltip-content"], [role="tooltip"]').first
    tip.wait_for(timeout=5000)
    paragraphs = tip.locator('p').all_inner_texts()
    return icon.get_attribute('aria-label'), paragraphs


with sync_playwright() as p:
    browser = p.chromium.launch()
    for locale, script in (('ko', HANGUL), ('en', None)):
        context = browser.new_context(**DESKTOP)
        add_cors_shim(context, BASE)
        context.add_cookies([{'name': 'locale', 'value': locale, 'url': BASE}])
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)[:150]))
        page.goto(f'{BASE}/heroes/assassin-cartuja/', wait_until='networkidle')
        name, texts = first_effect_tooltip(page)
        print(f'  [{locale}] tooltip: {texts}')
        if script:
            check(texts and script.search(texts[0]) and script.search(' '.join(texts[1:]) or texts[0]),
                  f'{locale}: nombre y descripción del efecto en el idioma ({name})')
        else:
            descriptions = {e['description'] for e in EFFECTS.values()}
            check(len(texts) > 1 and texts[1] in descriptions, f'en: la descripción es la de CeciliaBot ({name})')
        check(not errors, f'{locale}: sin errores de JS {errors[:1]}')
        context.close()

    context = browser.new_context(**DESKTOP)
    context.add_cookies([{'name': 'locale', 'value': 'ja', 'url': BASE}])
    page = context.new_page()
    page.goto(f'{BASE}/login/', wait_until='networkidle')
    heading = page.locator('h1').inner_text()
    buttons = ' '.join(page.get_by_role('button').all_inner_texts())
    check(heading == 'ログイン' and 'Googleで続ける' in buttons, f'login en japonés ({heading!r})')
    context.close()
    browser.close()

print('TODO OK' if ok else 'HAY FALLAS')
sys.exit(0 if ok else 1)
