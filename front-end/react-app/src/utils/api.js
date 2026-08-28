// Shared API client — a React-friendly port of front-end/js/core/apiClient.js's
// window.API surface. Cross-cutting: every converted page should import from
// here rather than duplicate its own fetch wrapper (see Final Integration
// Checklist). Points at the same NestJS backend, same /api prefix, same
// x-role auth model as the vanilla app.
import { getRole } from './auth.js';

const API_BASE = 'http://localhost:3000/api';

async function apiFetch(path, options = {}) {
  const role = getRole();
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-role': role,
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new Error('Backend unreachable. Please start the NestJS server.');
  }

  if (res.status === 204) return null;

  let body = null;
  try {
    body = await res.json();
  } catch {
    /* empty/non-JSON body is fine for some responses */
  }

  if (!res.ok) {
    const msg = body?.message || `HTTP ${res.status}`;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }
  return body;
}

export const API = {
  users: {
    getAll: () => apiFetch('/users'),
    getOne: (id) => apiFetch(`/users/${id}`),
    create: (payload) => apiFetch('/users', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id, payload) => apiFetch(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    delete: (id) => apiFetch(`/users/${id}`, { method: 'DELETE' }),
  },
  reports: {
    getAll: () => apiFetch('/reports'),
    updateStatus: (id, status) =>
      apiFetch(`/reports/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    delete: (id) => apiFetch(`/reports/${id}`, { method: 'DELETE' }),
  },
};
