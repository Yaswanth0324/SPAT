import { createContext, useContext, useState, useEffect } from 'react';
import { getToken, setToken, clearToken } from '../utils/api';

const AuthContext = createContext(null);

const SESSION_KEY = 'spark_current_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      console.error('Failed to parse user session on startup:', err);
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) setUser(JSON.parse(saved));
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
    setLoading(false);
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
      role:       userData.role,
      email:      userData.email,
      fullName:   displayName,
      name:       displayName,
      avatar:     userData.avatarUrl,
      token:      userData.token,
      id:         userData.id,
      college:    userData.college,
      adminId:    userData.adminId,
      collegeId:  userData.collegeId,
      department: userData.department,
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

