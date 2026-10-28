# EXCOFF E7 HUB — API

API Laravel 12 del sitio (ver el [README principal](../README.md) para la arquitectura completa).

## Puesta en marcha

```bash
composer install
cp .env.example .env && php artisan key:generate   # DB_*, APP_URL, APP_FRONTEND_URL, OAuth
php artisan migrate
php artisan serve
```

Variables relevantes del `.env` (todas documentadas en `.env.example`):

- `APP_FRONTEND_URL`: a dónde vuelve el login OAuth.
- `GOOGLE_*`, `DISCORD_*`: credenciales OAuth.
- `CORS_ALLOWED_ORIGINS`, `CORS_ALLOWED_ORIGIN_PATTERN`: orígenes del frontend. Si faltan, se
  usan los de producción.
- `SANCTUM_EXPIRATION`: vida del token en minutos (43200 = 30 días).

## Tests

```bash
php vendor/bin/phpunit
```

Las migraciones con datos (héroes, artefactos, correcciones) se prueban también en MySQL 8
estricto antes de subirlas: SQLite deja pasar cosas que producción rechaza.

## Dónde está cada cosa

| Ruta | Contenido |
|---|---|
| `routes/api.php` | Endpoints públicos y autenticados (`auth:sanctum`) |
| `app/Http/Controllers/` | Builds, guías, comentarios, votos, auth; `Api/` héroes, artefactos, gremios, admin |
| `app/Services/ImageService.php` | Validación de imágenes subidas y URLs propias |
| `app/Console/Commands/SyncFribbelsData.php` | `data:sync` diario (no pisa datos curados) |
| `database/migrations/` | Esquema y migraciones de datos (héroes nuevos, correcciones) |
| `database/data/` | JSON que usan esas migraciones y `custom_heroes.json` / `custom_artifacts.json` |
| `config/cors.php` | Orígenes permitidos |
| `public/.htaccess` | Reescritura a `index.php`, CORS de imágenes estáticas |

## Deploy

Desde la raíz del repo: `bash deploy/deploy-api.sh` (simulación) y `--apply`. Ver el
[README principal](../README.md#deploy).
