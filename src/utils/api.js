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

// ── College Admin API ─────────────────────────────────────────────────────────
export const collegeAdminApi = {
  /** GET /college-admin/profile — own profile */
  getProfile: () =>
    api.get('/college-admin/profile'),

  /** PUT /college-admin/profile — update name, phone, position, avatar */
  updateProfile: (data) =>
    api.put('/college-admin/profile', data),

  /** PUT /college-admin/college — update college address and official email */
  updateCollegeDetails: (data) =>
    api.put('/college-admin/college', data),

  /** GET /college-admin/dashboard — full college-wide analytics stats */
  getDashboardStats: () =>
    api.get('/college-admin/dashboard'),

  /** GET /college-admin/departments — list departments with HOD/mentor/student counts */
  getDepartments: () =>
    api.get('/college-admin/departments'),

  /** GET /college-admin/users?role=HOD|MENTOR|STUDENT */
  getUsersByRole: (role) =>
    api.get(`/college-admin/users?role=${role}`),
};

// ── HOD API ───────────────────────────────────────────────────────────────────
export const hodApi = {
  /**
   * GET /hod/dashboard
   * Full department analytics: stat cards, charts, top students/mentors,
   * approved mentor list, and pending mentor approvals list.
   */
  getDashboardStats: () =>
    api.get('/hod/dashboard'),

  /** GET /hod/profile — HOD's own profile */
  getProfile: () =>
    api.get('/hod/profile'),

  /**
   * GET /hod/mentors
   * All APPROVED mentors in the HOD's department.
   */
  getMentors: () =>
    api.get('/hod/mentors'),

  /**
   * GET /hod/mentor-approvals
   * All PENDING mentor registrations in the HOD's department.
   */
  getPendingMentors: () =>
    api.get('/hod/mentor-approvals'),
};

// ── Shared Auth-scoped API helpers (used across multiple role pages) ───────────
/**
 * GET /auth/users?collegeName=X&role=HOD|MENTOR|STUDENT
 * Returns all users in a college filtered by role.
 * Used by: CollegeAdminPages, HODPages, MentorPages
 */
export const apiGetUsersByCollege = (collegeName, role) =>
  api.get(`/auth/users?collegeName=${encodeURIComponent(collegeName)}&role=${role}`);

/**
 * POST /auth/users/:userId/status?status=APPROVED|REJECTED|PENDING
 * Approves or rejects a user registration.
 * Used by: CollegeAdminPages (HOD approval), HODPages (Mentor approval), MentorPages (Student approval)
 */
export const apiUpdateUserStatus = (userId, status) =>
  api.post(`/auth/users/${userId}/status?status=${status}`);

/**
 * GET /auth/users/mentor/:mentorId
 * Returns all students assigned to a specific mentor.
 * Used by: MentorPages
 */
export const apiGetUsersByMentor = (mentorId) =>
  api.get(`/auth/users/mentor/${mentorId}`);

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
export const apiLogin = (email, password, role) =>
  api.post('/auth/login', { email, password, role });

export const apiRegister = (data) =>
  api.post('/auth/register', data);

export const apiGetColleges = () =>
  api.get('/auth/colleges');

export const apiGetDepartments = (collegeName) =>
  api.get(`/auth/colleges/departments?collegeName=${encodeURIComponent(collegeName)}`);

export const apiGetMentors = (collegeName, departmentName) =>
  api.get(`/auth/mentors?collegeName=${encodeURIComponent(collegeName)}&departmentName=${encodeURIComponent(departmentName)}`);

export const apiSendOtp = (email, purpose) =>
  api.post('/auth/otp/send', { email, purpose });

export const apiVerifyOtp = (email, otp, purpose) =>
  api.post('/auth/otp/verify', { email, otp, purpose });

export const apiUpdateProfile = (userId, data) =>
  api.put(`/auth/users/${userId}/profile`, data);

export const authApi = {
  login: apiLogin,
  register: apiRegister,
  logout: () => api.post('/auth/logout', {}),
};

export default api;
