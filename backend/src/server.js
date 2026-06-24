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

// Proxy transparente hacia el servidor HLS interno de MediaMTX.
// El puerto HLS (8888) no está expuesto externamente, así que el backend
// actúa de intermediario para los segmentos .m3u8 y .ts/.fmp4.
app.get('/hls/*', async (req, res) => {
  const upstreamPath = req.path.replace(/^\/hls/, '') || '/';
  const upstreamUrl = `${env.mediamtxHlsInternalUrl}${upstreamPath}`;
  try {
    const upstream = await fetch(upstreamUrl);
    if (!upstream.ok) { res.status(upstream.status).end(); return; }
    const ct = upstream.headers.get('content-type');
    if (ct) res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'no-cache');
    const buf = await upstream.arrayBuffer();
    res.send(Buffer.from(buf));
  } catch {
    res.status(502).json({ error: 'HLS proxy error' });
  }
});

app.use(express.static(FRONTEND_DIR));

app.listen(env.port, async () => {
  console.log(`Backend escuchando en http://0.0.0.0:${env.port}`);
  // MediaMTX guarda los paths agregados por API solo en memoria (el yaml se monta
  // de solo lectura en modo Docker), así que se pierden si el proceso se reinicia.
  // Al arrancar, el backend vuelve a registrarlos a partir de lo que tiene persistido.
  await resyncWithMediamtx();
});
