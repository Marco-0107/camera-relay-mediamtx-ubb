@echo off
REM Relay TCP para camaras con IP link-local (169.254.x.x).
REM
REM Docker Desktop (Mac/Windows/Linux) corre los contenedores en una red
REM virtual separada del host. Las IPs link-local (169.254.0.0/16) NUNCA
REM son enrutables fuera del segmento fisico donde se asignaron (RFC 3927),
REM asi que el contenedor de MediaMTX no puede llegar directo a la camara
REM aunque la propia PC si la vea (ej. con VLC).
REM
REM Este script usa netsh portproxy (a nivel de kernel de Windows, sin
REM instalar nada extra) para reenviar un puerto normal hacia la IP
REM link-local de la camara. A diferencia de macOS, esto NO requiere
REM mantener una terminal abierta: queda activo hasta que lo borres.
REM
REM Debe ejecutarse como Administrador (clic derecho -> "Ejecutar como
REM administrador" en cmd.exe, o "Run as Administrator" en PowerShell).
REM
REM Uso:
REM   camera-relay-windows.bat <ip-camara> <puerto-camara> [puerto-local]
REM
REM Ejemplo:
REM   camera-relay-windows.bat 169.254.100.108 554 5540
REM
REM Luego en el formulario de "Agregar camara" usa como URL RTSP:
REM   rtsp://usuario:password@host.docker.internal:5540/Streaming/Channels/101?tcp
REM
REM Para quitar el relay despues:
REM   netsh interface portproxy delete v4tov4 listenport=5540 listenaddress=0.0.0.0

setlocal

if "%~1"=="" (
  echo Uso: %~nx0 ^<ip-camara^> ^<puerto-camara^> [puerto-local]
  exit /b 1
)
if "%~2"=="" (
  echo Uso: %~nx0 ^<ip-camara^> ^<puerto-camara^> [puerto-local]
  exit /b 1
)

set CAMERA_IP=%~1
set CAMERA_PORT=%~2
set LOCAL_PORT=%~3
if "%LOCAL_PORT%"=="" set LOCAL_PORT=5540

REM Limpia una regla previa en el mismo puerto, si existe.
netsh interface portproxy delete v4tov4 listenport=%LOCAL_PORT% listenaddress=0.0.0.0 >nul 2>&1

netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=%LOCAL_PORT% connectaddress=%CAMERA_IP% connectport=%CAMERA_PORT%
if errorlevel 1 (
  echo.
  echo ERROR: no se pudo crear la regla. Asegurate de ejecutar este script como Administrador.
  exit /b 1
)

REM Permite la conexion entrante en el firewall de Windows.
netsh advfirewall firewall add rule name="MediaMTX camera relay %LOCAL_PORT%" dir=in action=allow protocol=TCP localport=%LOCAL_PORT% >nul 2>&1

echo.
echo Relay activo: 0.0.0.0:%LOCAL_PORT% -^> %CAMERA_IP%:%CAMERA_PORT%
echo En MediaMTX, usa como host de origen: host.docker.internal:%LOCAL_PORT%
echo.
echo Este relay queda activo permanentemente (no depende de esta ventana).
echo Para quitarlo: netsh interface portproxy delete v4tov4 listenport=%LOCAL_PORT% listenaddress=0.0.0.0

endlocal
