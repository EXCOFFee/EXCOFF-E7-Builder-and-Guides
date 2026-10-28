"""Chequeos de comportamiento tocados al limpiar el lint (corrección 14).

Uso: python -I web/scripts/qa/behavior_check.py <base_url>
- Páginas que piden sesión redirigen al login y guardan a dónde volver; con token se quedan.
- El menú móvil se cierra al navegar.
- El Lightbox abre, navega con flechas y cierra con Escape.
- Sin errores de JS en las páginas de detalle.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright  # noqa: E402

from _shared import API, DESKTOP, MOBILE, add_cors_shim  # noqa: E402

BASE = sys.argv[1]
sys.stdout.reconfigure(encoding='utf-8')
ok = True


def check(cond, msg):
    global ok
    ok &= bool(cond)
    print(('OK   ' if cond else 'FAIL ') + msg)


def new_page(browser, **kw):
    context = browser.new_context(**kw)
    add_cors_shim(context, BASE)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)[:150]))
    return context, page, errors


with sync_playwright() as p:
    browser = p.chromium.launch()

    # 1. Páginas con sesión, sin token
    for path in ['/builds/create/?hero_id=6', '/guides/create/', '/guilds/create/']:
        context, page, errors = new_page(browser, **DESKTOP)
        page.goto(BASE + path, wait_until='networkidle')
        page.wait_for_url('**/login/', timeout=10000)
        saved = page.evaluate("localStorage.getItem('return_url')")
        check(saved == path.rstrip('/').replace('/?', '?') or saved == path, f'{path} sin sesión → /login, return_url={saved!r}')
        context.close()

    # 2a. Sesión válida (se simula /api/user): la página se queda
    context, page, errors = new_page(browser, **DESKTOP)
    context.add_init_script("localStorage.setItem('auth_token', 'token-de-prueba')")
    cors = {'access-control-allow-origin': BASE, 'access-control-allow-credentials': 'true'}
    context.route(f'{API}user', lambda route: route.fulfill(
        status=200, json={'id': 1, 'name': 'Tester', 'email': 't@example.com'}, headers=cors)
        if route.request.method != 'OPTIONS' else route.fulfill(status=204, headers={
            **cors, 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET'}))
    page.goto(BASE + '/guides/create/', wait_until='networkidle')
    page.wait_for_timeout(1500)
    check('/guides/create' in page.url, f'con sesión válida se queda en el formulario ({page.url})')
    check(not errors, f'formulario sin errores de JS {errors[:1]}')
    context.close()

    # 2b. Sesión vencida (la API responde 401): al login, guardando a dónde volver
    context, page, errors = new_page(browser, **DESKTOP)
    context.add_init_script("if (!sessionStorage.getItem('x')) { sessionStorage.setItem('x', '1'); localStorage.setItem('auth_token', 'token-vencido'); }")
    context.route(f'{API}user', lambda route: route.fulfill(
        status=401, json={'message': 'Unauthenticated.'}, headers=cors)
        if route.request.method != 'OPTIONS' else route.fulfill(status=204, headers={
            **cors, 'access-control-allow-headers': '*', 'access-control-allow-methods': 'GET'}))
    page.goto(BASE + '/guides/create/', wait_until='networkidle')
    page.wait_for_url('**/login/', timeout=10000)
    check(page.evaluate("localStorage.getItem('auth_token')") is None, 'sesión vencida: token borrado y redirige al login')
    context.close()

    # 3. Menú móvil se cierra al navegar
    context, page, errors = new_page(browser, **MOBILE)
    page.goto(BASE + '/', wait_until='networkidle')
    menu_button = page.locator('nav button[aria-label], header button[aria-label]').filter(has_not_text='').last
    page.get_by_role('button', name='Language: English').wait_for()
    toggles = [b for b in page.locator('button').all() if 'menu' in (b.get_attribute('aria-label') or '').lower()]
    if toggles:
        toggles[0].click()
        page.wait_for_timeout(300)
        link = page.locator('a[href="/heroes/"]:visible, a[href="/heroes"]:visible').last
        link.click()
        page.wait_for_url('**/heroes/**')
        page.wait_for_timeout(500)
        open_links = page.locator('a[href="/builds/"]:visible, a[href="/builds"]:visible').count()
        check(open_links == 0, f'menú móvil cerrado después de navegar (links visibles: {open_links})')
    else:
        check(False, 'no encontré el botón del menú móvil')
    context.close()

    # 4. Lightbox en una build con imágenes
    context, page, errors = new_page(browser, **DESKTOP)
    page.goto(BASE + '/builds/67/', wait_until='networkidle')
    trigger = page.locator('.cursor-pointer:has(img)').first
    if trigger.count():
        trigger.click()
        dialog_img = page.locator('img[alt^="Image 1 of"]')
        dialog_img.wait_for(timeout=5000)
        total = int(dialog_img.get_attribute('alt').split(' of ')[1])
        if total > 1:
            page.keyboard.press('ArrowRight')
            check(page.locator('img[alt^="Image 2 of"]').count() == 1, 'Lightbox: flecha derecha pasa a la imagen 2')
        page.keyboard.press('Escape')
        page.wait_for_timeout(300)
        check(page.locator('img[alt$=" of %d"]' % total).count() == 0, f'Lightbox: Escape cierra ({total} imágenes)')
    else:
        print('SKIP Lightbox: la build 67 no tiene imágenes')
    check(not errors, f'detalle de build sin errores de JS {errors[:1]}')
    context.close()

    # 5. Detalles sin errores de JS
    for path in ['/heroes/assassin-cartuja/', '/guides/ml5-rta-tierlist-182026-early-season-DRFeCn/', '/builds/compare/']:
        context, page, errors = new_page(browser, **DESKTOP)
        page.goto(BASE + path, wait_until='networkidle')
        page.wait_for_timeout(1000)
        check(not errors, f'{path} sin errores de JS {errors[:1]}')
        context.close()

    browser.close()

print('TODO OK' if ok else 'HAY FALLAS')
sys.exit(0 if ok else 1)
