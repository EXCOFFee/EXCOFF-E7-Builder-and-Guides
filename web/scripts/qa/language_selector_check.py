"""Prueba el selector de idioma con mouse y teclado, y guarda capturas.

Uso: python -I web/scripts/qa/language_selector_check.py <base_url> <carpeta_capturas>
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright  # noqa: E402

from _shared import DESKTOP, MOBILE, add_cors_shim  # noqa: E402

BASE, SHOTS = sys.argv[1], sys.argv[2]
os.makedirs(SHOTS, exist_ok=True)
sys.stdout.reconfigure(encoding='utf-8')
ok = True


def check(cond, msg):
    global ok
    ok &= bool(cond)
    print(('OK   ' if cond else 'FAIL ') + msg)


def focused(page):
    # Primer <span> de la opción = nombre del idioma (el segundo es el código o el check)
    return page.evaluate("((document.activeElement.querySelector('span') || document.activeElement).textContent || '').trim()")


with sync_playwright() as p:
    browser = p.chromium.launch()

    # Escritorio: aspecto y teclado
    context = browser.new_context(**DESKTOP)
    add_cors_shim(context, BASE)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(f'{BASE}/heroes/', wait_until='networkidle')
    button = page.get_by_role('button', name='Language: English')
    check(button.count() == 1, 'botón con nombre accesible "Language: English"')
    check('🇺' not in button.inner_text() and 'US' not in button.inner_text(), f'sin bandera ni "US" en el botón ({button.inner_text()!r})')
    check(button.get_attribute('aria-expanded') == 'false', 'aria-expanded=false cerrado')
    page.screenshot(path=os.path.join(SHOTS, 'selector-cerrado.png'), clip={'x': 900, 'y': 0, 'width': 450, 'height': 70})

    button.focus()
    page.keyboard.press('Enter')
    check(button.get_attribute('aria-expanded') == 'true', 'Enter abre la lista (aria-expanded=true)')
    check(focused(page) == 'English', f'al abrir, el foco va al idioma actual ({focused(page)!r})')
    page.screenshot(path=os.path.join(SHOTS, 'selector-abierto.png'), clip={'x': 1050, 'y': 0, 'width': 300, 'height': 330})
    page.keyboard.press('ArrowDown')
    check(focused(page) == 'Español', 'flecha abajo → Español')
    page.keyboard.press('End')
    check(focused(page) == '简体中文', 'End → último idioma')
    page.keyboard.press('ArrowDown')
    check(focused(page) == 'English', 'flecha abajo en el último vuelve al primero')
    page.keyboard.press('Escape')
    check(page.locator('ul[aria-label="Language"]').count() == 0, 'Escape cierra')
    check(page.evaluate("document.activeElement.getAttribute('aria-controls') !== null"), 'Escape devuelve el foco al botón')

    page.keyboard.press('Enter')
    page.keyboard.press('ArrowDown')
    page.keyboard.press('Enter')
    page.get_by_role('button', name='Idioma: Español').wait_for(timeout=15000)
    check(page.locator('html').get_attribute('lang') == 'es', 'elegir Español con teclado cambia la página a español')
    check(page.get_by_role('link', name='Héroes').count() > 0, 'navbar traducida')
    page.get_by_role('button', name='Idioma: Español').click()
    active = page.locator('[aria-current="true"]')
    check(active.count() == 1 and active.inner_text().strip().startswith('Español'), 'opción activa marcada con aria-current')
    check(page.locator('ul button[lang="ko"]').count() == 1, 'cada opción tiene lang (lector la pronuncia bien)')
    page.keyboard.press('Escape')
    page.screenshot(path=os.path.join(SHOTS, 'selector-es.png'), clip={'x': 900, 'y': 0, 'width': 450, 'height': 70})
    check(not errors, f'sin errores de JS {errors[:2]}')
    context.close()

    # Móvil: el botón muestra el código y no se desborda
    context = browser.new_context(**MOBILE)
    add_cors_shim(context, BASE)
    page = context.new_page()
    page.goto(f'{BASE}/heroes/', wait_until='networkidle')
    button = page.get_by_role('button', name='Language: English')
    box = button.bounding_box()
    check(button.inner_text().strip() == 'EN', f'móvil: muestra el código ({button.inner_text().strip()!r})')
    check(box and box['x'] + box['width'] <= 412, 'móvil: el botón entra en la pantalla')
    page.screenshot(path=os.path.join(SHOTS, 'selector-movil.png'), clip={'x': 0, 'y': 0, 'width': 412, 'height': 70})
    context.close()
    browser.close()

print('TODO OK' if ok else 'HAY FALLAS')
sys.exit(0 if ok else 1)
