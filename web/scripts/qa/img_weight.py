"""Suma el peso de las imágenes que descarga una página y compara con el tamaño en pantalla.

Uso: python -I web/scripts/qa/img_weight.py <base_url> <ruta> [<ruta>...]
"""
import sys
from collections import defaultdict

from playwright.sync_api import sync_playwright

BASE = sys.argv[1]
sys.stdout.reconfigure(encoding='utf-8')
API = 'https://moccasin-sparrow-217730.hostingersite.com/api/'


def shim(route):
    cors = {'access-control-allow-origin': BASE, 'access-control-allow-credentials': 'true'}
    if route.request.method == 'OPTIONS':
        return route.fulfill(status=204, headers={**cors, 'access-control-allow-headers': route.request.headers.get('access-control-request-headers', '*'), 'access-control-allow-methods': 'GET, POST, OPTIONS'})
    try:
        r = route.fetch()
    except Exception:
        return
    route.fulfill(response=r, headers={**r.headers, **cors})


with sync_playwright() as p:
    b = p.chromium.launch()
    for path in sys.argv[2:]:
        c = b.new_context(viewport={'width': 412, 'height': 823}, device_scale_factor=2, is_mobile=True)
        c.route(f'{API}**', shim)
        page = c.new_page()
        sizes = {}

        def on_response(resp):
            if resp.request.resource_type == 'image':
                try:
                    sizes[resp.url] = len(resp.body())
                except Exception:
                    pass

        page.on('response', on_response)
        page.goto(BASE + path, wait_until='networkidle')
        page.mouse.wheel(0, 20000)
        page.wait_for_timeout(2500)
        # Tamaño mostrado vs tamaño natural de cada <img>
        rendered = page.evaluate("""() => [...document.images].filter(i => i.complete && i.naturalWidth)
            .map(i => ({src: i.currentSrc, shown: Math.round(i.getBoundingClientRect().width), natural: i.naturalWidth}))""")
        by_host = defaultdict(lambda: [0, 0])
        for url, n in sizes.items():
            host = url.split('/')[2] + ('/_next/image' if '/_next/image' in url else '')
            by_host[host][0] += 1
            by_host[host][1] += n
        total = sum(sizes.values())
        print(f'\n{path}: {len(sizes)} imágenes, {total / 1024:.0f} KB')
        for host, (count, n) in sorted(by_host.items(), key=lambda kv: -kv[1][1]):
            print(f'  {n / 1024:7.0f} KB  {count:4d}  {host}')
        oversized = sorted(
            ({**r, 'kb': sizes.get(r['src'], 0) / 1024} for r in rendered if r['shown'] and r['natural'] > r['shown'] * 2 * 1.5),
            key=lambda r: -r['kb'])
        waste = sum(r['kb'] for r in oversized)
        print(f'  sobredimensionadas (>1.5x lo necesario en pantalla 2x): {len(oversized)}, {waste:.0f} KB')
        for r in oversized[:5]:
            print(f"    {r['kb']:6.0f} KB natural {r['natural']}px mostrada {r['shown']}px  {r['src'][-70:]}")
        c.close()
    b.close()
