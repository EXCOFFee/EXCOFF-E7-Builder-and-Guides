"""Prueba el filtro de builds por pros/contras y los tags que llevan a la lista filtrada.

Uso: python -I web/scripts/qa/tag_filter_check.py <base_url>
Solo lectura: mira la URL de la página y los parámetros que se mandan a GET /api/builds.
"""
import os
import sys
from urllib.parse import parse_qs, urlparse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright  # noqa: E402

from _shared import DESKTOP, add_cors_shim  # noqa: E402

BASE = sys.argv[1]
sys.stdout.reconfigure(encoding='utf-8')
ok = True


def check(cond, msg):
    global ok
    ok &= bool(cond)
    print(('OK   ' if cond else 'FAIL ') + msg)


with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(**DESKTOP)
    add_cors_shim(context, BASE)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)[:150]))
    api_calls = []
    page.on('request', lambda r: api_calls.append(r.url) if '/api/builds?' in r.url else None)

    # Un link de tag (como los de la ficha o el detalle de build) abre el filtro ya aplicado
    page.goto(f'{BASE}/builds?tags=team_cr_push', wait_until='networkidle')
    check(page.get_by_role('button', name='Remove Team CR Push').count() == 1, 'el tag de la URL aparece como filtro activo')
    last = parse_qs(urlparse(api_calls[-1]).query) if api_calls else {}
    check(last.get('tags') == ['team_cr_push'], f'se pide a la API con tags ({last.get("tags")})')

    # Segundo clic sobre otro tag: incluir y después excluir
    page.get_by_label('Search tags...').fill('aoe')
    aoe = page.get_by_role('button', name='AoE damage: not filtered')
    aoe.click()
    page.wait_for_timeout(600)
    check('aoe_damage' in parse_qs(urlparse(page.url).query).get('tags', [''])[0], f'incluir agrega a ?tags ({page.url})')
    page.get_by_role('button', name='AoE damage: included').click()
    page.wait_for_timeout(600)
    query = parse_qs(urlparse(page.url).query)
    check(query.get('exclude_tags') == ['aoe_damage'] and query.get('tags') == ['team_cr_push'], f'segundo clic pasa a ?exclude_tags ({page.url})')

    # Contras y grupos
    page.get_by_label('Search tags...').fill('')
    page.get_by_role('button', name='Cons', exact=True).click()
    page.get_by_label('Group').select_option(label='Dependencies')
    check(page.get_by_role('button', name='Needs dupes (imprint): not filtered').count() == 1, 'contras filtrados por grupo (Dependencias)')

    page.get_by_role('list', name='Active tag filters').get_by_role('button', name='Clear', exact=True).click()
    page.wait_for_timeout(600)
    check(urlparse(page.url).query == '', f'limpiar deja la URL sin filtros ({page.url})')
    check(not errors, f'sin errores de JS {errors}')

    browser.close()

sys.exit(0 if ok else 1)
