import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { extractErrorMessage } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('gharkaswad_admin_token') || null;
  });

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('gharkaswad_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Loading is true while validating session on mount
  const [loading, setLoading] = useState(() => {
    return Boolean(localStorage.getItem('gharkaswad_admin_token'));
  });

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const fetchCurrentProfile = useCallback(async () => {
    const currentToken = localStorage.getItem('gharkaswad_admin_token');
    if (!currentToken) {
      setLoading(false);
      setUser(null);
      setToken(null);
      return;
    }

    try {
      const data = await authService.getProfile();
      if (data?.user && data.user.role === 'admin') {
        setUser(data.user);
        setToken(currentToken);
        localStorage.setItem('gharkaswad_admin_user', JSON.stringify(data.user));
      } else {
        // Logged in user is not an administrator
        console.warn('User account does not possess admin role. Clearing session.');
        logout();
      }
    } catch (err) {
      const status = err.response?.status;
      // Genuinely invalid or expired credentials: clear session
      if (status === 401 || status === 403) {
        console.warn('Admin token expired or invalid (HTTP ' + status + '). Logging out.');
        logout();
      } else {
        // Transient network error or offline: retain stored user session
        console.warn('Profile sync encountered network issue. Preserving existing session:', err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    fetchCurrentProfile();
  }, [fetchCurrentProfile]);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      if (data?.user?.role !== 'admin') {
        throw new Error('Access denied: This portal is strictly for GharKaSwad administrators.');
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('gharkaswad_admin_token', data.token);
      localStorage.setItem('gharkaswad_admin_user', JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to login as administrator.');
      return { success: false, message: msg };
    }
  };

  const isAuthenticated = Boolean(token && user?.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        logout,
        refreshProfile: fetchCurrentProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
