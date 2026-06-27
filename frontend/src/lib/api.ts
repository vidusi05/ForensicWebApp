export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const storedUser = localStorage.getItem('forensic_user');
  const token = storedUser ? JSON.parse(storedUser).token : null;
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('forensic_user');
      window.location.assign('/login');
    }

    const message = typeof payload === 'object' && payload?.error ? payload.error : 'Request failed';
    throw new Error(message);
  }

  return payload as T;
}
