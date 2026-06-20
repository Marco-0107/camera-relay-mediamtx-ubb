import { env } from '../config/env.js';

async function request(method, urlPath, body) {
  const res = await fetch(`${env.mediamtxApiUrl}${urlPath}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`MediaMTX API ${method} ${urlPath} -> ${res.status}: ${text}`);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export function addPath(name, { source, sourceOnDemand = false }) {
  return request('POST', `/v3/config/paths/add/${encodeURIComponent(name)}`, {
    source,
    sourceOnDemand,
  });
}

export function removePath(name) {
  return request('DELETE', `/v3/config/paths/delete/${encodeURIComponent(name)}`);
}

export function getPath(name) {
  return request('GET', `/v3/paths/get/${encodeURIComponent(name)}`);
}

export function listPaths() {
  return request('GET', '/v3/paths/list');
}
