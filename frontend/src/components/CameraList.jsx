export default function CameraList({ cameras, onSelect, onDelete }) {
  return (
    <section className="panel" id="cameras-panel">
      <h2>Cámaras registradas</h2>
      <ul className="camera-list">
        {cameras.length === 0 && (
          <li><span className="meta"><small>Aún no hay cámaras registradas.</small></span></li>
        )}
        {cameras.map((camera) => (
          <li key={camera.id}>
            <span className="meta">
              <strong>{camera.name}</strong>
              <small>{camera.maskedUrl}</small>
            </span>
            <span className="actions">
              <button className="secondary" onClick={() => onSelect(camera)}>Ver</button>
              <button className="danger" onClick={() => onDelete(camera)}>Eliminar</button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
