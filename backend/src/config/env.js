import 'dotenv/config';

export const env = {
  port: process.env.PORT || 3000,
  mediamtxApiUrl: process.env.MEDIAMTX_API_URL || 'http://localhost:9997',
  mediamtxHlsInternalUrl: process.env.MEDIAMTX_HLS_INTERNAL_URL || 'http://127.0.0.1:8888',
  mediamtxRtspPublicUrl: process.env.MEDIAMTX_RTSP_PUBLIC_URL,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  frontendDir: process.env.FRONTEND_DIR,
  dataDir: process.env.DATA_DIR,
};
