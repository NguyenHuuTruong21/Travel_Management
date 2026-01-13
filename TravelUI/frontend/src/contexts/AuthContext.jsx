// Quản lý state user, token, login/logout, đăng xuất.

import { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse user from localStorage', err);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);


  const login = async (data) => {
    const res = await authService.login(data);
    if (res?.user && res?.accessToken) {
      setUser(res.user);
      localStorage.setItem('user', JSON.stringify(res.user));
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);
      return { success: true, user: res.user };
    }
    return res;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
