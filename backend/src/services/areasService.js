import crypto from 'crypto';
import * as store from '../store.js';
import { ValidationError, NotFoundError } from './camerasService.js';

function clamp01(n) {
  return Math.min(1, Math.max(0, Number(n)));
}

export async function listAreas(cameraId) {
  const allAreas = await store.getAllAreas();
  return allAreas[cameraId] || [];
}

export async function createArea(cameraId, { label, x, y, width, height }) {
  if (
    !label ||
    [x, y, width, height].some((v) => typeof v !== 'number' || Number.isNaN(v))
  ) {
    throw new ValidationError('label, x, y, width, height (números 0-1) son requeridos');
  }

  const area = {
    id: crypto.randomUUID(),
    label,
    x: clamp01(x),
    y: clamp01(y),
    width: clamp01(width),
    height: clamp01(height),
  };

  const allAreas = await store.getAllAreas();
  const cameraAreas = allAreas[cameraId] || [];
  cameraAreas.push(area);
  allAreas[cameraId] = cameraAreas;
  await store.saveAllAreas(allAreas);

  return area;
}

export async function deleteArea(cameraId, areaId) {
  const allAreas = await store.getAllAreas();
  const cameraAreas = allAreas[cameraId] || [];
  const next = cameraAreas.filter((a) => a.id !== areaId);
  if (next.length === cameraAreas.length) {
    throw new NotFoundError('Área no encontrada');
  }
  allAreas[cameraId] = next;
  await store.saveAllAreas(allAreas);
}
