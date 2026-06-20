import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import camerasRouter from './routes/cameras.js';
import areasRouter from './routes/areas.js';
import configRouter from './routes/config.js';
import { resyncWithMediamtx } from './services/camerasService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIR = env.frontendDir || path.join(__dirname, '..', '..', 'frontend', 'dist');

const app = express();
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.use('/api/cameras', camerasRouter);
app.use('/api/cameras/:cameraId/areas', areasRouter);

// Le dice al frontend dónde está el endpoint WHEP de MediaMTX (puede ser
// distinto host/puerto al del backend si el cliente se conecta de forma remota).
app.use('/api/config', configRouter);

app.use(express.static(FRONTEND_DIR));

app.listen(env.port, async () => {
  console.log(`Backend escuchando en http://0.0.0.0:${env.port}`);
  // MediaMTX guarda los paths agregados por API solo en memoria (el yaml se monta
  // de solo lectura en modo Docker), así que se pierden si el proceso se reinicia.
  // Al arrancar, el backend vuelve a registrarlos a partir de lo que tiene persistido.
  await resyncWithMediamtx();
});
