#!/usr/bin/env bash
# Deploy del backend Laravel (api/) a Hostinger por SSH.
#
# Compara cada archivo versionado de api/ con el que está en el servidor y sube solo los
# distintos o nuevos, guardando antes un backup de los que va a pisar.
#
# Uso:
#   deploy/deploy-api.sh                    Simulación: muestra qué cambiaría (no toca nada)
#   deploy/deploy-api.sh --apply            Sube, corre composer (si cambió el lock), migra y limpia caché
#   deploy/deploy-api.sh --apply --delete <ruta> [--delete <ruta>...]
#                                           Además borra archivos que solo existen en el servidor
#   deploy/deploy-api.sh --ref <commit>     Deploya otro commit en lugar de HEAD
#   deploy/deploy-api.sh --backups          Lista los backups del servidor
#   deploy/deploy-api.sh --rollback <id>    Restaura un backup (no revierte migraciones)
#
# Configuración en deploy/deploy.env (no versionado), ver deploy/deploy.env.example.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
DIR=deploy
ENV_FILE="${DEPLOY_ENV:-$DIR/deploy.env}"
[ -f "$ENV_FILE" ] || { echo "Falta $ENV_FILE (copiá deploy.env.example)"; exit 1; }
# shellcheck source=/dev/null
source "$ENV_FILE"
: "${DEPLOY_HOST:?}" "${DEPLOY_PORT:?}" "${DEPLOY_KEY:?}" "${DEPLOY_PATH:?}"
DEPLOY_KEY="${DEPLOY_KEY/#\~/$HOME}"
DEPLOY_EXCLUDE="${DEPLOY_EXCLUDE:-tests/ phpunit.xml .styleci.yml .editorconfig}"
# Rutas propias del servidor: nunca se comparan ni se ofrecen para borrar
DEPLOY_KEEP="${DEPLOY_KEEP:-.env .htaccess .user.ini error_log vendor/ vendor_broken/ storage/ node_modules/ bootstrap/cache/ public/storage .well-known/}"
SMOKE_URLS="${SMOKE_URLS:-}"
BACKUPS='$HOME/deploy-backups'
ROOT="\$HOME/$DEPLOY_PATH"

# shellcheck disable=SC2086
remote() { ssh -i "$DEPLOY_KEY" -p "$DEPLOY_PORT" -o BatchMode=yes ${DEPLOY_SSH_OPTS:-} "$DEPLOY_HOST" "$@"; }

REF=HEAD APPLY=0 DELETE=() ACTION=deploy
while [ $# -gt 0 ]; do
    case "$1" in
        --apply) APPLY=1 ;;
        --ref) REF="$2"; shift ;;
        --delete) DELETE+=("$2"); shift ;;
        --backups) ACTION=backups ;;
        --rollback) ACTION=rollback; ROLLBACK_ID="$2"; shift ;;
        -h|--help) sed -n '2,18p' "$0"; exit 0 ;;
        *) echo "Opción desconocida: $1"; exit 1 ;;
    esac
    shift
done

if [ "$ACTION" = backups ]; then
    remote "ls -1t $BACKUPS 2>/dev/null | sed -n 's/\.rev\$//p' | while read -r id; do echo \"\$id  \$(cat $BACKUPS/\$id.rev)\"; done"
    exit 0
fi

if [ "$ACTION" = rollback ]; then
    [[ "$ROLLBACK_ID" =~ ^[0-9]{8}-[0-9]{6}$ ]] || { echo "ID de backup inválido: $ROLLBACK_ID"; exit 1; }
    echo "Restaurando backup $ROLLBACK_ID..."
    remote "set -e; cd \"$ROOT\"; B=$BACKUPS/$ROLLBACK_ID
        [ -f \$B.rev ] || { echo 'No existe ese backup'; exit 1; }
        if [ -f \$B.tar.gz ]; then tar -xzmf \$B.tar.gz; fi
        if [ -s \$B.new ]; then xargs -d '\n' rm -f -- < \$B.new; fi
        if [ -f \$B.tar.gz ] && tar -tzf \$B.tar.gz | grep -qx composer.lock; then
            COMPOSER_DISCARD_CHANGES=true composer install --no-dev --optimize-autoloader --no-interaction
        fi
        php artisan optimize:clear"
    echo "Listo. Las migraciones NO se revierten: si hace falta, correr migrate:rollback a mano."
    exit 0
