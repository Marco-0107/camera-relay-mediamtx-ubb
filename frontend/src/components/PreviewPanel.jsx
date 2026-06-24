import { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import { useHls } from '../hooks/useHls.js';
import AreasCanvas from './AreasCanvas.jsx';
import AreasList from './AreasList.jsx';
import BrandSun from './BrandSun.jsx';
import CopyField from './CopyField.jsx';

const STATUS_LABEL = {
  idle: 'Inactivo',
  connecting: 'Conectando…',
  live: 'En vivo',
  error: 'Sin conexión',
};

export default function PreviewPanel({ camera, hlsBaseUrl, rtspBaseUrl }) {
  const videoRef = useRef(null);
  const { start, stop, error: whepError, status } = useHls(videoRef);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    if (!camera) return undefined;

    let cancelled = false;
    (async () => {
      await start(hlsBaseUrl, camera.pathName);
      const cameraAreas = await api(`/api/cameras/${camera.id}/areas`);
      if (!cancelled) setAreas(cameraAreas);
    })();

    return () => {
      cancelled = true;
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera?.id]);

  async function handleCreateArea(area) {
    const created = await api(`/api/cameras/${camera.id}/areas`, {
      method: 'POST',
      body: JSON.stringify(area),
    });
    setAreas((prev) => [...prev, created]);
  }

  async function handleDeleteArea(area) {
    await api(`/api/cameras/${camera.id}/areas/${area.id}`, { method: 'DELETE' });
    setAreas((prev) => prev.filter((a) => a.id !== area.id));
  }

  function handleRetry() {
    stop();
    start(hlsBaseUrl, camera.pathName);
  }

  if (!camera) return null;

  const rtspUrl = rtspBaseUrl ? `${rtspBaseUrl}/${camera.pathName}` : '';
  const browserUrl = hlsBaseUrl ? `${hlsBaseUrl}/${camera.pathName}/index.m3u8` : '';

  return (
    <section className="panel preview">
      <div className="panel__head">
        <BrandSun className="panel__sun" />
        <div className="panel__head-text">
          <h2>Vista previa · {camera.name}</h2>
          <p className="panel__sub">
            Retransmisión generada por el sistema (no es el stream original).
          </p>
        </div>
        <span className={`status status--${status}`}>{STATUS_LABEL[status]}</span>
      </div>

      <div className="video-frame">
        <video className="video-frame__video" ref={videoRef} autoPlay playsInline muted />
        <AreasCanvas videoRef={videoRef} areas={areas} onCreateArea={handleCreateArea} />

        {status === 'live' && <span className="live-badge">En vivo</span>}

        {status !== 'live' && (
          <div className="video-frame__overlay">
            {status === 'error' ? (
              <>
                <WarningIcon />
                <p>{whepError || 'No se pudo conectar la retransmisión.'}</p>
                <button className="btn btn--gold btn--sm" onClick={handleRetry}>
                  Reintentar
                </button>
              </>
            ) : (
              <>
                <span className="spinner" />
                <p>Conectando con la retransmisión…</p>
              </>
            )}
          </div>
        )}
      </div>

      <p className="preview-meta">
        <span className="hint">
          Dibuja un rectángulo sobre el video para marcar un área de interés.
        </span>
      </p>

      {/* Enlace para reproducir en otra app (VLC, ffplay, OBS…) */}
      <div className="share">
        <h3 className="share__title">
          <ShareIcon /> Reproducir en otra aplicación
        </h3>
        <p className="share__desc">
          Copia este enlace y ábrelo en VLC, ffplay, OBS u otro reproductor
          compatible con RTSP para acceder a la retransmisión.
        </p>

        {rtspUrl ? (
          <CopyField value={rtspUrl} ariaLabel="Enlace RTSP de la retransmisión" />
        ) : (
          <p className="hint">Enlace no disponible (configuración del servidor).</p>
        )}

        <p className="share__note">
          <LockIcon />
          <span>
            El enlace apunta al servidor de la UBB: solo funciona para quienes
            pueden alcanzarlo dentro de la red de la Universidad (eduroam), igual
            que la vista previa. La aplicación no lo publica fuera de esa red.
          </span>
        </p>

        <details className="share__help">
          <summary>¿Cómo lo abro en VLC?</summary>
          <ol>
            <li>
              Abre VLC y entra a <strong>Medio › Abrir ubicación de red…</strong>{' '}
              (atajo <code>Ctrl/Cmd + N</code>).
            </li>
            <li>Pega el enlace copiado en el campo de URL.</li>
            <li>
              Presiona <strong>Reproducir</strong>.
            </li>
          </ol>
          {rtspUrl && (
            <p className="share__alt">
              Por terminal: <code>ffplay -rtsp_transport tcp {rtspUrl}</code>
            </p>
          )}
          <p className="share__alt">
            Si VLC no muestra video, activa <em>«Usar RTSP sobre TCP»</em> en sus
            preferencias de entrada.
          </p>
        </details>

        {browserUrl && (
          <p className="share__alt">
            También puedes{' '}
            <a href={browserUrl} target="_blank" rel="noreferrer">
              abrir la retransmisión en el navegador
            </a>
            .
          </p>
        )}
      </div>

      <div className="areas">
        <h3>Áreas de interés</h3>
        <AreasList areas={areas} onDelete={handleDeleteArea} />
      </div>
    </section>
  );
}

function WarningIcon() {
  return (
    <svg className="video-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
      <path d="M16 6l-4-4-4 4M12 2v13" />
    </svg>
  );
}
