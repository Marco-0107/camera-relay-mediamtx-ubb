import * as camerasService from '../services/camerasService.js';
import { ValidationError, NotFoundError, MediamtxError } from '../services/camerasService.js';

function handleError(res, err) {
  if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
  if (err instanceof NotFoundError) return res.status(404).json({ error: err.message });
  if (err instanceof MediamtxError) return res.status(502).json({ error: err.message });
  throw err;
}

export async function list(req, res) {
  res.json(await camerasService.listCameras());
}

export async function create(req, res) {
  try {
    const camera = await camerasService.createCamera(req.body || {});
    res.status(201).json(camera);
  } catch (err) {
    handleError(res, err);
  }
}

export async function remove(req, res) {
  try {
    await camerasService.deleteCamera(req.params.id);
    res.status(204).end();
  } catch (err) {
    handleError(res, err);
  }
}

export async function status(req, res) {
  try {
    res.json(await camerasService.getCameraStatus(req.params.id));
  } catch (err) {
    handleError(res, err);
  }
}
