// =====================================================================
// SPARK — API Utility (axios-based)
// Base URL: http://localhost:8080/api
// All requests automatically attach the Bearer JWT token from localStorage.
// =====================================================================

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// ── Token helpers ─────────────────────────────────────────────────────────────
const TOKEN_KEY = 'spark_jwt_token';

export const getToken  = ()          => localStorage.getItem(TOKEN_KEY);
export const setToken  = (token)     => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = ()         => localStorage.removeItem(TOKEN_KEY);

// ── Core fetch wrapper ────────────────────────────────────────────────────────
/**
 * Makes an authenticated API request.
 * @param {string} endpoint  - Path after /api (e.g. '/system-admin/stats')
 * @param {object} options   - fetch options override
 * @returns {Promise<any>}   - The `data` field from ApiResponse<T>
 */
const request = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Read as text first — avoids "Unexpected end of JSON" on empty bodies (204 etc.)
  const text = await response.text();
  let json = {};
  if (text && text.trim().length > 0) {
    try {
      json = JSON.parse(text);
    } catch {
      // Non-JSON response (e.g. HTML error page from server)
      const error = new Error(`Server returned non-JSON response (${response.status})`);
      error.status = response.status;
      throw error;
    }
  }

  if (!response.ok || json.success === false) {
    const error = new Error(json.message || `Request failed: ${response.status}`);
    error.status = response.status;
    error.data   = json;
    throw error;
  }

  return json.data ?? null;
};

// ── HTTP method shortcuts ─────────────────────────────────────────────────────
const api = {
  get:    (endpoint, options = {})       => request(endpoint, { method: 'GET',    ...options }),
  post:   (endpoint, body, options = {}) => request(endpoint, { method: 'POST',   body: JSON.stringify(body), ...options }),
  put:    (endpoint, body, options = {}) => request(endpoint, { method: 'PUT',    body: JSON.stringify(body), ...options }),
  patch:  (endpoint, body, options = {}) => request(endpoint, { method: 'PATCH',  body: JSON.stringify(body), ...options }),
  delete: (endpoint, options = {})       => request(endpoint, { method: 'DELETE', ...options }),
};

// ── System Admin API ──────────────────────────────────────────────────────────
export const systemAdminApi = {
  /** GET /system-admin/profile — own profile */
  getProfile: () =>
    api.get('/system-admin/profile'),

  /** PUT /system-admin/profile — update profile (name & avatar) */
  updateProfile: (data) =>
    api.put('/system-admin/profile', data),

  /** POST /system-admin/college-admin — create college + admin account */
  createCollegeAdmin: (data) =>
    api.post('/system-admin/college-admin', data),

  /** GET /system-admin/colleges — list all colleges */
  getColleges: () =>
    api.get('/system-admin/colleges'),

  /** GET /system-admin/colleges/:id — single college */
  getCollegeById: (id) =>
    api.get(`/system-admin/colleges/${id}`),

  /** PUT /system-admin/colleges/:id/status — update college status */
  updateCollegeStatus: (id, status) =>
    api.put(`/system-admin/colleges/${id}/status`, { status }),

  /** GET /system-admin/college-admins — list all college admins */
  getCollegeAdmins: () =>
    api.get('/system-admin/college-admins'),

  /** GET /system-admin/stats — KPI stats for dashboard */
  getStats: () =>
    api.get('/system-admin/stats'),
};

// ── Auth API ──────────────────────────────────────────────────────────────────
export const authApi = {
  /** POST /auth/login — role must be 'SYSTEM_ADMIN' | 'COLLEGE_ADMIN' etc. */
  login: (email, password, role) =>
    api.post('/auth/login', { email, password, role }),

  /** POST /auth/register */
  register: (data) =>
    api.post('/auth/register', data),

  /** POST /auth/logout */
  logout: () =>
    api.post('/auth/logout', {}),
};

export default api;
