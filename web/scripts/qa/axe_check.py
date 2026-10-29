"""Corre axe-core (WCAG 2.2 A/AA) en varias páginas y resume las violaciones.

Uso: python -I web/scripts/qa/axe_check.py <axe.min.js> <base_url> <ruta> [<ruta>...]
     (axe.min.js: `npm pack axe-core` y extraer package/axe.min.js)
Variables: AXE_VIEWPORT=mobile|desktop (por defecto desktop), AXE_DETAIL=1 para ver cada nodo.
"""
import json
import os
import sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright  # noqa: E402

from _shared import DESKTOP, MOBILE, add_cors_shim  # noqa: E402

AXE, BASE, PATHS = sys.argv[1], sys.argv[2], sys.argv[3:]
VIEWPORT = MOBILE if os.environ.get('AXE_VIEWPORT') == 'mobile' else DESKTOP
DETAIL = os.environ.get('AXE_DETAIL') == '1'
sys.stdout.reconfigure(encoding='utf-8')

totals = defaultdict(int)
with sync_playwright() as p:
    browser = p.chromium.launch()
    for path in PATHS:
        context = browser.new_context(**VIEWPORT)
        add_cors_shim(context, BASE)
        page = context.new_page()
        page.goto(BASE + path, wait_until='networkidle')
        page.wait_for_timeout(1500)
        page.add_script_tag(path=AXE)
        result = page.evaluate("""() => axe.run(document, {
            runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
            resultTypes: ['violations'],
        })""")
        violations = result['violations']
        print(f"\n{path}: {sum(len(v['nodes']) for v in violations)} nodos en {len(violations)} reglas")
        for v in sorted(violations, key=lambda v: -len(v['nodes'])):
            totals[v['id']] += len(v['nodes'])
            print(f"  [{v['impact']}] {v['id']}: {len(v['nodes'])}  — {v['help']}")
            for node in v['nodes'][: (50 if DETAIL else 3)]:
                extra = ''
                data = (node.get('any') or [{}])[0].get('data') or {}
                if v['id'] == 'color-contrast' and data:
                    extra = f" {data.get('fgColor')} sobre {data.get('bgColor')} = {data.get('contrastRatio')}:1 (pide {data.get('expectedContrastRatio')})"
                print(f"      {node['target'][0][:90]}{extra}")
        context.close()
    browser.close()

print('\nTOTAL por regla:', json.dumps(dict(sorted(totals.items(), key=lambda kv: -kv[1])), ensure_ascii=False))
