import { useRef, useState, useCallback } from 'react';

function waitForIceGathering(pc) {
  if (pc.iceGatheringState === 'complete') return Promise.resolve();
  return new Promise((resolve) => {
    function check() {
      if (pc.iceGatheringState === 'complete') {
        pc.removeEventListener('icegatheringstatechange', check);
        resolve();
      }
    }
    pc.addEventListener('icegatheringstatechange', check);
    setTimeout(resolve, 4000);
  });
}

export function useWhep(videoRef) {
  const pcRef = useRef(null);
  const resourceUrlRef = useRef(null);
  const [error, setError] = useState('');

  const stop = useCallback(() => {
    if (resourceUrlRef.current) {
      fetch(resourceUrlRef.current, { method: 'DELETE' }).catch(() => {});
      resourceUrlRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [videoRef]);

  const start = useCallback(async (whepBaseUrl, pathName) => {
    setError('');
    try {
      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      pc.addTransceiver('video', { direction: 'recvonly' });
      pc.addTransceiver('audio', { direction: 'recvonly' });
      pc.ontrack = (event) => {
        if (videoRef.current) videoRef.current.srcObject = event.streams[0];
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await waitForIceGathering(pc);

      const whepUrl = `${whepBaseUrl}/${pathName}/whep`;
      const res = await fetch(whepUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: pc.localDescription.sdp,
      });

      if (!res.ok) {
        throw new Error(`No se pudo conectar la retransmisión (HTTP ${res.status}). ¿La cámara está activa?`);
      }

      const location = res.headers.get('Location');
      resourceUrlRef.current = location ? new URL(location, whepUrl).toString() : null;

      const answerSdp = await res.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
    } catch (err) {
      setError(err.message);
    }
  }, [videoRef]);

  return { start, stop, error };
}
