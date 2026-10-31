"""Prueba "Leer stats de una captura" del formulario de builds con las capturas de fixtures/ocr.

Uso: python -I web/scripts/qa/ocr_check.py <base_url>
Cada <nombre>.png de fixtures/ocr va con <nombre>.json (valores esperados). No escribe en
producción: solo sube la imagen al lector del navegador y mira los campos.
"""
import glob
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright  # noqa: E402

from _shared import API, DESKTOP, add_cors_shim  # noqa: E402

BASE = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
sys.stdout.reconfigure(encoding='utf-8')
CORS = {'access-control-allow-origin': BASE, 'access-control-allow-credentials': 'true'}
KEYS = ['atk', 'def', 'hp', 'spd', 'crit_chance', 'crit_dmg', 'eff', 'res']
ok = True


def check(cond, msg):
    global ok
    ok &= bool(cond)
    print(('OK   ' if cond else 'FAIL ') + msg)


with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(**DESKTOP)
    add_cors_shim(context, BASE)
    context.add_init_script("localStorage.setItem('auth_token', 'token-de-prueba')")
    context.route(f'{API}user', lambda r: r.fulfill(status=204, headers={**CORS, 'access-control-allow-headers': '*'})
                  if r.request.method == 'OPTIONS' else r.fulfill(status=200, json={'id': 1, 'name': 'Tester'}, headers=CORS))
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)[:150]))
    page.goto(f'{BASE}/builds/create/?hero_id=6', wait_until='domcontentloaded')
    page.get_by_text('Read stats from a screenshot').wait_for(timeout=60000)

    for png in sorted(glob.glob(os.path.join(HERE, 'fixtures', 'ocr', '*.png'))):
        name = os.path.splitext(os.path.basename(png))[0]
        expected = json.load(open(png[:-4] + '.json', encoding='utf-8'))

        page.locator('input[type=file][accept="image/png,image/jpeg,image/webp"]').set_input_files(png)
        page.get_by_text('Check the values before using them:').wait_for(timeout=90000)
        reader = page.get_by_text('Check the values before using them:').locator('..')
        read = [reader.locator('input[type=number]').nth(i).input_value() for i in range(len(KEYS))]
        hits = sum(1 for key, value in zip(KEYS, read) if expected.get(key) == value)
        check(hits == len(KEYS), f'{name}: {hits}/{len(KEYS)} stats leídos bien {dict(zip(KEYS, read))}')

        page.get_by_role('button', name='Use these values').click()
        filled = page.locator('#stat-spd').input_value()
        check(filled == read[3], f'{name}: "Usar estos valores" completa el formulario (SPD {filled!r})')

    check(not errors, f'sin errores de JS {errors}')
    browser.close()

sys.exit(0 if ok else 1)
