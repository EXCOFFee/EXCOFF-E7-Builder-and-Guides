---
description: Development Workflow
---

Guía de Comandos de Desarrollo (Políglota)

Este archivo centraliza los comandos frecuentes adaptados al stack tecnológico activo del proyecto.

Nota de Compatibilidad: Se utiliza el carácter ; en lugar de && para encadenar comandos, asegurando compatibilidad con PowerShell y Bash.

1. INICIO RÁPIDO (Daily Workflow)

Busca la sección correspondiente a tu Backend actual para levantar el servidor.

🐘 PHP (Laravel)

# Backend
cd api ; php artisan serve

# Frontend (Si es inercia/blade o separado)
cd web ; pnpm dev


🐍 Python (Django / FastAPI)

# Django
source .venv/bin/activate ; python manage.py runserver

# FastAPI (uvicorn)
source .venv/bin/activate ; fastapi dev main.py


🐢 Node.js (NestJS / Express)

# Backend
cd api ; pnpm run start:dev

# Frontend
cd web ; pnpm dev


🐹 Go (Golang)

# Backend
go run main.go


2. BACKEND (Comandos Comunes por Stack)

Tabla de equivalencias con flags no interactivas para mayor velocidad.

Acción

🐘 Laravel (PHP)

🐍 Django (Python)

🐢 NestJS (Node)

🐹 Go

Migrar DB

php artisan migrate --force

python manage.py migrate --noinput

npx prisma migrate dev --name "auto"

go run migrate.go

Crear Migración

make:migration

makemigrations --noinput

prisma migrate dev --create-only

migrate create

Shell/Consola

php artisan tinker

python manage.py shell

node (REPL)

N/A

Crear Recurso

make:model -mfc

startapp <name>

nest g resource <name> --no-spec

Manual

Tests

php artisan test

pytest

pnpm test

go test ./...

Reset DB

migrate:fresh --seed --force

flush --noinput

prisma migrate reset --force

go run reset.go

Limpiar Caché

optimize:clear

N/A

rm -rf dist

go clean

3. FRONTEND (Web / JS Ecosystem)

Regla del Proyecto: Usar pnpm exclusivamente para el ecosistema JS.

Acción

Comando (Universal JS)

Descripción

Instalar

pnpm install

Usa siempre pnpm-lock.yaml.

Dev Server

pnpm dev

Inicia Vite, Next.js o Angular CLI.

Build

pnpm build

Compila para producción.

Lint

pnpm lint --fix

Revisa y corrige automáticamente.

Tests

pnpm test

Vitest, Jest o Karma.

4. GIT & CONTROL DE VERSIONES (Estándar Global)

Cumpliendo con la Regla 10 (Higiene), usamos Conventional Commits en cualquier lenguaje:

# 1. Verificar
git status

# 2. Stage
git add .

# 3. Commit (Ejemplos Universales)
git commit -m "feat: agregar endpoint de login (auth)"
git commit -m "fix: corregir desbordamiento en navbar"
git commit -m "chore(deps): actualizar dependencias de seguridad"
git commit -m "refactor: optimizar query de usuarios (N+1)"

# 4. Push
git push origin main


5. UTILIDADES Y LIMPIEZA (Emergency Reset)

Comandos para "reiniciar de fábrica" el entorno de forma agresiva y sin confirmación.

🧹 Limpieza Profunda

Node.js / JS Frontend:

# Elimina carpetas y lockfile sin preguntar (-rf / -Force)
rm -rf node_modules pnpm-lock.yaml ; pnpm install


PHP / Laravel:

# Elimina vendors y lockfile forzadamente
rm -rf vendor composer.lock ; composer install --no-interaction


Python:

# Limpiar caché y venv (Linux/Mac)
find . -type d -name "__pycache__" -exec rm -rf {} + ; rm -rf .venv


Go:

go clean -modcache


📡 Probar API (PowerShell / Curl)

# PowerShell: Petición GET genérica
Invoke-RestMethod -Uri "http://localhost:PUERTO/api/health" | ConvertTo-Json


# Bash: Petición GET genérica
curl -s http://localhost:PUERTO/api/health | jq .
