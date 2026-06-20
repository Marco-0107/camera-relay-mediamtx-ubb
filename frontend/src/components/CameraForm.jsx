import { useState } from 'react';
import { api } from '../api.js';

export default function CameraForm({ onCreated }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [onDemand, setOnDemand] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const camera = await api('/api/cameras', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          rtspUrl: url.trim(),
          username: user.trim() || undefined,
          password: pass || undefined,
          sourceOnDemand: onDemand,
        }),
      });
      setName('');
      setUrl('');
      setUser('');
      setPass('');
      setOnDemand(false);
      onCreated(camera);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="panel" id="add-camera-panel">
      <h2>Agregar cámara</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre
          <input
            type="text"
            placeholder="Ej: Entrada principal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          URL RTSP de la cámara original
          <input
            type="text"
            placeholder="rtsp://192.168.1.50:554/stream1"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </label>
        <div className="row">
          <label>
            Usuario (opcional)
            <input type="text" value={user} onChange={(e) => setUser(e.target.value)} />
          </label>
          <label>
            Contraseña (opcional)
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
          </label>
        </div>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={onDemand}
            onChange={(e) => setOnDemand(e.target.checked)}
          />
          Conectar a la cámara solo cuando haya alguien viendo (ahorra carga si nadie mira)
        </label>
        <button type="submit">Agregar cámara</button>
        <p className="error">{error}</p>
      </form>
    </section>
  );
}
