import { promises as fs } from 'fs';
import path from 'path';
import { env } from './config/env.js';

const DATA_DIR = env.dataDir || path.join(process.cwd(), 'data');
const CAMERAS_FILE = path.join(DATA_DIR, 'cameras.json');
const AREAS_FILE = path.join(DATA_DIR, 'areas.json');

async function readJson(file, fallback) {
  try {
    const raw = await fs.readFile(file, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw err;
  }
}

async function writeJson(file, data) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

export async function getCameras() {
  return readJson(CAMERAS_FILE, []);
}

export async function saveCameras(cameras) {
  await writeJson(CAMERAS_FILE, cameras);
}

export async function getAllAreas() {
  return readJson(AREAS_FILE, {});
}

export async function saveAllAreas(areasByCamera) {
  await writeJson(AREAS_FILE, areasByCamera);
}
