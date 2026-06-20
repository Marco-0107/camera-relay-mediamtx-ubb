import { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import { useWhep } from '../hooks/useWhep.js';
import AreasCanvas from './AreasCanvas.jsx';
import AreasList from './AreasList.jsx';

export default function PreviewPanel({ camera, whepBaseUrl }) {
  const videoRef = useRef(null);
  const { start, stop, error: whepError } = useWhep(videoRef);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    if (!camera) return undefined;

    let cancelled = false;
    (async () => {
      await start(whepBaseUrl, camera.pathName);
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

  if (!camera) return null;

  return (
    <section className="panel preview-panel">
      <h2>Vista previa: {camera.name}</h2>
      <p className="hint">Dibuja un rectángulo sobre el video para marcar un área de interés.</p>
      {whepError && <p className="error">{whepError}</p>}
      <div className="video-wrapper">
        <video className="preview-video" ref={videoRef} autoPlay playsInline muted />
        <AreasCanvas videoRef={videoRef} areas={areas} onCreateArea={handleCreateArea} />
      </div>
      <AreasList areas={areas} onDelete={handleDeleteArea} />
    </section>
  );
}
