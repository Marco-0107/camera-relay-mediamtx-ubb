import { env } from '../config/env.js';

export function getConfig(req, res) {
  res.json({
    whepBaseUrl: env.mediamtxWebrtcPublicUrl || `http://${req.hostname}:8889`,
    // Enlace RTSP público de la retransmisión, para abrir en VLC/ffplay/OBS.
    rtspBaseUrl: env.mediamtxRtspPublicUrl || `rtsp://${req.hostname}:8554`,
  });
}
