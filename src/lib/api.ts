const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export function hasApi() {
  return import.meta.env.VITE_DATA_SOURCE !== 'static';
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(init?.headers ?? {}),
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data && typeof data.error === 'string'
      ? data.error
      : response.status === 404
        ? 'api_unreachable'
        : 'request_failed';
    throw new Error(message);
  }
  if (!data) throw new Error('api_unreachable');
  return data as T;
}
