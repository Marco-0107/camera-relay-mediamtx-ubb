#!/usr/bin/env bash
# Arranca/reinicia los 3 procesos (mediamtx, backend, frontend) bajo PM2,
# para entornos donde no hay acceso para correr Docker (ej. contenedor de la
# universidad). Se ejecuta a mano en el servidor, desde la raíz del repo.
#
# Requiere: node, npm y pm2 ya instalados, y haber descargado el binario de
# MediaMTX en mediamtx/bin/mediamtx (no se versiona en git, ver README).
#
# Antes de la primera corrida, copia y completa los .env:
#   cp backend/.env.example backend/.env
#   cp frontend/.env.example frontend/.env

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

MEDIAMTX_BIN="$REPO_DIR/mediamtx/bin/mediamtx"
MEDIAMTX_RUNTIME_YML="$REPO_DIR/mediamtx/runtime/mediamtx.yml"

if [ ! -x "$MEDIAMTX_BIN" ]; then
  echo "ERROR: no se encontró el binario de MediaMTX en $MEDIAMTX_BIN" >&2
  echo "Descárgalo desde https://github.com/bluenviron/mediamtx/releases y dale permisos de ejecución." >&2
  exit 1
fi

echo "== MediaMTX =="
mkdir -p "$(dirname "$MEDIAMTX_RUNTIME_YML")"
# MediaMTX reescribe este yml en caliente con los paths agregados por la
# Control API; se usa una copia de trabajo para no tocar el archivo versionado.
cp "$REPO_DIR/mediamtx/mediamtx.yml" "$MEDIAMTX_RUNTIME_YML"
pm2 restart mediamtx || pm2 start "$MEDIAMTX_BIN" --name mediamtx -- "$MEDIAMTX_RUNTIME_YML"

echo "== Backend =="
cd "$REPO_DIR/backend"
npm ci
pm2 restart app-backend || pm2 start src/server.js --name app-backend

echo "== Frontend =="
cd "$REPO_DIR/frontend"
npm ci
npm run build
pm2 restart app-frontend || pm2 start npm --name app-frontend -- run preview -- --host --port 4173

echo "Despliegue PM2 completado en $(date)"
pm2 status
