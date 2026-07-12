import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const setUser = (userData) => {
    setUserState(userData);
    if (userData) {
      const { avatar, ...safeUserData } = userData;
      localStorage.setItem('user', JSON.stringify(safeUserData));
    } else {
      localStorage.removeItem('user');
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      if (storedToken) {
        try {
          // Fetch up-to-date profile (with large avatar) from backend
          const response = await api.get('/auth/profile');
          setUserState(response.data);
          const { avatar, ...safeUserData } = response.data;
          localStorage.setItem('user', JSON.stringify(safeUserData));
        } catch (error) {
          console.error('Failed to restore session from API:', error);
          if (storedUser) {
            setUserState(JSON.parse(storedUser));
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login User
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, error: message };
    }
  };

  // Register User
  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { token, ...userData } = response.data;

      localStorage.setItem('token', token);
      setUser(userData);

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, error: message };
    }
  };

  // Logout User
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserState(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
