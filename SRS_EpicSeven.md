SRS Maestro: Epic Seven Knowledge Hub (E7-Hub) - Especificación Técnica "Hostinger & Vercel Edition" (v7.0 Final)

1. Introducción

¿Qué es? E7-Hub es una plataforma web "Headless" diseñada para ser el ecosistema digital definitivo para jugadores de Epic Seven. Su núcleo es un sistema híbrido que combina una Base de Datos Técnica (Wiki), alimentada automáticamente por datos del juego, con una Plataforma Social de Estrategia, donde la comunidad crea guías detalladas ("Builds") estandarizadas.

¿Por qué? La información de E7 está fragmentada. Los jugadores dependen de videos largos o imágenes sueltas. Necesitan una herramienta que estandarice qué equipar, por qué, y con qué estadísticas objetivo, validando matemáticamente si una build es viable.

¿Cómo? Mediante una arquitectura distribuida eficiente:

Frontend (Vercel): Interfaz reactiva ultrarrápida (Next.js) para la mejor experiencia de usuario.

Backend (Hostinger): API REST robusta (Laravel) que aprovecha tu hosting existente para lógica y base de datos.

2. Stacks Tecnológicos

Criterio de Selección: Compatibilidad total con Hosting Compartido (Backend), Velocidad Global (Frontend) y Bajo Costo.

Frontend (La Cara): Next.js 14+ (App Router).

Hosting: Vercel (Plan Hobby/Free).

Lenguaje: TypeScript 5+.

UI Library: Tailwind CSS + Shadcn/UI + Lucide Icons.

State: Zustand (Global) + TanStack Query (Server State/Caching).

Rich Text: Tiptap (Editor de guías).

HTTP Client: Axios (Instancia configurada con Interceptores).

Backend API (El Cerebro): Laravel 11 (PHP 8.2+).

Hosting: Hostinger WordPress Starter (Shared Hosting).

Server: Apache / LiteSpeed (Nativo de Hostinger).

Auth: Laravel Sanctum (Token-based Auth para SPA).

Validación: Form Requests + Validation Rules.

API Docs: Scribe o Swagger PHP.

Base de Datos: MySQL 8.0 / MariaDB.

Hosting: Hostinger.

ORM: Eloquent (Nativo, potente y expresivo).

3. Definition of Done (DoD)

Para que cualquier tarea de desarrollo se considere finalizada:

Funcionalidad: La feature cumple todos los Criterios de Aceptación y funciona en el entorno de Staging (Vercel Preview + Hostinger Dev DB).

Código Limpio: PHP cumple con PSR-12. TypeScript sin errores de any implícitos.

Documentación:

PHP: PHPDoc completo en Controladores y Modelos.

TS: JSDoc en hooks y utilidades.

Validación:

Backend: Tests unitarios (Pest/PHPUnit) para lógica crítica.

Frontend: Validación de formularios con Zod antes de enviar.

Seguridad: Endpoint protegido con Sanctum (si requiere auth) y CORS configurado estrictamente para el dominio de Vercel.

4. Historias de Usuario

4.1 Gestión de Guías (Creador)

Como Usuario Registrado: Quiero crear una guía seleccionando un héroe de la lista (typeahead) para no tener que subir la imagen del personaje manualmente.

Como Usuario: Quiero seleccionar visualmente los Sets de Equipamiento (ej: 4 iconos de Velocidad + 2 de Crítico) para que la build sea legible de un vistazo.

Como Usuario: Quiero ingresar las Estadísticas Objetivo (Atk, Def, Hp, Spd, Crit, Cdmg, Eff, Res) y que el sistema me impida poner números negativos.

Como Usuario: Quiero seleccionar un Artefacto Recomendado desde la base de datos y explicar brevemente por qué es la mejor opción.

Como Usuario: Quiero añadir una sección de Sinergias seleccionando hasta 3 héroes aliados que potencien a mi personaje.

Como Usuario: Quiero añadir una sección de Counters seleccionando héroes enemigos que debo evitar.

