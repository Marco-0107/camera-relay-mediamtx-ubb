import { useEffect, useState } from 'react';
import { api } from './api.js';
import CameraForm from './components/CameraForm.jsx';
import CameraList from './components/CameraList.jsx';
import PreviewPanel from './components/PreviewPanel.jsx';

export default function App() {
  const [whepBaseUrl, setWhepBaseUrl] = useState('');
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
    <>
      <header>
        <h1>Retransmisor de cámaras</h1>
        <p className="subtitle">
          Registra una cámara RTSP y mira la vista previa de la retransmisión (no la original).
        </p>
      </header>

      <main>
        <CameraForm onCreated={handleCreated} />
        <CameraList cameras={cameras} onSelect={setCurrentCamera} onDelete={handleDelete} />
        {initError && <p className="error">{initError}</p>}
        <PreviewPanel camera={currentCamera} whepBaseUrl={whepBaseUrl} />
      </main>
    </>
  );
}
