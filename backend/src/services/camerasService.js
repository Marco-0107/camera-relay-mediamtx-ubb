import crypto from 'crypto';
import * as store from '../store.js';
import * as mediamtx from '../clients/mediamtxClient.js';

export class ValidationError extends Error {}
export class NotFoundError extends Error {}
export class MediamtxError extends Error {}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
}

function buildSourceUrl(rtspUrl, username, password) {
  if (!username && !password) return rtspUrl;
  const url = new URL(rtspUrl);
  url.username = encodeURIComponent(username || '');
  url.password = encodeURIComponent(password || '');
  return url.toString();
}

function maskUrl(rtspUrl) {
  try {
    const url = new URL(rtspUrl);
    url.username = '';
    url.password = '';
    return url.toString();
  } catch {
    return rtspUrl;
  }
}

export function toPublic(camera) {
  const { source, ...publicCamera } = camera;
  return publicCamera;
}

export async function listCameras() {
  const cameras = await store.getCameras();
  return cameras.map(toPublic);
}

export async function createCamera({ name, rtspUrl, username, password, sourceOnDemand }) {
  if (!name || !rtspUrl) {
    throw new ValidationError('name y rtspUrl son requeridos');
  }

  let source;
  try {
    source = buildSourceUrl(rtspUrl, username, password);
    new URL(source);
  } catch {
    throw new ValidationError('rtspUrl inválida');
  }

  const cameras = await store.getCameras();
  const baseSlug = slugify(name) || 'camara';
  let pathName = baseSlug;
  let i = 1;
  while (cameras.some((c) => c.pathName === pathName)) {
    pathName = `${baseSlug}-${i++}`;
  }

  try {
    await mediamtx.addPath(pathName, { source, sourceOnDemand: Boolean(sourceOnDemand) });
  } catch (err) {
    throw new MediamtxError(`No se pudo registrar la cámara en MediaMTX: ${err.message}`);
  }

  const camera = {
    id: crypto.randomUUID(),
    name,
    pathName,
    source,
    sourceOnDemand: Boolean(sourceOnDemand),
    maskedUrl: maskUrl(rtspUrl),
    createdAt: new Date().toISOString(),
  };
  cameras.push(camera);
  await store.saveCameras(cameras);

  return toPublic(camera);
}

export async function deleteCamera(id) {
  const cameras = await store.getCameras();
  const camera = cameras.find((c) => c.id === id);
  if (!camera) throw new NotFoundError('Cámara no encontrada');

  try {
    await mediamtx.removePath(camera.pathName);
  } catch (err) {
    // si ya no existe en mediamtx, igual la limpiamos del store
    if (!String(err.message).includes('404')) {
      throw new MediamtxError(`No se pudo eliminar en MediaMTX: ${err.message}`);
    }
  }

  await store.saveCameras(cameras.filter((c) => c.id !== camera.id));

  const allAreas = await store.getAllAreas();
  delete allAreas[camera.id];
  await store.saveAllAreas(allAreas);
}

export async function getCameraStatus(id) {
  const cameras = await store.getCameras();
  const camera = cameras.find((c) => c.id === id);
  if (!camera) throw new NotFoundError('Cámara no encontrada');

  try {
    return await mediamtx.getPath(camera.pathName);
  } catch (err) {
    throw new MediamtxError(err.message);
  }
}

export async function resyncWithMediamtx({ retries = 10, delayMs = 1500 } = {}) {
  const cameras = await store.getCameras();
  if (cameras.length === 0) return;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mediamtx.listPaths();
      break;
    } catch (err) {
      if (attempt === retries) {
        console.error(`No se pudo contactar la Control API de MediaMTX para resincronizar: ${err.message}`);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  for (const camera of cameras) {
    try {
      await mediamtx.addPath(camera.pathName, {
        source: camera.source,
        sourceOnDemand: camera.sourceOnDemand,
      });
      console.log(`Resincronizada cámara '${camera.name}' (${camera.pathName}) en MediaMTX`);
    } catch (err) {
      console.error(`No se pudo resincronizar la cámara '${camera.name}': ${err.message}`);
    }
  }
}
