"""Mide CLS y LCP de una página y muestra qué elementos se desplazan.

Uso: python -I web/scripts/qa/cls_check.py <url> [mobile|desktop]
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright  # noqa: E402

from _shared import DESKTOP, MOBILE, add_cors_shim  # noqa: E402

URL = sys.argv[1]
MODE = sys.argv[2] if len(sys.argv) > 2 else 'mobile'
sys.stdout.reconfigure(encoding='utf-8')

OBSERVER = """
window.__shifts = []; window.__lcp = null;
new PerformanceObserver(list => {
  for (const e of list.getEntries()) {
    if (e.hadRecentInput) continue;
    window.__shifts.push({ value: e.value, t: Math.round(e.startTime), sources: (e.sources || []).map(s => {
      const n = s.node; if (!n || !n.tagName) return '#text';
      const cls = (typeof n.className === 'string' && n.className) ? '.' + n.className.trim().split(/\\s+/).slice(0, 3).join('.') : '';
      return n.tagName.toLowerCase() + cls + ' "' + (n.textContent || '').trim().slice(0, 40) + '"';
    }) });
  }
}).observe({ type: 'layout-shift', buffered: true });
new PerformanceObserver(list => {
  const e = list.getEntries().at(-1);
  window.__lcp = { t: Math.round(e.startTime), el: e.element ? e.element.tagName + ' ' + (e.element.getAttribute('alt') || e.element.textContent || '').trim().slice(0, 40) : '?' };
}).observe({ type: 'largest-contentful-paint', buffered: true });
"""

with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(**(MOBILE if MODE == 'mobile' else DESKTOP))
    add_cors_shim(context, '/'.join(URL.split('/')[:3]))
    context.add_init_script(OBSERVER)
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)[:200]))
    page.goto(URL, wait_until='networkidle')
    page.wait_for_timeout(4000)
    shifts = page.evaluate('window.__shifts')
    total = sum(s['value'] for s in shifts)
    print(f"{MODE}: CLS {total:.3f} | LCP {page.evaluate('window.__lcp')} | errores JS: {len(errors)}")
    for s in sorted(shifts, key=lambda s: -s['value'])[:6]:
        print(f"  {s['value']:.3f} @ {s['t']}ms  " + ' | '.join(s['sources'][:3]))
    for e in errors[:3]:
        print('  ERROR', e)
    browser.close()