Como Usuario: Quiero redactar la sección "Gameplay" con formato rico (Negritas, Listas, Enlaces) para explicar rotaciones de habilidades.

Como Usuario: Quiero subir una captura de pantalla de mis estadísticas reales ("Image Proof") para dar credibilidad a mi guía.

Como Usuario: Quiero editar mi guía publicada para actualizar las estadísticas si consigo mejor equipo.

Como Usuario: Quiero eliminar mi guía si ya no es relevante en el meta actual.

4.2 Consumo y Comunidad (Lector)

Como Visitante: Quiero ver la lista de guías de un héroe, ordenadas por "Más Votadas" por defecto.

Como Visitante: Quiero filtrar las guías por tipo de contenido (PvP, PvE, Gremio, One-Shot).

Como Visitante: Quiero ver un gráfico de radar que compare las stats de la guía contra las stats base del héroe.

Como Usuario: Quiero votar positivo o negativo en una guía para influir en su visibilidad.

Como Usuario: Quiero comentar en una guía para preguntar dudas al autor.

Como Usuario: Quiero ver el perfil del autor para ver qué otras guías ha escrito.

4.3 Wiki y Sistema

Como Usuario: Quiero ver las habilidades del héroe con sus multiplicadores de daño reales (Data Mining).

Como Usuario: Quiero registrarme e iniciar sesión de forma segura para poder crear contenido.

Como Admin: Quiero sincronizar manualmente la base de datos de héroes si sale un parche nuevo.

5. Casos de Uso

CU-01: Crear Guía de Personaje

Actor: Usuario Registrado.

Flujo Principal:

Usuario accede a /guides/create.

Frontend solicita lista de héroes a la API (GET /api/heroes/list).

Usuario completa el formulario (Sets, Stats, Artefacto, Texto).

Usuario sube imagen (opcional).

Frontend envía FormData a POST /api/guides.

Backend (Laravel):

Verifica Token Sanctum.

Valida reglas (ej: speed debe ser integer < 450).

Guarda imagen en storage/app/public/guides.

Crea registro en MySQL con relaciones JSON.

Retorna 201 Created con el Slug de la guía.

Frontend redirige a la nueva guía.

CU-02: Sincronización de Datos (ETL)

Actor: Cron Job de Hostinger / Admin.

Flujo Principal:

Se ejecuta comando Artisan: php artisan data:sync.

Laravel descarga hero.json del repositorio Fribbels.

Itera sobre cada entrada.

Si el héroe no existe en DB -> INSERT.

Si existe y el hash de datos cambió -> UPDATE.

Descarga assets de imágenes nuevos a la carpeta pública.

6. Diagrama de Casos de Uso (Mermaid)

usecaseDiagram
    actor "Visitante" as Guest
    actor "Usuario" as User
    actor "Sistema Sync" as Cron

    package "Frontend (Vercel)" {
        usecase "Ver Héroe (Wiki)" as UC1
        usecase "Buscar Guías" as UC2
        usecase "Filtrar por Contenido" as UC3
    }

    package "Backend (Hostinger)" {
        usecase "Crear Guía" as UC4
        usecase "Subir Imagen Proof" as UC5
        usecase "Votar/Comentar" as UC6
        usecase "Sync Fribbels Data" as UC7
    }

    Guest --> UC1
    Guest --> UC2
    Guest --> UC3

    User --> UC1
    User --> UC2
    User --> UC4
    User --> UC6
    
    UC4 ..> UC5 : include

    Cron --> UC7


7. General Overview

La solución implementa una arquitectura Headless CMS.

El "Cuerpo" (Hostinger): Laravel actúa como un CMS sin cabeza. No renderiza HTML (no usa Blade views para el usuario final). Su única responsabilidad es gestionar datos, lógica de negocio, autenticación y servir respuestas JSON.

La "Cabeza" (Vercel): Next.js consume ese JSON y renderiza la interfaz. Esto permite que la web se sienta como una aplicación nativa (SPA), con transiciones instantáneas, mientras el backend reside en un hosting económico y estable.

