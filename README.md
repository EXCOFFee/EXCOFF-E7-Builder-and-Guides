# EXCOFF E7 HUB 🚀

![EXCOFF E7 HUB Banner]

**EXCOFF E7 HUB** es una plataforma web integral diseñada para la comunidad del juego móvil *Epic Seven*. Este proyecto centraliza información crítica, herramientas de optimización y funciones sociales en una interfaz moderna, rápida y responsiva.

🔗 **Link:** [https://www.excoffe7.com]
🎨 **Diseño:** Minimalista / Dark Mode

---

## 🛠️ Stack Tecnológico

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

## ✨ Características Principales

### 1. 🦸 Base de Datos de Héroes
Información detallada y siempre actualizada de cada unidad.
*   **Stats Máximas:** Visualización de estadísticas al nivel 60/6 despertar.
*   **Skill Multipliers:** Muestra los multiplicadores de daño reales (ATK, HP, DEF scaling) extraídos de los datos del juego.
*   **Integración de Builds:** Muestra las builds más populares de la comunidad directamente en el perfil del héroe.

### 2. 🛠️ Builds de la Comunidad
El corazón del proyecto. Un sistema colaborativo para compartir y encontrar equipamiento.
*   **Filtrado Avanzado:** Permite buscar builds específicas combinando:
    *   Héroe específico
    *   **Set Primario** (ej: Velocidad, Destrucción)
    *   **Set Secundario** (ej: Torrente, Perforación)
    *   Búsqueda por nombre de autor
*   **Ordenamiento Dinámico:** Algoritmos para ordenar por "Más Recientes", "Más Vistas" o "Más Likes".
*   **Sincronización URL:** Todos los filtros se reflejan en la URL para compartir búsquedas exactas fácilmente.

### 3. 🏰 Buscador de Gremios
Tablón de anuncios moderno para reclutamiento, solucionando el caos del chat del juego.
*   **Tags Inteligentes:** Los gremios pueden usar etiquetas como:
    *   `x5 Mystic` (Recompensas máximas)
    *   `24/7 Buffs`
    *   `Competitive RTA`
*   **Filtros Regionales:** Búsqueda rápida por Servidor (Global, Europa, Asia) e Idioma.

### 4. 📚 Centro de Guías
Plataforma de contenido generado por usuarios para estrategias.
*   **Multiformato:** Soporte para artículos de texto con videos de YouTube incrustados y galerías de imágenes.
*   **Categorización:** Filtros para PvE (Nightmare Raid, Abyss), PvP (RTA, Arena) y Guild War.
*   **Ranking:** Sistema de votación para destacar el contenido de calidad.

### 5. 📰 Agregador de Noticias
Mantente al día sin visitar múltiples sitios.
*   **Automatización:** Un **Cron Job** personalizado (`artisan sync:news`) se ejecuta en el backend.
*   **Fuentes:** Scrapea y sincroniza automáticamente:
    *   Notas de parche y eventos desde **STOVE**.
    *   Videos y trailers desde el canal oficial de **YouTube**.

---

## 🏗️ Arquitectura y Decisiones Técnicas

### Server-Side Rendering (SSR) & SEO
Utilizamos **Next.js App Router** para renderizar las páginas críticas (perfiles de héroes, guías) en el servidor. Esto asegura que los motores de búsqueda (Google) puedan indexar el contenido correctamente, algo vital para una base de datos pública.

### Optimización de Rendimiento
*   **Imágenes:** Uso de `next/image` para la carga diferida (lazy loading) y conversión automática a formatos modernos (WebP/AVIF).
*   **Prefetching:** React Query realiza pre-carga de datos cuando el usuario hace hover sobre enlaces clave, haciendo la navegación instantánea.
*   **Caching:** Laravel implementa caché en redis/file para las consultas más pesadas de la base de datos (como tops de builds).

### Seguridad
*   **Sanctum:** Autenticación segura basada en cookies para evitar ataques XSS con tokens en localStorage.
*   **Sanitización:** Todo el input de usuario (guías, descripciones) se limpia en el backend para prevenir inyección de código.

---

## 🚀 Instalación Local

Sigue estos pasos para levantar el proyecto en tu máquina.

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
php artisan serve
```

### 2. Frontend (Next.js)
```bash
cd web
npm install
# Crea un archivo .env.local con: NEXT_PUBLIC_API_URL=http://localhost:8000/api
npm run dev
```

Visita `http://localhost:3000` y ¡listo!

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT - siéntete libre de usarlo como base para tus propios proyectos.

---

Hecho con ❤️ por EXCOFF para la comunidad de Epic Seven.

---

## 🙏 Créditos & Agradecimientos

Este proyecto no sería posible sin el increíble trabajo de la comunidad:

*   **[Fribbels Epic 7 Optimizer](https://github.com/fribbels/Fribbels-Epic-7-Optimizer):** Fuente principal de datos de héroes, imágenes y mecánicas. Una herramienta indispensable.
*   **[EpicSevenDB](https://epicsevendb.com/):** Información estadística adicional y referencia.
*   **Smilegate & Super Creative:** Creadores de Epic Seven y dueños de todo el arte y assets del juego.

Este proyecto es de código abierto y sin fines de lucro.
