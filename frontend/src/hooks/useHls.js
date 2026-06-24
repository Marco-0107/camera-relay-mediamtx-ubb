import Hls from 'hls.js';
import { useRef, useState, useCallback } from 'react';

export function useHls(videoRef) {
  const hlsRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const stop = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.src = '';
    }
    setStatus('idle');
  }, [videoRef]);

  const start = useCallback((hlsBaseUrl, pathName) => {
    setStatus('connecting');
    setError('');
    const url = `${hlsBaseUrl}/${pathName}/index.m3u8`;

    if (Hls.isSupported()) {
      const hls = new Hls({ lowLatencyMode: true, enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play().catch(() => {});
        setStatus('live');
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setStatus('error');
          setError('Se perdió la conexión con la retransmisión.');
        }
      });
    } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari: HLS nativo
      const video = videoRef.current;
      video.src = url;
      const onLoaded = () => { video.play().catch(() => {}); setStatus('live'); };
      const onError = () => { setStatus('error'); setError('Se perdió la conexión con la retransmisión.'); };
      video.addEventListener('loadedmetadata', onLoaded, { once: true });
      video.addEventListener('error', onError, { once: true });
    } else {
      setStatus('error');
      setError('Tu navegador no soporta la reproducción de video en vivo.');
    }
  }, [videoRef]);

  return { start, stop, error, status };
}
