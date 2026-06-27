const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
const email = process.env.SMOKE_EMAIL || 'admin@hospital.gov';
const password = process.env.SMOKE_PASSWORD || process.env.SEED_USER_PASSWORD || 'password123';

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === 'object' && payload?.error ? payload.error : response.statusText;
    throw new Error(`${options.method || 'GET'} ${path} failed: ${message}`);
  }

  return payload;
}

const health = await request('/api/health');
console.log('health:', health.ok ? 'ok' : 'failed');

const user = await request('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
console.log('login:', user.email, `(${user.role})`);

const authHeaders = {
  Authorization: `Bearer ${user.token}`,
  'Content-Type': 'application/json',
};

const stats = await request('/api/dashboard/stats', { headers: authHeaders });
console.log('dashboard:', {
  activeCases: stats.activeCases,
  pendingReports: stats.pendingReports,
});

const cases = await request('/api/cases', { headers: authHeaders });
console.log('cases:', cases.length);

const reports = await request('/api/reports', { headers: authHeaders });
console.log('reports:', reports.length);

console.log('smoke test passed');
