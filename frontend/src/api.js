const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function api(pathname, options) {
  const res = await fetch(`${BASE_URL}${pathname}`, {
    headers: options?.body ? { 'Content-Type': 'application/json' } : undefined,
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}