8. Objetivos Principales

Estandarización: Proveer un formato único de guía que sea fácil de leer y comparar.

Viabilidad Económica: Utilizar la infraestructura existente (Hostinger) sin costos adicionales de servidores VPS.

Seguridad: Proteger la base de datos y la lógica mediante un framework backend maduro (Laravel).

Experiencia de Usuario: Minimizar los tiempos de carga usando generación estática y caché en el Frontend.

9. Actores Externos

Fribbels GitHub: Proveedor de datos crudos (Stats/Skills).

Vercel Edge Network: Distribución de contenido Frontend.

Hostinger File System: Almacenamiento de imágenes de usuario.

10. Componentes Principales del Sistema

GuideController (PHP): Endpoints para CRUD de guías.

HeroController (PHP): Endpoints de solo lectura para datos de wiki.

AuthController (PHP): Login, Registro, Logout (Sanctum).

SyncService (PHP): Lógica de actualización de datos externos.

GuideBuilder (React): Componente complejo de formulario con validación visual.

StatRadar (React): Componente de visualización de gráficas con Recharts.

11. Flujo de Datos del Sistema

Lectura: Navegador -> Next.js -> Axios -> API Laravel -> Eloquent -> MySQL.

Escritura: Formulario -> Validación Zod -> API Laravel -> FormRequest Validation -> MySQL Transaction.

Imágenes: Upload -> Laravel Storage -> public_html/storage -> URL Pública.

12. Requisitos del Usuario (Detallado)

"Quiero saber exactamente qué estadísticas (y cuánto de cada una) necesita un personaje buscado (ej: 250 Spd, 15k HP) para que funcione bien."

"Quiero saber qué artefacto específico debo usar y por qué (y si hay alternativas)."

"Quiero saber quiénes son sus counters directos para no elegirlo en una mala partida."

"Quiero saber con quién hace buena pareja (sinergias) para armar mi equipo."

"Quiero que la página cargue rápido en móvil."

"Quiero ver claramente qué sets debo farmear."

"Quiero poder buscar guías específicas para matar al Wyvern 13."

13. Requisitos Funcionales (Expandido)

Gestión de Datos

RF-01 API REST: El backend debe exponer endpoints bajo el prefijo /api/v1.

RF-02 Auth: El sistema debe usar Tokens Bearer para identificar usuarios.

RF-03 Validación Numérica: El backend debe rechazar estadísticas imposibles (ej: Crit Chance > 350%, Spd < 0).

RF-04 Rich Text: El sistema debe permitir guardar descripciones con formato HTML limitado (sanitizado).

RF-05 Relaciones: El sistema debe vincular guías a héroes existentes en la DB, no permitir guías "huérfanas".

Detalle de Guías (Stats & Items)

RF-06 Stats Objetivo: El sistema debe permitir ingresar y mostrar 8 estadísticas base: Attack, Defense, Health, Speed, Crit Chance, Crit Damage, Effectiveness, Effect Resistance.

RF-07 Sets Visuales: El sistema debe permitir seleccionar hasta 3 sets de equipamiento (ej: Speed/Crit) validando combinaciones lógicas (ej: no permitir 7 piezas).

RF-08 Artefactos: El sistema debe permitir seleccionar 1 artefacto principal y hasta 2 alternativos, con notas opcionales.

RF-09 Sinergias/Counters: El sistema debe permitir seleccionar múltiples héroes (N:M) etiquetados como "Good With" (Sinergia) o "Bad Against" (Counter).

RF-10 Prioridad de Stats: El sistema debe permitir marcar qué stats son prioritarias (High, Mid, Low) para resaltarlas visualmente.

Interacción

RF-11 Votos: El sistema debe prevenir votos duplicados del mismo usuario en la misma guía.

RF-12 Comentarios: El sistema debe permitir comentarios anidados (un nivel de profundidad) en las guías.

