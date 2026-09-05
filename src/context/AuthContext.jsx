import { createContext, useContext, useState, useEffect } from 'react';
import { getToken, setToken, clearToken, SESSION_EXPIRED_EVENT } from '../utils/api';

const AuthContext = createContext(null);

const SESSION_KEY = 'spark_current_user';

/**
 * Decode a JWT token and return the payload (no validation, just parsing).
 * Returns null if the token is malformed.
 */
const decodeJwtPayload = (token) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

/**
 * Returns true if the stored JWT token is missing or expired.
 */
const isTokenExpiredOrMissing = () => {
  const token = getToken();
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return true;
  // exp is in seconds; Date.now() is in ms
  return payload.exp * 1000 < Date.now();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      // On startup: if token is expired/missing, clear the stale session
      if (isTokenExpiredOrMissing()) {
        clearToken();
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      console.error('Failed to parse user session on startup:', err);
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Restore session from localStorage on mount (already validated above, so no double-check needed)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) setUser(JSON.parse(saved));
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
    setLoading(false);
  }, []);

  // ── Global 401/403 auto-logout listener ──────────────────────────────────────
  // When any API call returns 401 or 403, api.js dispatches 'sapt:session-expired'.
  // We catch it here and perform a clean logout + redirect.
  useEffect(() => {
    const handleSessionExpired = () => {
      // Read role BEFORE clearing so we can redirect to the right login page
      let redirectPath = '/login?reason=session_expired';
      try {
        const saved = localStorage.getItem(SESSION_KEY);
        if (saved) {
          const { role } = JSON.parse(saved);
          if (role === 'SYSTEM_ADMIN' || role === 'COLLEGE_ADMIN') {
            redirectPath = '/admin-login?reason=session_expired';
          }
        }
      } catch { /* ignore */ }

      clearToken();
      localStorage.removeItem(SESSION_KEY);
      setUser(null);
      // Redirect to login — use window.location so we escape any router state
      window.location.href = redirectPath;
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, []);

  /**
   * Called after a successful API login.
   * @param {object} userData - { token, role, email, fullName, expiresIn, id, college }
   */
  const login = (userData) => {
    // Persist JWT token for API calls
    if (userData.token) {
      setToken(userData.token);
    }
    // Persist user session info
    // LoginResponse uses `name`; guard with `fullName` for any legacy callers
    const displayName = userData.name || userData.fullName || '';
    const session = {
      role:           userData.role,
      email:          userData.email,
      fullName:       displayName,
      name:           displayName,
      avatar:         userData.avatarUrl || userData.avatar,
      avatarUrl:      userData.avatarUrl || userData.avatar,
      token:          userData.token,
      id:             userData.id,
      // college — LoginResponse has `college`; User entity exposes getCollege() → collegeName
      college:        userData.college     || userData.collegeName,
      collegeName:    userData.collegeName || userData.college,
      adminId:        userData.adminId,
      collegeId:      userData.collegeId,
      // department — LoginResponse has `department`; User entity exposes getDepartment() → departmentName
      department:     userData.department     || userData.departmentName,
      departmentName: userData.departmentName || userData.department,
      departmentId:   userData.departmentId,
      // profile fields — previously missing, causing phone/position to vanish after save
      phone:          userData.phone,
      position:       userData.position,
      status:         userData.status,
      profileImage:   userData.avatarUrl || userData.avatar || userData.profileImage,
      // role-specific
      rollNo:         userData.rollNo,
      mentorId:       userData.mentorId,
      mentorName:     userData.mentorName,
      hodId:          userData.hodId,
      createdAt:      userData.createdAt || new Date().toISOString(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
  };

  const logout = () => {
    clearToken();
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const refreshUser = () => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) setUser(JSON.parse(saved));
    } catch {
      setUser(null);
    }
  };

  const updateSession = (updates) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, updateSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