fi

# --- Manifiesto local: "<blob sha>\t<t|b>\t<ruta sin api/>" de cada archivo versionado ---
SHA=$(git rev-parse --verify "$REF^{commit}")
if [ "$REF" = HEAD ] && [ -n "$(git status --porcelain -- api)" ]; then
    echo "Hay cambios sin commitear en api/. Se deploya solo código commiteado."
    exit 1
fi
if ! git merge-base --is-ancestor "$SHA" origin/main 2>/dev/null; then
    echo "Aviso: $(git log -1 --format=%h "$SHA") no está en origin/main y el frontend (Vercel) sale de main."
    echo "        Si este cambio depende del frontend, mergeá y deployá ambos juntos."
fi

TMP=$(mktemp -d)
# En Git Bash, git.exe es nativo de Windows y necesita rutas C:/...
if command -v cygpath >/dev/null; then TMP=$(cygpath -m "$TMP"); fi
trap 'rm -rf "$TMP"' EXIT
EMPTY_TREE=$(git hash-object -t tree /dev/null)
git -c core.quotepath=false diff --numstat "$EMPTY_TREE" "$SHA" -- api \
    | awk -F'\t' '{ print ($1 == "-" ? "b" : "t") "\t" $3 }' > "$TMP/kinds"
git -c core.quotepath=false ls-tree -r "$SHA" -- api \
    | awk -F'\t' -v exclude="$DEPLOY_EXCLUDE" '
        BEGIN { n = split(exclude, ex, " ") }
        NR == FNR { kind[$2] = $1; next }
        {
            split($1, meta, " ")
            if (meta[2] != "blob" || meta[1] == "120000") next
            path = substr($2, 5)
            for (i = 1; i <= n; i++) if (index(path, ex[i]) == 1) next
            print meta[3] "\t" (($2 in kind) ? kind[$2] : "t") "\t" path
        }' "$TMP/kinds" - > "$TMP/manifest"

# --- Comparación en el servidor ---
remote "mkdir -p $BACKUPS && cat > $BACKUPS/remote-scan.php" < "$DIR/remote-scan.php"
IGNORE=$(echo "$DEPLOY_EXCLUDE $DEPLOY_KEEP" | tr ' ' ',')
remote "php $BACKUPS/remote-scan.php \"$ROOT\" '$IGNORE'" < "$TMP/manifest" > "$TMP/scan"

mapfile -t NEW < <(awk -F'\t' '$1 == "N" { print $2 }' "$TMP/scan")
mapfile -t CHANGED < <(awk -F'\t' '$1 == "M" { print $2 }' "$TMP/scan")
mapfile -t EXTRA < <(awk -F'\t' '$1 == "X" { print $2 }' "$TMP/scan")

for path in ${DELETE[@]+"${DELETE[@]}"}; do
    printf '%s\n' ${EXTRA[@]+"${EXTRA[@]}"} | grep -qxF -- "$path" \
        || { echo "--delete $path: no figura entre los archivos que solo están en el servidor"; exit 1; }
done

