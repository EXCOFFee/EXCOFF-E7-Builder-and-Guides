"""Prueba BuildForm (crear y editar) interceptando lo que se envía a la API.

Uso: python -I web/scripts/qa/build_form_check.py <base_url>
No escribe nada en producción: los POST se responden en la prueba.
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright  # noqa: E402

from _shared import API, DESKTOP, add_cors_shim  # noqa: E402

BASE = sys.argv[1]
sys.stdout.reconfigure(encoding='utf-8')
ok = True
CORS = {'access-control-allow-origin': BASE, 'access-control-allow-credentials': 'true'}


def check(cond, msg):
    global ok
    ok &= bool(cond)
    print(('OK   ' if cond else 'FAIL ') + msg)


def multipart_fields(request):
    """Campos de texto de un cuerpo multipart (los archivos se ignoran)."""
    body = request.post_data_buffer.decode('utf-8', 'replace')
    fields = {}
    for name, value in re.findall(r'name="([^"]+)"\r\n\r\n(.*?)\r\n--', body, re.S):
        fields[name] = value
    return fields


def fake_session(context):
    context.add_init_script("localStorage.setItem('auth_token', 'token-de-prueba')")

    def user(route):
        if route.request.method == 'OPTIONS':
            return route.fulfill(status=204, headers={**CORS, 'access-control-allow-headers': '*', 'access-control-allow-methods': '*'})
        route.fulfill(status=200, json={'id': 1, 'name': 'Tester'}, headers=CORS)

    context.route(f'{API}user', user)


with sync_playwright() as p:
    browser = p.chromium.launch()

    # ── Crear ────────────────────────────────────────────────────────
    context = browser.new_context(**DESKTOP)
    add_cors_shim(context, BASE)
    fake_session(context)
    sent = {}

    def capture_create(route):
        if route.request.method == 'OPTIONS':
            return route.fulfill(status=204, headers={**CORS, 'access-control-allow-headers': '*', 'access-control-allow-methods': '*'})
        if route.request.method != 'POST':
            return route.fallback()
        sent.update(multipart_fields(route.request))
        route.fulfill(status=201, json={'id': 999}, headers=CORS)

    context.route(f'{API}builds', capture_create)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)[:150]))
    page.goto(f'{BASE}/builds/create/?hero_id=6&hero_name=Adventurer%20Ras', wait_until='networkidle')
    page.wait_for_timeout(1500)

    check(page.get_by_role('button', name=re.compile(r'Hero \*: Adventurer Ras')).count() == 1, 'crear: héroe preseleccionado desde la URL')
    atk = page.locator('#stat-atk')
    check(atk.input_value() == '' and atk.get_attribute('placeholder') == '758',
          f"crear: ATK vacío con el stat base como placeholder ({atk.input_value()!r}, {atk.get_attribute('placeholder')!r})")
    skill_selects = page.locator('select[aria-label$="Upgrade Level"]')
    check(skill_selects.count() == 3, f'crear: se muestran las 3 skills ({skill_selects.count()}) — antes nunca aparecían')

    page.locator('#build-title').fill('Prueba QA')
    page.locator('#stat-atk').fill('4100')
    skill_selects.nth(0).select_option('5')
    page.get_by_role('button', name='Artifact (optional)', exact=True).click()
    page.get_by_placeholder('Search artifact...').fill('Proof of Valor')
    page.get_by_role('button', name='Proof of Valor', exact=True).click()
    picker = page.get_by_role('button', name='Artifact (optional): Proof of Valor', exact=True)
    check(picker.count() == 1, 'crear: artefacto elegido con el buscador')
    picker.click()
    page.get_by_role('heading', name='Create New Build').click()  # fuera del selector (la lista abierta tapa los campos de abajo)
    check(page.get_by_placeholder('Search artifact...').count() == 0, 'crear: el selector se cierra al hacer clic afuera')
    page.get_by_role('button', name='Speed').first.click()
    page.get_by_label('Publish anonymously').check()
    page.get_by_role('button', name='Publish Build').click()
    page.wait_for_url('**/heroes/adventurer-ras/**', timeout=10000)

    stats = json.loads(sent.get('min_stats', '{}'))
    check(sent.get('hero_id') == '6' and sent.get('title') == 'Prueba QA', 'crear: envía hero_id y título')
    check(stats == {'atk': 4100}, f'crear: min_stats solo con lo que escribió el usuario {stats}')
    check(sent.get('skill_1') == '5' and sent.get('is_anonymous') == '1', 'crear: nivel de skill y anónimo')
    check(sent.get('artifact_id') and sent.get('primary_set') == 'speed', f"crear: artefacto y set ({sent.get('artifact_id')}, {sent.get('primary_set')})")
    check(not errors, f'crear: sin errores de JS {errors[:1]}')
    context.close()

    # ── Editar (build real con datos viejos simulados) ───────────────
    context = browser.new_context(**DESKTOP)
    add_cors_shim(context, BASE)
    fake_session(context)
    sent = {}

    def build_67(route):
        if route.request.method == 'OPTIONS':
            return route.fulfill(status=204, headers={**CORS, 'access-control-allow-headers': '*', 'access-control-allow-methods': '*'})
        if route.request.method == 'POST':
            sent.update(multipart_fields(route.request))
            return route.fulfill(status=200, json={'id': 67}, headers=CORS)
        build = route.fetch().json()
        # Formato que dejaba el formulario de edición viejo
        build['min_stats'] = {'atk': 1751, 'chc': 100, 'chd': 250, 'efr': 50}
        build['is_anonymous'] = True
        build['images'] = ['https://moccasin-sparrow-217730.hostingersite.com/storage/builds/x.png']
        route.fulfill(status=200, json=build, headers=CORS)

    context.route(re.compile(r'.*/api/builds/67(\?.*)?$'), build_67)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)[:150]))
    page.goto(f'{BASE}/builds/67/edit/', wait_until='networkidle')
    page.wait_for_timeout(1500)

    check(page.locator('#build-title').input_value() != '', f"editar: título precargado ({page.locator('#build-title').input_value()!r})")
    check(page.locator('#stat-crit_chance').input_value() == '100' and page.locator('#stat-res').input_value() == '50',
          'editar: claves viejas chc/efr se leen como Crit/RES')
    check(page.get_by_label('Publish anonymously').is_checked(), 'editar: respeta que la build es anónima')
    check(page.locator('select[aria-label$="Upgrade Level"]').count() == 3, 'editar: se muestran las 3 skills')
    check(page.get_by_role('button', name=re.compile(r'^Hero \*')).count() == 0, 'editar: el héroe no se puede cambiar')

    page.locator('#build-description').fill('')
    page.get_by_role('button', name='Remove image').click()
    page.get_by_role('button', name='Update Build').click()
    page.wait_for_url('**/builds/67/**', timeout=10000)

    stats = json.loads(sent.get('min_stats', '{}'))
    check(sent.get('_method') == 'PUT', 'editar: método PUT')
    check(sent.get('description') == '' and sent.get('image_urls') == '[]', 'editar: manda descripción e imágenes vacías para poder borrarlas')
    check(sent.get('is_anonymous') == '1', 'editar: conserva el anónimo al guardar')
    check(stats.get('crit_chance') == 100 and stats.get('res') == 50 and not ({'chc', 'chd', 'efr'} & stats.keys()),
          f'editar: guarda con las claves de la API {stats}')
    check(not errors, f'editar: sin errores de JS {errors[:1]}')
    context.close()
    browser.close()

print('TODO OK' if ok else 'HAY FALLAS')
sys.exit(0 if ok else 1)
