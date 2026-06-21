// El "sol" UBB: elemento gráfico recurrente del Manual de Normas Gráficas,
// usado aquí como marcador de sección. Hereda el color vía `currentColor`.
export default function BrandSun({ className }) {
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return (
      <line
        key={i}
        x1={(12 + 5 * c).toFixed(2)}
        y1={(12 + 5 * s).toFixed(2)}
        x2={(12 + 8.6 * c).toFixed(2)}
        y2={(12 + 8.6 * s).toFixed(2)}
      />
    );
  });

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none">
        {rays}
      </g>
      <circle cx="12" cy="12" r="3.4" fill="currentColor" />
    </svg>
  );
}
