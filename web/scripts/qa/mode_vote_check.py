"""Prueba la nota por modo de la comunidad en el detalle de una build.

Uso: python -I web/scripts/qa/mode_vote_check.py <base_url> <build_id>
No escribe en producción: GET/POST /builds/{id}/mode-votes se responden en la prueba.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright  # noqa: E402

from _shared import API, DESKTOP, add_cors_shim  # noqa: E402

BASE, BUILD = sys.argv[1], sys.argv[2]
sys.stdout.reconfigure(encoding='utf-8')
CORS = {'access-control-allow-origin': BASE, 'access-control-allow-credentials': 'true'}
ok = True


def check(cond, msg):
    global ok
    ok &= bool(cond)
    print(('OK   ' if cond else 'FAIL ') + msg)


def state(votes):
    community = {m: {'avg': None, 'count': 0} for m in ('pve', 'arena', 'gw', 'rta')}
    community['rta'] = {'avg': 4.0, 'count': 3}
    for mode, tier in votes.items():
        if tier:
            prev = community[mode]
            total = prev['count'] + 1
            community[mode] = {'avg': ((prev['avg'] or 0) * prev['count'] + tier) / total, 'count': total}
    return {'community': community, 'my_votes': {m: votes.get(m) for m in community}, 'can_vote': True}


with sync_playwright() as p:
    browser = p.chromium.launch()

    # Visitante: ve la nota, no los botones
    context = browser.new_context(**DESKTOP)
    add_cors_shim(context, BASE)
    context.route(f'{API}builds/{BUILD}/mode-votes', lambda r: r.fulfill(status=200, json={**state({}), 'my_votes': None, 'can_vote': False}, headers=CORS))
    page = context.new_page()
    page.goto(f'{BASE}/builds/{BUILD}', wait_until='networkidle')
    section = page.get_by_role('region', name='Community rating')
    check(section.count() == 1, 'visitante: se muestra la nota de la comunidad')
    check('3 votes' in section.inner_text(), 'visitante: RTA con 3 votos')
    check(section.get_by_role('button').count() == 0, 'visitante: sin botones de voto')
    check(page.get_by_role('link', name='Log in to vote').count() == 1, 'visitante: invita a iniciar sesión')
    context.close()

    # Usuario con sesión: vota, cambia y quita
    context = browser.new_context(**DESKTOP)
    add_cors_shim(context, BASE)
    context.add_init_script("localStorage.setItem('auth_token', 'token-de-prueba')")
    context.route(f'{API}user', lambda r: r.fulfill(status=204, headers={**CORS, 'access-control-allow-headers': '*'})
                  if r.request.method == 'OPTIONS' else r.fulfill(status=200, json={'id': 99999, 'name': 'Tester'}, headers=CORS))
    votes, sent = {}, []

    def mode_votes(route):
        if route.request.method == 'OPTIONS':
            return route.fulfill(status=204, headers={**CORS, 'access-control-allow-headers': '*', 'access-control-allow-methods': '*'})
        if route.request.method == 'POST':
            body = json.loads(route.request.post_data)
            sent.append(body)
            votes[body['mode']] = body['tier']
        route.fulfill(status=200, json=state(votes), headers=CORS)

    context.route(f'{API}builds/{BUILD}/mode-votes', mode_votes)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)[:150]))
    page.goto(f'{BASE}/builds/{BUILD}', wait_until='networkidle')
    group = page.get_by_role('group', name='Your vote: PVE')
    check(group.count() == 1, 'con sesión: botones D–S por modo')
    group.get_by_role('button', name='A').click()
    page.wait_for_timeout(500)
    check(sent[-1:] == [{'mode': 'pve', 'tier': 4}], f'vota A en PvE ({sent[-1:]})')
    check(group.get_by_role('button', name='A').get_attribute('aria-pressed') == 'true', 'el voto queda marcado')
    group.get_by_role('button', name='A').click()
    page.wait_for_timeout(500)
    check(sent[-1:] == [{'mode': 'pve', 'tier': None}], f'otro clic en A quita el voto ({sent[-1:]})')
    check(not errors, f'sin errores de JS {errors}')
    browser.close()

sys.exit(0 if ok else 1)
