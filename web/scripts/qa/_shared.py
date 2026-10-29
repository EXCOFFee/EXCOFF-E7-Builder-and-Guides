"""Utilidades comunes de los chequeos de calidad con Playwright.

Los scripts corren contra `next start` local apuntando a la API de producción
(build con NEXT_PUBLIC_API_URL=https://moccasin-sparrow-217730.hostingersite.com/api).
La API no autoriza CORS desde localhost, así que se agrega la cabecera en la prueba.

Instalación: python -m venv .venv && .venv/Scripts/pip install playwright pillow
             && .venv/Scripts/python -m playwright install chromium
"""

API = 'https://moccasin-sparrow-217730.hostingersite.com/api/'

MOBILE = dict(viewport={'width': 412, 'height': 823}, device_scale_factor=2, is_mobile=True, has_touch=True)
DESKTOP = dict(viewport={'width': 1350, 'height': 940})


def add_cors_shim(context, origin):
    """Responde las peticiones a la API de prod con CORS para `origin` (axios manda credenciales)."""

    def handle(route):
        cors = {'access-control-allow-origin': origin, 'access-control-allow-credentials': 'true'}
        if route.request.method == 'OPTIONS':
            return route.fulfill(status=204, headers={
                **cors,
                'access-control-allow-headers': route.request.headers.get('access-control-request-headers', '*'),
                'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
            })
        try:
            response = route.fetch()
        except Exception:
            return  # la página navegó y la petición se canceló
        route.fulfill(response=response, headers={**response.headers, **cors})

    context.route(f'{API}**', handle)
