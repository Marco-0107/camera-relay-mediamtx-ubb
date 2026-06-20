#!/usr/bin/env bash
# Relay TCP para cámaras con IP link-local (169.254.x.x).
#
# Docker (Mac/Windows/Linux) corre los contenedores en una red virtual
# separada del host. Las IPs link-local (169.254.0.0/16) NUNCA son
# enrutables fuera del segmento físico donde se asignaron (RFC 3927),
# así que el contenedor de MediaMTX no puede llegar directo a la cámara
# aunque el propio Mac sí la vea (ej. con VLC).
#
# Este script levanta un relay TCP en el host (fuera de Docker, con
# acceso directo a la interfaz física) que reenvía un puerto normal
# hacia la IP link-local de la cámara. MediaMTX se conecta luego a
# host.docker.internal:<puerto-local> en vez de la IP de la cámara.
#
# Uso:
#   ./scripts/camera-relay-mac.sh <ip-camara> <puerto-camara> [puerto-local]
#
# Ejemplo:
#   ./scripts/camera-relay-mac.sh 169.254.100.108 554 5540
#
# Luego en el formulario de "Agregar cámara" usa como URL RTSP:
#   rtsp://usuario:password@host.docker.internal:5540/Streaming/Channels/101?tcp
#
# IMPORTANTE: debe ejecutarse en una sesión de Terminal interactiva
# (no como LaunchAgent/daemon) porque macOS bloquea el acceso a la red
# local link-local para procesos sin el permiso "Red Local" otorgado
# interactivamente. Deja esta terminal abierta mientras uses la app.

set -euo pipefail

CAMERA_IP="${1:?Uso: $0 <ip-camara> <puerto-camara> [puerto-local]}"
CAMERA_PORT="${2:?Uso: $0 <ip-camara> <puerto-camara> [puerto-local]}"
LOCAL_PORT="${3:-5540}"

if ! command -v socat >/dev/null 2>&1; then
  echo "socat no está instalado. Instalando con Homebrew..."
  brew install socat
fi

echo "Relay activo: localhost:${LOCAL_PORT} -> ${CAMERA_IP}:${CAMERA_PORT}"
echo "En MediaMTX, usa como host de origen: host.docker.internal:${LOCAL_PORT}"
echo "Dejá esta terminal abierta mientras uses la retransmisión. Ctrl+C para detener."

exec socat "TCP-LISTEN:${LOCAL_PORT},bind=0.0.0.0,fork,reuseaddr" "TCP:${CAMERA_IP}:${CAMERA_PORT}"
