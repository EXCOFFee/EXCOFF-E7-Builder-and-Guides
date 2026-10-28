<?php

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
|
| Frontend en Vercel (excoffe7.com), API en Hostinger. Los orígenes permitidos se
| configuran en el .env; los valores por defecto son los de producción, así un .env
| sin estas variables sigue funcionando.
|
| CORS_ALLOWED_ORIGINS          orígenes exactos, separados por coma
| CORS_ALLOWED_ORIGIN_PATTERN   una expresión regular (vistas previas de Vercel del equipo)
|
| Las imágenes estáticas (public/images, public/storage) las sirve Apache sin pasar por
| Laravel; su CORS está en public/.htaccess.
|
*/

$csv = static fn (?string $value): array => array_values(array_filter(array_map('trim', explode(',', (string) $value))));

$origins = $csv(env('CORS_ALLOWED_ORIGINS', implode(',', [
    'https://excoffe7.com',
    'https://www.excoffe7.com',
    'https://excoff-e7-orbis-helper.vercel.app',
])));

if (env('APP_ENV') === 'local') {
    $origins[] = 'http://localhost:3000'; // next dev
}

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => $origins,

    // Vistas previas: <proyecto>-<hash|rama>-excoffees-projects.vercel.app. El sufijo es el
    // slug del equipo en Vercel, que nadie más puede usar (el patrón viejo aceptaba cualquier
    // proyecto de cualquier cuenta con "excoff" en el nombre).
    'allowed_origins_patterns' => array_filter([
        env('CORS_ALLOWED_ORIGIN_PATTERN', '#^https://[a-z0-9-]+-excoffees-projects\.vercel\.app$#'),
    ]),

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => true,

];
