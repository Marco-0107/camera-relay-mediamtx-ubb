export default function AreasList({ areas, onDelete }) {
  return (
    <>
      <h3>Áreas de interés</h3>
      <ul className="areas-list">
        {areas.length === 0 && <li><span>Sin áreas definidas todavía.</span></li>}
        {areas.map((area) => (
          <li key={area.id}>
            <span>{area.label}</span>
            <button className="danger" onClick={() => onDelete(area)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </>
  );
}
