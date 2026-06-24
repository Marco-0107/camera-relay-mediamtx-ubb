import { areaColor } from './AreasCanvas.jsx';

export default function AreasList({ areas, onDelete }) {
  if (areas.length === 0) {
    return <p className="areas-empty">Sin áreas definidas todavía.</p>;
  }

  return (
    <ul className="areas-list">
      {areas.map((area, i) => (
        <li key={area.id}>
          <span className="area-swatch" style={{ background: areaColor(i) }} aria-hidden="true" />
          <span className="area-label">{area.label}</span>
          <button className="btn btn--danger btn--sm" onClick={() => onDelete(area)}>
            Eliminar
          </button>
        </li>
      ))}
    </ul>
  );
}
