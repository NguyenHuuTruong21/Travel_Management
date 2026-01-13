// # Gọi API: login, register, logout

import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


const login = async (data) => {
  try {
    const res = await API.post('/auth/login', data);
    return res.data;
  } catch (err) {
    return { error: err.response?.data?.message || err.message };
  }
};

const register = async (data) => {
  try {
    const res = await API.post('/auth/register', data);
    return res.data;
  } catch (err) {
    return { error: err.response?.data?.message || err.message };
  }
};

const logout = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await API.post('/auth/logout', { refreshToken });
    }
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
  return { success: true };
};

const authService = { login, register, logout };

export default authService;
