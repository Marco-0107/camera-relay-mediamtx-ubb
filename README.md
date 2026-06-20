# Retransmisor de cámaras RTSP (MediaMTX)

> Este repositorio es un avance del proyecto de tesis **"Sistema de Control de Acceso Vehicular y Detección de Vehículos Sospechosos en la Universidad del Bío-Bío"**.
>
> **Autores:** Marco Cerda Chamorro y Brian Cabezas Cea.

Republica una cámara RTSP que tiene límite de conexiones simultáneas (ej. cámara de la universidad) hacia `n` espectadores, manteniendo **una sola conexión** hacia la fuente original.

## Componentes

- **mediamtx**: servidor [MediaMTX](https://mediamtx.org) que se conecta a la(s) cámara(s) original(es) y republica vía WebRTC (WHEP).
- **backend** (`backend/`): API en Node/Express, organizada en `routes` → `controllers` → `services`, que registra cámaras (vía la Control API de MediaMTX) y guarda las "áreas de interés" dibujadas sobre el preview.
- **frontend** (`frontend/`): app React + Vite para dar de alta cámaras, ver la retransmisión en vivo y dibujar áreas de interés.

Hay dos formas de desplegar el proyecto, según el entorno:

- **Modo A — Docker**: para correrlo en tu equipo/local. Todo vía `docker-compose.yml`.
- **Modo B — PM2**: para el contenedor de la universidad, donde no hay acceso para crear servicios Docker — los 3 procesos (mediamtx, backend, frontend) corren directo sobre el sistema, gestionados con PM2.

---

## Modo A: Docker (equipo / local)

1. Copia el archivo de entorno y pon la IP/dominio de este servidor (la que usarán los espectadores para conectarse):

   ```bash
   cp .env.example .env
   # editar SERVER_HOST=<tu-ip-o-dominio>
   ```

2. Compila el frontend (genera `frontend/dist`, que el backend sirve como estáticos):

   ```bash
   cd frontend && npm install && npm run build && cd ..
   ```

3. Levanta todo:

   ```bash
   docker compose up -d --build
   ```

4. Abre `http://<SERVER_HOST>:3000` en el navegador.

5. En el formulario, ingresa el nombre y la URL RTSP de la cámara original (con usuario/contraseña si aplica) y haz clic en "Agregar cámara". El backend la registra en MediaMTX y aparece en la lista.

6. Haz clic en "Ver" para abrir el preview — este reproduce la **retransmisión** (vía WebRTC/WHEP desde MediaMTX), no la URL original. Sobre el video puedes hacer click-drag para dibujar rectángulos y etiquetarlos como áreas de interés; quedan guardados y se pueden eliminar desde la lista debajo del preview.

Para apagarlo: `docker compose down`. Si cambias algo del frontend, vuelve a correr `npm run build` antes de `docker compose up -d --build`.

### Desarrollo del frontend sin Docker

```bash
cd backend && npm install && npm start        # backend en :3000
cd frontend && npm install && npm run dev      # vite dev server en :5173
```

El frontend en modo `dev` apunta por defecto al mismo origen (rutas relativas `/api/...`). Si el backend corre en otro puerto/host, define `VITE_API_BASE_URL` en `frontend/.env` (ver `frontend/.env.example`).

---

## Modo B: PM2 (contenedor de la universidad)

En este entorno no hay acceso para correr Docker anidado, así que los 3 procesos corren directo sobre el sistema:

### Prerequisitos (una sola vez)

- Node.js y `pm2` instalados (`npm install -g pm2`).
- Descargar el binario de [MediaMTX](https://github.com/bluenviron/mediamtx/releases) para la plataforma del servidor y dejarlo en `mediamtx/bin/mediamtx` (con permisos de ejecución). Esa carpeta está en `.gitignore`: no se versiona, se descarga una vez en el servidor.
- Configurar los `.env`:

  ```bash
  cp backend/.env.example backend/.env
  # editar MEDIAMTX_API_URL=http://127.0.0.1:9997 (mediamtx corre local, no en docker)
  # editar MEDIAMTX_WEBRTC_PUBLIC_URL=http://<host-uni>:8889
  # editar CORS_ORIGIN=http://<host-uni>:4173 (origen del frontend)

  cp frontend/.env.example frontend/.env
  # editar VITE_API_BASE_URL=http://<host-uni>:3000
  ```

### Arranque / actualización

```bash
./scripts/deploy-pm2.sh
```

Ese script: copia el yml de MediaMTX a una ruta de trabajo (porque MediaMTX lo reescribe en caliente con los paths agregados — no se quiere ensuciar el archivo versionado con credenciales de cámaras), instala dependencias, hace el build del frontend, y arranca/reinicia los 3 procesos con PM2:

```bash
pm2 start ./mediamtx/bin/mediamtx --name mediamtx -- mediamtx/runtime/mediamtx.yml
pm2 start src/server.js --name app-backend        # desde backend/
pm2 start npm --name app-frontend -- run preview -- --host --port 4173   # desde frontend/
```

Vuelve a correr `./scripts/deploy-pm2.sh` cada vez que actualices código (hace `pm2 restart` si los procesos ya existen). Verifica el estado con `pm2 status` / `pm2 logs`.

---

## Cómo consumen el stream los demás usuarios

Cada usuario puede ver la retransmisión de dos formas, sin tocar la cámara original:

- Desde el frontend, seleccionando la cámara.
- Directamente con cualquier cliente WHEP/WebRTC apuntando a `http://<host>:8889/<pathName>/whep`, o con un cliente RTSP a `rtsp://<host>:8554/<pathName>` (puerto expuesto solo para depuración).

## Si la cámara tiene IP link-local (169.254.x.x)

Algunas cámaras (típicamente conectadas directo a la PC sin DHCP) usan una IP
autoasignada en el rango `169.254.0.0/16`. Estas IPs **nunca son enrutables**
fuera del segmento de red físico donde se asignaron (RFC 3927) — esto aplica
igual en Mac, Windows o Linux. En modo Docker, como los contenedores corren en su
propia red virtual, MediaMTX **no podrá conectarse directo** a una cámara así
aunque tu PC sí la vea (ej. con VLC). El síntoma es un 404 en `/whep` y, en
los logs de mediamtx (`docker logs mediamtx-relay-mediamtx-1`), un
`connection refused` o `no route to host` al intentar conectar al RTSP source.

Solución: levantar un relay TCP en el host (fuera de Docker) que reenvíe un
puerto normal hacia la IP link-local de la cámara, y usar
`host.docker.internal:<puerto>` como host al agregar la cámara en vez de su
IP real.

- **Windows** (ejecutar `cmd.exe` o PowerShell como Administrador):

  ```bat
  scripts\camera-relay-windows.bat 169.254.100.108 554 5540
  ```

  Esto queda activo de forma permanente (no depende de mantener una ventana
  abierta). Para quitarlo: `netsh interface portproxy delete v4tov4 listenport=5540 listenaddress=0.0.0.0`.

- **Mac/Linux**:

  ```bash
  ./scripts/camera-relay-mac.sh 169.254.100.108 554 5540
  ```

  En Mac hay que dejar esta terminal abierta: macOS bloquea el acceso a la
  red local link-local para procesos en background/daemon sin permiso
  otorgado interactivamente.

En ambos casos, al agregar la cámara en el frontend usa:

```
rtsp://usuario:password@host.docker.internal:5540/Streaming/Channels/101?tcp
```

(En modo PM2, donde MediaMTX corre directo en el servidor sin red Docker, este problema no debería aplicar — la cámara se ve igual que desde cualquier otro proceso del mismo host.)

## Notas

- El puerto `9997` (Control API de MediaMTX) **no se expone** fuera de la red interna (Docker) ni a internet (PM2) — solo el backend lo usa, vía localhost o red interna. Observación: Nunca publicarla en producción.
- Por defecto cada cámara se conecta de forma **permanente** a la fuente (`sourceOnDemand: false`), para asegurar que MediaMTX mantenga 1 sola conexión hacia la cámara de la universidad sin importar cuántos viewers se conecten. Puedes marcar la casilla "conectar solo cuando haya alguien viendo" al agregar la cámara si prefieres que se conecte bajo demanda.
- Las áreas de interés se guardan como coordenadas normalizadas (0–1) en `backend/data/areas.json`; no se procesan todavía, quedan listas para que un servicio externo (ej. OpenCV) las consuma. Esa carpeta se genera en runtime y está en `.gitignore`, no se versiona.
