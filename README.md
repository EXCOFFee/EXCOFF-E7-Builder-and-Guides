# EXCOFF E7 HUB

![EXCOFF E7 HUB Banner]

**EXCOFF E7 HUB** es una plataforma web integral diseñada para la comunidad del juego móvil *Epic Seven*. Este proyecto centraliza información crítica, herramientas de optimización y funciones sociales en una interfaz moderna, rápida y responsiva.

**Link:** [https://www.excoffe7.com]
**Diseño:** Minimalista / Dark Mode

---

## Stack Tecnológico

Este es un proyecto **Full Stack** construido con una arquitectura moderna separando frontend y backend para máxima escalabilidad y rendimiento SEO.

### Frontend (Cliente)
*   **Framework:** [Next.js 16 (Canary)](https://nextjs.org/) & [React 19](https://react.dev/)
*   **Lenguaje:** TypeScript
*   **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **Estado & Data Fetching:** [TanStack Query (React Query)](https://tanstack.com/query/latest)
*   **Internacionalización:** Soporte nativo para 6 idiomas (EN, ES, PT, KO, JA, ZH)

### Backend (API)
*   **Framework:** [Laravel 11](https://laravel.com/) (PHP)
*   **Base de Datos:** MySQL
*   **Autenticación:** Laravel Sanctum (SPA Auth)
*   **Background Jobs:** Laravel Schedule & Commands (para scraping y mantenimiento)

---

## Características Principales

### 1. Base de Datos de Héroes (364 Héroes)
Información detallada y siempre actualizada de cada unidad.
*   **Stats Máximas:** Visualización de estadísticas al nivel 60/6 despertar.
*   **Skill Multipliers:** Muestra los multiplicadores de daño reales (ATK, HP, DEF, SPD scaling) extraídos de los datos del juego.
*   **Traducción Dinámica de Skills:** Sistema inteligente que sirve nombres, descripciones y efectos de soulburn en el idioma del usuario directamente desde la API.
*   **Balance Patches:** Sistema automatizado para aplicar cambios de balance.
*   **Memory Imprints:** Muestra imprints de devotion con valores exactos.
*   **Integración de Builds:** Muestra las builds más populares de la comunidad.

### 2. Sistema de Etiquetas (Pros y Contras)
Un sistema de clasificación exhaustivo para definir las fortalezas y debilidades de cada build.
*   **Cobertura Masiva:** Más de 160 etiquetas únicas categorizadas (Daño, Supervivencia, Control, PvE, Meta, etc.).
*   **Mecánicas Avanzadas:** Etiquetas específicas para mecánicas complejas como "Ignora Distribución de Daño", "Penetración de Defensa", y "Escalado de Foco".
*   **Multi-idioma:** Todas las etiquetas están completamente traducidas a los 6 idiomas soportados.

### 3. Sistema de Balance Patches
Mantén los datos del juego actualizados con los últimos cambios.
*   **Archivos JSON:** Historial de parches para trazabilidad.
*   **Comandos Artisan:** Herramientas CLI para aplicar actualizaciones masivas.
*   **Override de Datos:** Sistema de prioridad para correcciones manuales sobre los datos base.

### 4. Builds de la Comunidad
Un sistema colaborativo para compartir y encontrar equipamiento.
*   **Filtrado Avanzado:** Búsqueda por héroe, sets primarios/secundarios y autor.
*   **Ordenamiento:** Algoritmos para ordenar por novedad, popularidad o valoración.
*   **Urls Dinámicas:** Filtros sincronizados con la URL para compartir búsquedas.

### 5. Buscador de Gremios
Tablón de anuncios para reclutamiento y búsqueda de gremios.
*   **Etiquetas:** Filtros rápidos por objetivos (Casual, Competitivo, Recompensas máximas).
*   **Filtros Regionales:** Búsqueda por servidor e idioma.

### 6. Centro de Guías y Noticias
*   **Guías:** Artículos de estrategia creados por la comunidad con soporte multimedia.
*   **Noticias:** Agregador automático de notas de parche (STOVE) y videos (YouTube).

---

## Pipeline de Datos

### Fuentes de Datos
| Fuente | Datos | Actualización |
|--------|-------|---------------|
| **Fribbels Optimizer** | Stats base, multiplicadores, imprints | Automática via API |
| **Recuperación JSON** | Traducciones base de skills | Script de importación |
| **Balance Patches** | Correcciones post-parche | Manual via JSON |
| **STOVE Oficial** | Noticias, eventos | Cron diario |

### Comandos de Sincronización
```bash
# Importar datos base y aplicar parches
php artisan import:hero-data

# Importar traducciones de skills desde archivos recuperados
php artisan import:skill-translations --force

# Sincronizar noticias
php artisan sync:news
```

---

## Arquitectura y Decisiones Técnicas

### Server-Side Rendering (SSR) & SEO
Utilizamos **Next.js App Router** para renderizar páginas críticas en el servidor, asegurando indexación correcta por motores de búsqueda.

### Sistema de Internacionalización (i18n)
El proyecto fue diseñado desde cero para ser global.
*   **Frontend:** Interfaz traducida mediante archivos JSON locales.
*   **Datos Dinámicos:** La API entrega contenido (skills, nombres de héroes, etiquetas) traducido dinámicamente basado en el header `Accept-Language`.

### Optimización de Rendimiento
*   **Imágenes:** Uso de `next/image` para lazy loading y formatos modernos.
*   **Prefetching:** Carga anticipada de datos al interactuar con elementos UI.
*   **Caching:** Uso intensivo de caché en backend para consultas costosas.

### Seguridad
*   **Sanctum:** Autenticación SPA segura.
*   **Sanitización:** Limpieza estricta de input de usuario.

---

## Instalación Local

### Prerrequisitos
*   Node.js 18+
*   PHP 8.2+
*   Composer
*   MySQL

### 1. Backend (Laravel)
```bash
cd api
composer install
cp .env.example .env
php artisan key:generate
# Configura tu base de datos en .env
php artisan migrate --seed
php artisan import:hero-data
php artisan serve
```

### 2. Frontend (Next.js)
```bash
cd web
npm install
# Crea .env.local con: NEXT_PUBLIC_API_URL=http://localhost:8000/api
npm run dev
```

Visita `http://localhost:3000`.

---

## Licencia

Este proyecto está bajo la licencia MIT.

---

Hecho por EXCOFF para la comunidad de Epic Seven.

### Créditos
*   **Fribbels Epic 7 Optimizer**
*   **CeciliaBot**
*   **EpicSevenDB**
*   **Smilegate & Super Creative**
