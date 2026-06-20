import * as areasService from '../services/areasService.js';
import { ValidationError, NotFoundError } from '../services/camerasService.js';

function handleError(res, err) {
  if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
  if (err instanceof NotFoundError) return res.status(404).json({ error: err.message });
  throw err;
}

export async function list(req, res) {
  res.json(await areasService.listAreas(req.params.cameraId));
}

export async function create(req, res) {
  try {
    const area = await areasService.createArea(req.params.cameraId, req.body || {});
    res.status(201).json(area);
  } catch (err) {
    handleError(res, err);
  }
}

export async function remove(req, res) {
  try {
    await areasService.deleteArea(req.params.cameraId, req.params.areaId);
    res.status(204).end();
  } catch (err) {
    handleError(res, err);
  }
}
