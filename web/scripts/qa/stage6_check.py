"""Prueba las funciones de la etapa 6 con respuestas simuladas de la API.

Uso: python -I web/scripts/qa/stage6_check.py <base_url>
- Noticia de balance de la web (texto armado en el idioma de la página)
- Aviso "el héroe cambió después de esta build"
- "¿Tu build llega?" con una distribución de stats
No escribe nada: las respuestas de la API se completan en la prueba.
"""
import json
import os
import sys
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright  # noqa: E402

from _shared import API, DESKTOP, add_cors_shim  # noqa: E402

BASE = sys.argv[1]
sys.stdout.reconfigure(encoding='utf-8')
CORS = {'access-control-allow-origin': BASE, 'access-control-allow-credentials': 'true'}
ok = True


def check(cond, msg):
    global ok
    ok &= bool(cond)
    print(('OK   ' if cond else 'FAIL ') + msg)


BALANCE = {
    'id': 9999, 'title': 'Straze, Hecate', 'thumbnail': None, 'url': f'{BASE}/heroes',
    'source': 'site', 'category': 'balance', 'published_at': '2026-10-30T03:00:00Z',
    'description': json.dumps({'heroes': [{'name': 'Straze', 'slug': 'straze'}, {'name': 'Hecate', 'slug': 'hecate'}], 'affected_builds': 7}),
}

with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(**DESKTOP)
    add_cors_shim(context, BASE)
    context.add_cookies([{'name': 'locale', 'value': 'es', 'url': BASE}])
    errors = []

    def news(route):
        route.fulfill(status=200, headers=CORS, json={'data': [BALANCE], 'current_page': 1, 'last_page': 1, 'total': 1, 'categories': ['balance']})

    def build(route):
        # La build real con un cambio del héroe posterior a su última edición
        data = json.loads(urllib.request.urlopen(f'{API}builds/67').read())
        data['updated_at'] = '2026-01-01T00:00:00Z'
        data['hero']['game_data_changed_at'] = '2026-10-30T03:00:00Z'
        route.fulfill(status=200, headers=CORS, json=data)

    def distribution(route):
        route.fulfill(status=200, headers=CORS, json={'success': True, 'data': {'spd': [200, 220, 240, 260, 280], 'hp': [9000, 9500, 10000, 11000, 12000]}})

    context.route(f'{API}news?**', news)
    context.route(f'{API}builds/67?**', build)
    context.route(f'{API}heroes/straze/build-stat-distribution', distribution)

    page = context.new_page()
    page.on('pageerror', lambda e: errors.append(str(e)[:150]))

    page.goto(f'{BASE}/news', wait_until='domcontentloaded')
    page.get_by_text('Cambios de balance: Straze, Hecate').wait_for(timeout=30000)
    check(page.get_by_text('7 builds son de antes de este cambio').count() == 1, 'noticia de balance en español con builds afectadas')
    check(page.get_by_role('link', name='Cambios de balance: Straze, Hecate').get_attribute('target') is None, 'la noticia de la web abre en la misma pestaña')

    page.goto(f'{BASE}/builds/67', wait_until='domcontentloaded')
    page.get_by_text('El héroe cambió después de esta build').wait_for(timeout=30000)
    check(True, 'aviso de build desactualizada en el detalle')

    page.goto(f'{BASE}/heroes/straze', wait_until='domcontentloaded')
    section = page.get_by_role('region', name='¿Tu build llega?')
    section.wait_for(timeout=30000)
    section.get_by_label('SPD').fill('250')
    section.get_by_label('HP').fill('9200')
    check(section.get_by_text('Cumple el 60% de las builds').count() == 1, 'SPD 250 cumple 3 de 5 mínimos (60%)')
    check(section.get_by_text('Lo que más te falta: HP').count() == 1, 'marca el stat más lejos de la mediana (HP)')

    check(not errors, f'sin errores de JS {errors}')
    browser.close()

sys.exit(0 if ok else 1)