RF-13 Búsqueda: El sistema debe permitir buscar guías filtrando por las stats objetivo (ej: "Mostrar guías con > 280 Speed").

14. Requisitos No Funcionales (Expandido)

Infraestructura y Rendimiento

RNF-01 Stack: PHP 8.2+ y MySQL 8.0.

RNF-02 CORS: La API solo debe responder a peticiones con origen https://tudominio.vercel.app.

RNF-03 Storage: Las imágenes deben optimizarse/redimensionarse en el backend (usando Intervention Image) a máximo 1920px.

RNF-04 Rate Limit: Máximo 60 peticiones por minuto por IP para endpoints públicos.

RNF-05 Cold Start: El frontend en Vercel debe manejar gracefully posibles lentitudes iniciales del hosting compartido.

RNF-06 Optimización MySQL: Las consultas de listas de guías deben usar índices en hero_id y votes para no saturar el CPU compartido de Hostinger.

Usabilidad y Diseño

RNF-07 Responsive: El diseño debe ser Mobile First, dado que los jugadores consultan desde el celular mientras juegan.

RNF-08 Feedback: Los errores de validación (ej: "Stats imposibles") deben mostrarse claramente junto al campo erróneo.

RNF-09 Accesibilidad: Los colores de las stats (ej: Verde para HP, Rojo para Atk) deben tener suficiente contraste.

Mantenibilidad

RNF-10 Código: El código PHP debe seguir el estándar PSR-12.

RNF-11 Deploy: El proceso de despliegue en Hostinger debe documentarse paso a paso (Symlinks, .htaccess) ya que no es estándar.
15. Arquitectura de la Solución

Contexto C4

(Ver diagrama sección 6 - Separación clara Front/Back)

Estructura de Carpetas Backend (Laravel)

La estructura estándar de Laravel, con énfasis en:

app/Http/Requests: Para validaciones separadas.

app/Http/Resources: Para formateo de JSON (API Resources).

app/Services: Lógica de negocio pura.

Estructura de Carpetas Frontend (Next.js)

app/(routes)/heroes/[slug]: Página de detalle.

components/guide/builder: Componentes del editor.

lib/api: Configuración de Axios.

16. Diagrama de Actividades (Publicar Guía)

stateDiagram-v2
    [*] --> LlenarFormulario
    LlenarFormulario --> ValidarFront : Zod
    ValidarFront --> EnviarAPI : POST
    EnviarAPI --> Autenticar : Middleware Sanctum
    Autenticar --> ValidarBack : FormRequest
    
    state ValidarBack {
        [*] --> CheckTipos
        CheckTipos --> CheckRangos
        CheckRangos --> CheckLogica
    }
    
    ValidarBack --> GuardarDB : Éxito
    GuardarDB --> RetornarJSON
    ValidarBack --> Error422 : Fallo
    Error422 --> MostrarErrorUI


17. Diagrama de Clases (Modelos Eloquent)

classDiagram
    class User {
        +id
        +name
        +email
        +guides()
        +votes()
    }
    class Hero {
        +id
        +name
        +slug
        +base_stats (JSON)
        +guides()
    }
    class Guide {
        +id
        +title
        +sets (JSON)
        +target_stats (JSON)
        +content
        +user()
        +hero()
        +comments()
    }
    
    User "1" --> "*" Guide : HasMany
    Hero "1" --> "*" Guide : HasMany


18. Documentación de Interfaz (Contrato API)

POST /api/v1/guides

Headers: Authorization: Bearer {token}, Accept: application/json
Body:

{
  "hero_id": 105,
  "title": "Ras Tanque PvE",
  "sets": ["speed", "health"],
  "artifact_id": 44,
  "stats": {
    "atk": 1200, "hp": 25000, "spd": 210, "def": 1600,
    "crit_chance": 15, "crit_dmg": 150, "eff": 65, "res": 100
  },
  "synergies": [12, 45],
  "counters": [99],
  "content_type": "pve",
  "gameplay_text": "<p>Estrategia aquí...</p>"
}