show() { # título, lista...
    local title=$1; shift
    [ $# -gt 0 ] || return 0
    echo; echo "$title ($#):"; printf '  %s\n' "$@"
}
echo "Deploy de $(git log -1 --format='%h %s' "$SHA")"
show "Nuevos" ${NEW[@]+"${NEW[@]}"}
show "Modificados" ${CHANGED[@]+"${CHANGED[@]}"}
show "Se borran" ${DELETE[@]+"${DELETE[@]}"}
if [ ${#EXTRA[@]} -gt 0 ]; then
    echo; echo "Solo en el servidor (${#EXTRA[@]}), no se tocan salvo con --delete <ruta>:"
    printf '  %s\n' "${EXTRA[@]}"
fi

UPLOAD=(${NEW[@]+"${NEW[@]}"} ${CHANGED[@]+"${CHANGED[@]}"})
NEEDS_COMPOSER=0 NEEDS_MIGRATE=0
for path in ${UPLOAD[@]+"${UPLOAD[@]}"}; do
    case "$path" in
        composer.lock) NEEDS_COMPOSER=1 ;;
        database/migrations/*) NEEDS_MIGRATE=1 ;;
    esac
done
echo
[ $NEEDS_COMPOSER = 1 ] && echo "composer.lock cambió: se corre composer install --no-dev."
[ $NEEDS_MIGRATE = 1 ] && echo "Hay migraciones: se corre migrate --force con la API en mantenimiento."

if [ ${#UPLOAD[@]} -eq 0 ] && [ ${#DELETE[@]} -eq 0 ]; then
    echo "El servidor ya está al día."
    exit 0
fi
if [ $APPLY = 0 ]; then
    echo "Simulación: no se cambió nada. Para aplicar: deploy/deploy-api.sh --apply"
    exit 0
fi

# --- Aplicar ---
ID=$(date +%Y%m%d-%H%M%S)
B="$BACKUPS/$ID"
echo "Backup $ID de los archivos que se pisan o borran..."
TOUCHED=(${CHANGED[@]+"${CHANGED[@]}"} ${DELETE[@]+"${DELETE[@]}"})
if [ ${#TOUCHED[@]} -gt 0 ]; then
    printf '%s\n' "${TOUCHED[@]}" | remote "cd \"$ROOT\" && tar -czf $B.tar.gz -T -"
fi
{ [ ${#NEW[@]} -eq 0 ] || printf '%s\n' "${NEW[@]}"; } | remote "cat > $B.new"
echo "$SHA" | remote "cat > $B.rev"

MAINTENANCE=$(( NEEDS_COMPOSER || NEEDS_MIGRATE ))
on_error() {
    echo "Falló el deploy. Para volver atrás: deploy/deploy-api.sh --rollback $ID"
    [ $MAINTENANCE = 0 ] || remote "cd \"$ROOT\" && php artisan up" || true
}
trap on_error ERR
[ $MAINTENANCE = 0 ] || remote "cd \"$ROOT\" && php artisan down --retry=15"

echo "Subiendo ${#UPLOAD[@]} archivos..."
# Índice temporal en vez de git archive: no saltea los export-ignore de api/.gitattributes
# y escribe el contenido tal cual está en el commit (LF), sin tocar el índice del repo.
mkdir "$TMP/tree"
GIT_INDEX_FILE="$TMP/index" git read-tree "$SHA:api"
printf '%s\n' "${UPLOAD[@]}" > "$TMP/upload"
GIT_INDEX_FILE="$TMP/index" git -c core.autocrlf=false --git-dir="$(git rev-parse --absolute-git-dir)" \
    --work-tree="$TMP/tree" checkout-index --stdin < "$TMP/upload"
tar -cf - -C "$TMP/tree" -T "$TMP/upload" | remote "tar -xmf - -C \"$ROOT\""
if [ ${#DELETE[@]} -gt 0 ]; then
    printf '%s\n' "${DELETE[@]}" | remote "cd \"$ROOT\" && xargs -d '\n' rm -f --"
fi

if [ $NEEDS_COMPOSER = 1 ]; then
    remote "cd \"$ROOT\" && COMPOSER_DISCARD_CHANGES=true composer install --no-dev --optimize-autoloader --no-interaction"
fi
remote "cd \"$ROOT\" && php artisan migrate --force && php artisan optimize:clear"
[ $MAINTENANCE = 0 ] || remote "cd \"$ROOT\" && php artisan up"
trap - ERR

FAILED=0
for url in $SMOKE_URLS; do
    code=$(curl -s -o /dev/null -w '%{http_code}' -H 'Accept: application/json' "$url" || echo 000)
    echo "  $code  $url"
    [ "$code" -ge 200 ] && [ "$code" -lt 500 ] || FAILED=1
done
if [ $FAILED = 1 ]; then
    echo "Algún endpoint falla. Para volver atrás: deploy/deploy-api.sh --rollback $ID"
    exit 1
fi
echo "Deploy $ID listo."
