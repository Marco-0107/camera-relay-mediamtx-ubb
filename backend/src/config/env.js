import 'dotenv/config';

export const env = {
  port: process.env.PORT || 3000,
  mediamtxApiUrl: process.env.MEDIAMTX_API_URL || 'http://localhost:9997',
  mediamtxWebrtcPublicUrl: process.env.MEDIAMTX_WEBRTC_PUBLIC_URL,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  frontendDir: process.env.FRONTEND_DIR,
  dataDir: process.env.DATA_DIR,
};