19. DER (Schema MySQL)

users: id, name, email, password, remember_token.

heroes: id, code (unique), name, slug, element, class, base_stats (json), image_url.

artifacts: id, code, name, description.

guides: id, user_id (FK), hero_id (FK), artifact_id (FK), title, slug, type (enum), sets (json), stats (json), content (text), is_published (bool).

guide_relations: guide_id, related_hero_id, type (synergy/counter).

votes: user_id, guide_id, value.

20. Principios SOLID (En Laravel)

S (SRP): Usar GuideRequest para validar datos, no hacerlo en el Controller. El Controller solo delega.

O (OCP): Usar "API Resources" para transformar datos. Si cambia el formato de respuesta, editamos el Resource, no el Modelo ni el Controller.

L (LSP): Usar Interfaces para servicios externos (ej: ImageStorageInterface), permitiendo cambiar entre almacenamiento local (Hostinger) o S3 en el futuro sin romper código.

I (ISP): No inflar el modelo User con métodos de lógica de negocio compleja.

D (DIP): Inyección de dependencias en el constructor de los controladores.

21. Principios KISS y DRY

KISS: Usar columnas JSON en MySQL para guardar los sets y stats. Crear una tabla stats relacionada sería sobre-ingeniería innecesaria para este caso de uso.

DRY: Usar "Traits" de Laravel para funcionalidades repetidas, como HasSlug o Rateable (para el sistema de votos).

22. Patrones de Diseño

MVC: Arquitectura base de Laravel.

Facade: Uso de Storage::, Auth::, DB::.

Observer: Para acciones automáticas (ej: Al crear una guía, disparar notificación o calcular reputación).

Factory: Para generar datos de prueba (Seeders).

23. Protocolo de Comentarios y Validación

Instrucción para la IA Desarrolladora:

PHPDoc: Estricto en backend. Definir tipos de retorno public function index(): JsonResource.

Strict Typing: Usar declare(strict_types=1); en archivos PHP críticos.

Validación Defensiva:

Nunca confiar en $request->all(). Usar $request->validated().

En Frontend, usar zod.safeParse() antes de intentar cualquier envío.

24. Estrategia de Despliegue (La Guía Técnica Hostinger + Vercel)

Esta sección es crítica para que funcione la arquitectura híbrida.

Fase 1: Backend en Hostinger (El "Cerebro")

Estructura de Carpetas: Crear una carpeta laravel_core al mismo nivel que public_html (no dentro). Allí subes todo el código de Laravel.

Symlink Público: Copiar el contenido de laravel_core/public a public_html/api (crear subdominio api.tudominio.com).

Ajuste de Paths: Editar public_html/api/index.php para apuntar a ../../laravel_core/vendor/autoload.php.

Base de Datos: Configurar el .env en laravel_core con las credenciales de MySQL de Hostinger.

Storage: Crear un script PHP temporal para ejecutar el symlink de storage (symlink()) ya que no tienes SSH root.

Fase 2: Frontend en Vercel (La "Cara")

Repositorio en GitHub conectado a Vercel.

Variable de Entorno en Vercel: NEXT_PUBLIC_API_URL=https://api.tudominio.com/api/v1.

DNS Magic:

En Hostinger DNS: Apuntar api (Registro A) a la IP de Hostinger.

En Hostinger DNS: Apuntar @ y www (CNAME/A) a los servidores de Vercel (https://www.google.com/search?q=cname.vercel-dns.com).

Fase 3: CORS (El Puente)

En laravel_core/config/cors.php, es vital configurar:

'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => ['[https://tudominio.com](https://tudominio.com)', '[https://tudominio.vercel.app](https://tudominio.vercel.app)'],
'supports_credentials' => true,

25. Design System
Tema: E7 Dark Fantasy.

Colores Tailwind:

bg-void: #111521

bg-panel: #1B2030

border-gold: #C8AA6E

text-gold: #FFD700

Fuentes: Inter (UI General), Cinzel (Títulos de Héroes).