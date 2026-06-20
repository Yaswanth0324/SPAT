// =====================================================================
// api.js — Real Backend API calls (replaces localStorage mock auth)
// Base URL: /api
// =====================================================================

const BASE_URL = '/api';

// ---- Token helpers ----
export const getToken = () => localStorage.getItem('spat_token');
export const setToken = (token) => localStorage.setItem('spat_token', token);
export const clearToken = () => localStorage.removeItem('spat_token');

// ---- Core fetch wrapper ----
const request = async (method, path, body = null) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || data?.error || 'Something went wrong');
  }
  return data;
};

// =====================================================================
// AUTH API
// =====================================================================

/**
 * Login — works for ALL roles (SYSTEM_ADMIN, COLLEGE_ADMIN, HOD, MENTOR, STUDENT)
 * POST /api/auth/login
 * Backend returns: ApiResponse { success, message, data: LoginResponse }
 * LoginResponse has: token, role, name, email, id, college, department, adminId, ...
 */
export const apiLogin = async (email, password, role) => {
  // ApiResponse wrapper: { success: true, message: "...", data: { token, name, role, ... } }
  const wrapper = await request('POST', '/auth/login', { email, password, role });
  const user = wrapper.data;   // The actual LoginResponse object

  // Store JWT
  setToken(user.token);

  // Normalize role to uppercase string for frontend ROLES constants
  // Backend sends enum name e.g. "SYSTEM_ADMIN", frontend ROLES = { SYSTEM_ADMIN: 'SYSTEM_ADMIN' }
  return { success: true, user };
};

/**
 * Register — for HOD, MENTOR, STUDENT
 * POST /api/auth/register
 */
export const apiRegister = async (payload) => {
  const data = await request('POST', '/auth/register', payload);
  return { success: true, message: data.message };
};

/**
 * Send OTP
 * POST /api/auth/otp/send
 */
export const apiSendOtp = async (email, purpose = 'EMAIL_VERIFICATION') => {
  const data = await request('POST', '/auth/otp/send', { email, purpose });
  return { success: true, message: data.message };
};

/**
 * Verify OTP
 * POST /api/auth/otp/verify
 */
export const apiVerifyOtp = async (email, otp, purpose = 'EMAIL_VERIFICATION') => {
  const data = await request('POST', '/auth/otp/verify', { email, otp, purpose });
  return { success: true, message: data.message };
};

/**
 * Reset Password
 * POST /api/auth/password/reset
 */
export const apiResetPassword = async (email, otp, newPassword) => {
  const data = await request('POST', '/auth/password/reset', { email, otp, newPassword });
  return { success: true, message: data.message };
};

/**
 * Logout
 * POST /api/auth/logout
 */
export const apiLogout = async () => {
  try {
    await request('POST', '/auth/logout');
  } finally {
    clearToken();
  }
};

// =====================================================================
// COLLEGES & DEPARTMENTS API (for dropdowns in login/register page)
// =====================================================================

/**
 * Get all active colleges (for login/register college dropdown)
 * GET /auth/colleges
 */
export const apiGetColleges = async () => {
  try {
    const data = await request('GET', '/auth/colleges');
    return data.data || [];
  } catch {
    // Fallback to localStorage while backend college endpoint is being built
    return JSON.parse(localStorage.getItem('spat_colleges') || '[]');
  }
};

/**
 * Get all active departments for a college
 * GET /auth/colleges/departments?collegeName=...
 */
export const apiGetDepartments = async (collegeName) => {
  try {
    const data = await request('GET', `/auth/colleges/departments?collegeName=${encodeURIComponent(collegeName)}`);
    return data.data || [];
  } catch {
    return [];
  }
};

/**
 * Get approved mentors for a college and department
 * GET /auth/mentors?collegeName=...&departmentName=...
 */
export const apiGetMentors = async (collegeName, departmentName) => {
  try {
    const data = await request('GET', `/auth/mentors?collegeName=${encodeURIComponent(collegeName)}&departmentName=${encodeURIComponent(departmentName)}`);
    return data.data || [];
  } catch {
    return [];
  }
};

/**
 * Get users for a college and role
 * GET /auth/users?collegeName=...&role=...
 */
export const apiGetUsersByCollege = async (collegeName, role) => {
  try {
    const data = await request('GET', `/auth/users?collegeName=${encodeURIComponent(collegeName)}&role=${role}`);
    return data.data || [];
  } catch {
    return [];
  }
};

/**
 * Get users assigned to a mentor
 * GET /auth/users/mentor/{mentorId}
 */
export const apiGetUsersByMentor = async (mentorId) => {
  try {
    const data = await request('GET', `/auth/users/mentor/${mentorId}`);
    return data.data || [];
  } catch {
    return [];
  }
};

/**
 * Update user status (approve/reject)
 * POST /auth/users/{userId}/status?status=...
 */
export const apiUpdateUserStatus = async (userId, status) => {
  const data = await request('POST', `/auth/users/${userId}/status?status=${status}`);
  return { success: true, message: data.message };
};

/**
 * Update user profile details
 * PUT /auth/users/{userId}/profile
 */
export const apiUpdateProfile = async (userId, updates) => {
  const data = await request('PUT', `/auth/users/${userId}/profile`, updates);
  return { success: true, user: data.data };
};
