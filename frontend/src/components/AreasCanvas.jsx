import { useEffect, useRef, useState } from 'react';

function drawRect(ctx, canvas, nx, ny, nw, nh, label, color) {
  const x = nx * canvas.width;
  const y = ny * canvas.height;
  const w = nw * canvas.width;
  const h = nh * canvas.height;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = `${color}33`;
  ctx.fillRect(x, y, w, h);

  if (label) {
    ctx.fillStyle = color;
    ctx.font = '13px system-ui';
    ctx.fillText(label, x + 4, y + 14);
  }
}

function canvasToNormalized(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
    y: Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)),
  };
}

export default function AreasCanvas({ videoRef, areas, onCreateArea }) {
  const canvasRef = useRef(null);
  const [drag, setDrag] = useState(null);

  function redraw() {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const rect = video.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const area of areas) {
      drawRect(ctx, canvas, area.x, area.y, area.width, area.height, area.label, '#4f8cff');
    }
    if (drag) {
      const { startX, startY, endX, endY } = drag;
      drawRect(
        ctx,
        canvas,
        Math.min(startX, endX),
        Math.min(startY, endY),
        Math.abs(endX - startX),
        Math.abs(endY - startY),
        null,
        '#ff9d4f'
      );
    }
  }

  useEffect(redraw, [areas, drag]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    video.addEventListener('loadedmetadata', redraw);
    window.addEventListener('resize', redraw);
    return () => {
      video.removeEventListener('loadedmetadata', redraw);
      window.removeEventListener('resize', redraw);
    };
    // El <video> no cambia de identidad durante la vida de este componente
    // (se monta/desmonta junto con la cámara seleccionada), por eso basta con
    // suscribirse una sola vez al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMouseDown(e) {
    const { x, y } = canvasToNormalized(canvasRef.current, e.clientX, e.clientY);
    setDrag({ startX: x, startY: y, endX: x, endY: y });
  }

  function handleMouseMove(e) {
    if (!drag) return;
    const { x, y } = canvasToNormalized(canvasRef.current, e.clientX, e.clientY);
    setDrag((prev) => ({ ...prev, endX: x, endY: y }));
  }

  async function handleMouseUp() {
    if (!drag) return;
    const { startX, startY, endX, endY } = drag;
    const x = Math.min(startX, endX);
    const y = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    setDrag(null);

    if (width < 0.01 || height < 0.01) return;

    const label = window.prompt('Etiqueta para esta área de interés:', `Área ${areas.length + 1}`);
    if (!label) return;

    onCreateArea({ label, x, y, width, height });
  }

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag, areas]);

  return (
    <canvas
      className="areas-canvas"
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    />
  );
}
