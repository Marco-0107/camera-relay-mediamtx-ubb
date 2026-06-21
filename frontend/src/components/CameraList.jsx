import BrandSun from './BrandSun.jsx';

export default function CameraList({ cameras, activeId, onSelect, onDelete }) {
  return (
    <section className="panel" id="cameras-panel">
      <div className="panel__head">
        <BrandSun className="panel__sun" />
        <div className="panel__head-text">
          <h2>Cámaras registradas</h2>
          <p className="panel__sub">Selecciona una para ver su retransmisión.</p>
        </div>
        {cameras.length > 0 && <span className="badge">{cameras.length}</span>}
      </div>

      {cameras.length === 0 ? (
        <div className="empty-state">
          <CameraIcon />
          <strong>Aún no hay cámaras registradas</strong>
          <span>Agrega una cámara con el formulario para comenzar.</span>
        </div>
      ) : (
        <ul className="camera-list">
          {cameras.map((camera) => (
            <li
              key={camera.id}
              className={`camera${camera.id === activeId ? ' camera--active' : ''}`}
            >
              <div className="camera__info">
                <span className="camera__name">{camera.name}</span>
                <span className="camera__url">{camera.maskedUrl}</span>
                {camera.sourceOnDemand && (
                  <span className="camera__tags">
                    <span className="tag">On-demand</span>
                  </span>
                )}
              </div>
              <div className="camera__actions">
                <button
                  className="btn btn--primary btn--sm"
                  onClick={() => onSelect(camera)}
                >
                  <PlayIcon /> Ver vista previa
                </button>
                <button
                  className="btn btn--danger btn--sm"
                  onClick={() => onDelete(camera)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.54.84l10.3-6.86a1 1 0 0 0 0-1.68L9.54 4.3A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h9A1.5 1.5 0 0 1 15 7.5v9A1.5 1.5 0 0 1 13.5 18h-9A1.5 1.5 0 0 1 3 16.5z" />
      <path d="m15 10 5-3v10l-5-3" />
    </svg>
  );
}
