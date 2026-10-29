# EXCOFF E7 HUB — Web

Frontend Next.js 16 (App Router) + React 19 + Tailwind 4, publicado en Vercel. Ver el
[README principal](../README.md) para la arquitectura completa.

## Puesta en marcha

```bash
pnpm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
pnpm dev
```

Usar pnpm 10 (el del CI y Vercel): otras versiones regeneran el lockfile distinto.

| Script | |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm start` | Desarrollo, build de producción, servirlo |
| `pnpm typecheck` | TypeScript |
| `pnpm lint` | ESLint con `--max-warnings 0` (bloquea el CI) |

## Convenciones

- **Idiomas:** la interfaz está en `messages/{en,es,pt,ko,ja,zh}.json`, más `skills/`, `artifacts/`
  y `glossary/`. El servidor lee la cookie `locale` (`src/i18n/server.ts`). En los
  componentes cliente se usa `useTranslations()`. Toda clave nueva va en los 6 idiomas.
- **Números y fechas:** `formatNumber` / `formatDate` de `@/lib/utils`. Un `toLocaleString()`
  sin idioma escribe distinto en el servidor y en el navegador, y rompe la hidratación.
- **Imágenes:** `next/image` optimiza solo las pesadas (retratos, artefactos, imágenes subidas).
  Los íconos chicos usan `unoptimized`, porque la cuota de optimización de Vercel Hobby la
  comparte todo el equipo. Ver los comentarios en `next.config.ts`.
- **Accesibilidad:** el texto secundario usa gray/slate-400 (no 500/600 sobre fondo oscuro), y
  cada página tiene un solo `h1`. `scripts/qa/axe_check.py` tiene que dar 0 violaciones.
- **Sesión:** `useRequireAuth()` en páginas que la necesitan, `useNavigateFresh()` para navegar
  después de crear o editar algo.

## Chequeos con Playwright

`scripts/qa/` (instrucciones en `_shared.py`). Corren contra `next start` local con la API de
producción: `cls_check.py`, `img_weight.py`, `axe_check.py`, `build_form_check.py`,
`language_selector_check.py`, `behavior_check.py`.
