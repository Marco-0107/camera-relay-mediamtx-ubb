import { env } from '../config/env.js';

export function getConfig(req, res) {
  const origin = `${req.protocol}://${req.get('host')}`;
  res.json({
    hlsBaseUrl: `${origin}/hls`,
    rtspBaseUrl: env.mediamtxRtspPublicUrl || `rtsp://${req.hostname}:8554`,
  });
}
