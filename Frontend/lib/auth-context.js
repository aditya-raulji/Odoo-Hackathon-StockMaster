import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken } from './api';

const AuthContext = createContext(null);

// Storage utility functions for 7-day persistence
const STORAGE_KEY = 'stockmaster_auth';
const STORAGE_EXPIRY_KEY = 'stockmaster_auth_expiry';

const saveAuthToStorage = (user, token) => {
  try {
    const expiryTime = new Date().getTime() + 7 * 24 * 60 * 60 * 1000; // 7 days
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
    localStorage.setItem(STORAGE_EXPIRY_KEY, expiryTime.toString());
  } catch (err) {
    console.error('Failed to save auth to storage:', err);
  }
};

const getAuthFromStorage = () => {
  try {
    const expiryTime = localStorage.getItem(STORAGE_EXPIRY_KEY);
    if (!expiryTime || new Date().getTime() > parseInt(expiryTime)) {
      // Auth data expired
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_EXPIRY_KEY);
      return null;
    }
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Failed to get auth from storage:', err);
    return null;
  }
};

const clearAuthFromStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_EXPIRY_KEY);
  } catch (err) {
    console.error('Failed to clear auth from storage:', err);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from token and storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        // First check if we have stored auth data
        const storedAuth = getAuthFromStorage();
        if (storedAuth?.user && storedAuth?.token) {
          setAuthToken(storedAuth.token);
          setUser(storedAuth.user);
          console.log('User restored from storage:', storedAuth.user.email);
          setLoading(false);
          return;
        }

        // Otherwise check if we have a token in memory
        const token = getAuthToken();
        if (token) {
          try {
            const response = await api.get('/auth/me');
            // response is { ok: true, data: { user: {...} } }
            const userData = response.data?.user || response.user;
            if (userData) {
              setUser(userData);
              saveAuthToStorage(userData, token);
              console.log('User restored from token:', userData.email);
            }
          } catch (err) {
            console.error('Failed to fetch user:', err);
            setAuthToken(null);
            clearAuthFromStorage();
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', { email, password });
      
      // response is { ok: true, data: { accessToken, user: {...} } }
      const token = response.data?.accessToken;
      const user = response.data?.user;
      
      if (token && user) {
        setAuthToken(token);
        setUser(user);
        saveAuthToStorage(user, token);
        return { ok: true, data: { accessToken: token, user } };
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      const message = err.payload?.error?.message || err.message || 'Login failed';
      setError(message);
      console.error('Login error:', err);
      throw err;
    }
  };

  const signup = async (firstName, lastName, email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/signup', { firstName, lastName, email, password });
      
      // Backend returns { ok: true, data: { userId, email, message } }
      // User needs to verify OTP before login
      return response;
    } catch (err) {
      const message = err.payload?.error?.message || err.message || 'Signup failed';
      setError(message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAuthToken(null);
      setUser(null);
      clearAuthFromStorage();
    }
  };

  const requestOTP = async (email) => {
    try {
      setError(null);
      const response = await api.post('/auth/request-otp', { email });
      return response;
    } catch (err) {
      setError(err.payload?.error?.message || 'OTP request failed');
      throw err;
    }
  };

  const verifyOTP = async (otp, email) => {
    try {
      setError(null);
      console.log('Verifying OTP:', otp, 'for email:', email);
      const response = await api.post('/auth/verify-otp', { otp, email });
      
      console.log('OTP verification response:', response);
      
      // Backend returns { ok: true, data: { accessToken, refreshToken, user: {...} } }
      const token = response.data?.accessToken;
      const user = response.data?.user;
      
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('User:', user ? 'Present' : 'Missing');
      
      if (token && user) {
        setAuthToken(token);
        setUser(user);
        saveAuthToStorage(user, token);
        return response;
      } else {
        console.error('Response structure:', response);
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('OTP verification error details:', err);
      const message = err.payload?.error?.message || err.message || 'OTP verification failed';
      setError(message);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    requestOTP,
    verifyOTP,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
