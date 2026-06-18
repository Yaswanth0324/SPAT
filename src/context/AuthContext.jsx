import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, setCurrentUser, logout as logoutDB } from '../utils/localStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return getCurrentUser();
    } catch (err) {
      console.error('Failed to parse user session on startup:', err);
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sync context state with localStorage on mount (e.g. if updated by other tabs/windows)
    const u = getCurrentUser();
    setUser(u);
    setLoading(false);
  }, []);

  const login = (userData) => {
    const currentUser = getCurrentUser();
    const token = userData.token || (currentUser && currentUser.token);
    const mergedData = { ...currentUser, ...userData };
    if (token) {
      mergedData.token = token;
    }
    setCurrentUser(mergedData);
    setUser(mergedData);
  };

  const logout = () => {
    logoutDB();
    setUser(null);
  };

  const refreshUser = () => {
    const u = getCurrentUser();
    setUser(u);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

