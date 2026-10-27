function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;

    // 1. Localhost development only – use VITE_API_URL or empty (same-origin proxy)
    if (host === 'localhost' || host === '127.0.0.1') {
      const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '');
      return envUrl || '';
    }

    // 2. api.veloraarougee.com – the API itself, no prefix needed
    if (host === 'api.veloraarougee.com') return '';

    // 3. All other production/preview hosts (veloraarougee.com, admin.veloraarougee.com,
    //    *.vercel.app, etc.) – use same-origin /api/* to avoid CORS entirely.
    //    Vercel's rewrite `/api/(.*)` → `/api?__path=/$1` routes these to the serverless fn.
    return '/api';
  }

  return '';
}

export function hasApi() {
  return import.meta.env.VITE_DATA_SOURCE !== 'static';
}

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const adminSession = localStorage.getItem('vr_admin_session');
    if (adminSession) {
      const parsed = JSON.parse(adminSession);
      if (parsed?.token) {
        return { Authorization: `Bearer ${parsed.token}` };
      }
    }
    const customerToken = localStorage.getItem('vr_customer_token');
    if (customerToken) {
      return { Authorization: `Bearer ${customerToken}` };
    }
  } catch {}
  return {};
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const primaryUrl = `${baseUrl}${path}`;

  const executeRequest = async (url: string) => {
    return fetch(url, {
      ...init,
      credentials: 'include',
      headers: {
        ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...getAuthHeader(),
        ...(init?.headers ?? {}),
      },
    });
  };

  let response: Response;
  try {
    response = await executeRequest(primaryUrl);
  } catch (networkError) {
    // If connecting to https://api.veloraarougee.com failed (e.g. DNS not yet propagated),
    // and we are on a custom domain, fall back to same-origin /api rewrite
    if (baseUrl && typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
      try {
        response = await executeRequest(`/api${path}`);
      } catch {
        throw networkError;
      }
    } else {
      throw networkError;
    }
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data && typeof data.detail === 'string' ? data.detail : '';
    const code = data && typeof data.error === 'string' ? data.error : '';
    const message = detail || code
      || (response.status === 404 ? 'api_unreachable' : 'request_failed');
    throw new Error(message);
  }
  if (!data) throw new Error('api_unreachable');
  return data as T;
}
