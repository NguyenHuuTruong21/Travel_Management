/**
 * services/itineraryService.js
 * =============================
 * Tất cả API calls liên quan đến:
 *  - Lịch trình cá nhân (My Itinerary)
 *  - Thông báo (Notifications)
 */

import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`
});

// Tự động gắn Bearer token vào mỗi request
API.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─────────────────────────────────────────
//  ITINERARY
// ─────────────────────────────────────────

/**
 * Lấy danh sách lịch trình cá nhân
 * @param {Object} params - { filter: 'all'|'upcoming'|'completed', page, limit }
 */
export const getMyItinerary = async (params = {}) => {
  const { filter = 'all', page = 1, limit = 10 } = params;
  const res = await API.get('/bookings/my-itinerary', {
    params: { filter, page, limit }
  });
  return res.data;
};

// ─────────────────────────────────────────
//  NOTIFICATIONS
// ─────────────────────────────────────────

/**
 * Lấy danh sách thông báo
 * @param {Object} params - { page, limit, type }
 */
export const getNotifications = async (params = {}) => {
  const { page = 1, limit = 20, type } = params;
  const res = await API.get('/notifications', {
    params: { page, limit, ...(type ? { type } : {}) }
  });
  return res.data;
};

/**
 * Lấy số thông báo chưa đọc
 */
export const getUnreadCount = async () => {
  const res = await API.get('/notifications/unread-count');
  return res.data; // { unreadCount: number }
};

/**
 * Đánh dấu một thông báo là đã đọc
 * @param {string} id - Notification ID
 */
export const markNotificationRead = async (id) => {
  const res = await API.put(`/notifications/${id}/read`);
  return res.data;
};

/**
 * Đánh dấu nhiều thông báo đã đọc
 * @param {string[]} ids - Mảng Notification IDs
 */
export const markManyRead = async (ids) => {
  const res = await API.patch('/notifications/mark-many-read', { ids });
  return res.data;
};
