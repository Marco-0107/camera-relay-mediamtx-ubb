import { useEffect, useState } from 'react';
import { api } from './api.js';
import BrandHeader from './components/BrandHeader.jsx';
import BrandSun from './components/BrandSun.jsx';
import CameraForm from './components/CameraForm.jsx';
import CameraList from './components/CameraList.jsx';
import PreviewPanel from './components/PreviewPanel.jsx';

export default function App() {
  const [whepBaseUrl, setWhepBaseUrl] = useState('');
  const [rtspBaseUrl, setRtspBaseUrl] = useState('');
  const [cameras, setCameras] = useState([]);
  const [currentCamera, setCurrentCamera] = useState(null);
  const [initError, setInitError] = useState('');

  async function loadCameras() {
    setCameras(await api('/api/cameras'));
  }

  useEffect(() => {
    (async () => {
      try {
        const config = await api('/api/config');
        setWhepBaseUrl(config.whepBaseUrl);
        setRtspBaseUrl(config.rtspBaseUrl || '');
        await loadCameras();
      } catch (err) {
        setInitError(`No se pudo inicializar: ${err.message}`);
      }
    })();
  }, []);

  async function handleCreated(camera) {
    await loadCameras();
    setCurrentCamera(camera);
  }

  async function handleDelete(camera) {
    if (currentCamera?.id === camera.id) setCurrentCamera(null);
    await api(`/api/cameras/${camera.id}`, { method: 'DELETE' });
    await loadCameras();
  }

  return (
    <div className="app">
      <BrandHeader />

      <main className="container">
        <section className="hero">
          <BrandSun className="hero__sun" />
          <p className="hero__eyebrow">Universidad del Bío-Bío</p>
          <h1>Retransmisión de cámaras en vivo</h1>
          <p>
            Registra una cámara RTSP y compártela de forma segura: el sistema
            entrega una retransmisión (no la fuente original) que puedes ver en
            el navegador o abrir en un reproductor como VLC.
          </p>
          <div className="hero__chips">
            <span className="chip">
              <DotIcon /> RTSP → WebRTC
            </span>
            <span className="chip">
              <DotIcon /> Compatible con VLC
            </span>
            <span className="chip">
              <DotIcon /> Áreas de interés
            </span>
          </div>
        </section>

        {initError && <p className="alert alert--error">{initError}</p>}

        <div className="grid">
          <CameraForm onCreated={handleCreated} />
          <CameraList
            cameras={cameras}
            activeId={currentCamera?.id}
            onSelect={setCurrentCamera}
            onDelete={handleDelete}
          />
        </div>

        <PreviewPanel
          camera={currentCamera}
          whepBaseUrl={whepBaseUrl}
          rtspBaseUrl={rtspBaseUrl}
        />
      </main>

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <span>
            <strong>Universidad del Bío-Bío</strong> · Sistema de retransmisión de
            cámaras
          </span>
          <span>Uso institucional interno</span>
        </div>
      </footer>
    </div>
  );
}

function DotIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="6" fill="currentColor" />
    </svg>
  );
}
