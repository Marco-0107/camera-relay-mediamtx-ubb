import { env } from '../config/env.js';

export function getConfig(req, res) {
  res.json({
    whepBaseUrl: env.mediamtxWebrtcPublicUrl || `http://${req.hostname}:8889`,
  });
}
