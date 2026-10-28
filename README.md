# EXCOFF E7 HUB

Wiki, builds y guías de la comunidad de **Epic Seven**: ficha de cada héroe (stats, skills con
multiplicadores, imprints, sets y artefactos más usados), builds y guías publicadas por
usuarios, gremios y noticias oficiales. En 6 idiomas (EN, ES, PT, KO, JA, ZH).

**Sitio:** https://excoffe7.com

## Cómo está armado

```
web/   Next.js 16 + React 19 + Tailwind 4   → Vercel (se publica al hacer push a main)
api/   Laravel 12 (PHP 8.2+) + MySQL         → Hostinger (se publica con deploy/deploy-api.sh)
deploy/  script de deploy del backend por SSH
```

- El frontend renderiza en el servidor en el idioma del usuario (cookie `locale`) y pide
  los datos a la API (`NEXT_PUBLIC_API_URL`). Las traducciones de la interfaz, skills,
  artefactos y glosario están en `web/messages/`.
- La API usa Sanctum con tokens Bearer (30 días). El login es OAuth (Google y Discord): la
  API redirige al frontend con un código de un solo uso que se canjea por el token.
- Los datos de héroes y artefactos vienen de **Fribbels Epic 7 Optimizer** (stats,
  multiplicadores, imprints) y de **CeciliaBot** (textos de skills, íconos). Un cron diario
  (`data:sync`, 03:00) los mantiene al día sin pisar las correcciones manuales.

## Desarrollo local

Requisitos: PHP 8.2+, Composer, MySQL 8, Node 22 y pnpm 10.

```bash
# API
cd api
composer install
cp .env.example .env && php artisan key:generate   # configurar DB_* en .env
php artisan migrate                                 # las migraciones cargan héroes y artefactos
php artisan serve                                   # http://localhost:8000

# Web (otra terminal)
cd web
pnpm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
pnpm dev                                            # http://localhost:3000
```

Con `APP_ENV=local`, la API acepta `http://localhost:3000` en CORS (ver `api/config/cors.php`).

## Verificaciones (las mismas que corre el CI)

```bash
cd api && php vendor/bin/phpunit          # tests de la API
cd web && pnpm typecheck && pnpm lint     # lint bloqueante: 0 errores y 0 advertencias
cd web && pnpm build
```

En `web/scripts/qa/` hay chequeos con Playwright contra un `next start` local: CLS/LCP,
peso de imágenes, accesibilidad (axe), formulario de builds, selector de idioma.

## Deploy

- **Frontend:** push a `main` → Vercel publica solo.
- **Backend:** `bash deploy/deploy-api.sh` muestra qué archivos de `api/` cambian respecto del
  servidor; `--apply` los sube con backup, corre `composer install` si cambió el lock, migra
  y limpia la caché; `--rollback <id>` vuelve atrás. Configuración en `deploy/deploy.env`
  (no versionado, ver `deploy/deploy.env.example`).
- Si un cambio toca API y web a la vez (por ejemplo el login), deployar el backend y hacer el
  merge a `main` en el mismo momento.

## Agregar héroes o artefactos nuevos

Con datos reales de Fribbels y CeciliaBot (nunca inventados): una migración de seed en
`api/database/migrations/`, la entrada en `api/database/data/custom_heroes.json` o
`custom_artifacts.json` (así `data:sync` no los pisa), el ícono del artefacto en
`api/app/Models/Artifact.php` y las skills en `web/messages/skills/{idioma}.json`.

## Comandos útiles de la API

| Comando | Qué hace |
|---|---|
| `php artisan data:sync` | Sincroniza héroes y artefactos con Fribbels (lo corre el cron) |
| `php artisan import:hero-data` | Importa stats y multiplicadores de Fribbels |
| `php artisan heroes:import {slug}` | Trae un héroe nuevo desde CeciliaBot |
| `php artisan heroes:sync-skill-descriptions` | Actualiza textos de skills desde CeciliaBot |
| `php artisan skills:import-translations` | Carga en la base las traducciones de `web/messages/skills` |
| `php artisan app:sync-news` | Trae noticias de STOVE y YouTube |
| `php artisan stats:sync` | Trae sets y artefactos más usados por héroe (Fribbels Hero Library) |

## Créditos y licencia

Datos de [Fribbels Epic 7 Optimizer](https://github.com/fribbels/Fribbels-Epic-7-Optimizer),
CeciliaBot y EpicSevenDB; Epic Seven © Smilegate & Super Creative. Detalle en
[CREDITS.md](CREDITS.md). Código bajo licencia MIT ([LICENSE](LICENSE)).
