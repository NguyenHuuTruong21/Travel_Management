/**
 * components/user/NotificationDropdown.jsx
 * ==========================================
 * Bell icon + Dropdown thông báo với:
 *  - Badge số chưa đọc (realtime từ SocketContext)
 *  - Dropdown danh sách thông báo
 *  - Lắng nghe socket event → cộng dồn unread tự động
 *  - Mark as read / Mark all as read
 *  - Toast khi nhận thông báo mới
 */

import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBell, FiCheck, FiInfo, FiAlertCircle, FiCheckCircle,
  FiClock, FiLoader, FiX
} from 'react-icons/fi';
import { getNotifications, markNotificationRead, markManyRead } from '../../services/itineraryService';
import { SocketContext } from '../../contexts/SocketContext';

// ─── Toast nhỏ khi có thông báo realtime ───
const RealtimeToast = ({ notif, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 p-4 max-w-sm flex gap-3 items-start">
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <FiBell size={18} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{notif.title}</p>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
          <FiX size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── Icon theo loại thông báo ───
const getNotifIcon = (type) => {
  switch (type) {
    case 'reminder': return <FiClock      className="text-orange-500" size={15} />;
    case 'booking':  return <FiCheckCircle className="text-emerald-500" size={15} />;
    case 'promo':    return <FiInfo        className="text-purple-500" size={15} />;
    case 'security': return <FiAlertCircle className="text-red-500"    size={15} />;
    default:         return <FiInfo        className="text-blue-500"   size={15} />;
  }
};

const NotificationDropdown = () => {
  const socketCtx = useContext(SocketContext);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [isOpen,        setIsOpen]        = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [toast,         setToast]         = useState(null); // { title, message }
  const dropdownRef = useRef(null);

  // ─── Fetch từ API ───
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      setLoading(true);
      const data = await getNotifications({ limit: 8 });
      setNotifications(data.data || []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch (err) {
      console.error('[NotificationDropdown] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch lần đầu + polling 60s
  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // ─── Lắng nghe Socket.IO realtime ───
  useEffect(() => {
    if (!socketCtx) return;
    const { notifications: realtimeNotifs } = socketCtx;
    // Khi có notification mới qua socket, thêm vào đầu danh sách
    if (realtimeNotifs && realtimeNotifs.length > 0) {
      const latest = realtimeNotifs[0];
      // Tránh trùng lặp
      setNotifications(prev => {
        const exists = prev.some(n => n._id === latest.id || n._id === latest._id);
        if (exists) return prev;
        // Hiện toast
        setToast({ title: latest.title, message: latest.message });
        setUnreadCount(c => c + 1);
        return [{ ...latest, _id: latest.id || latest._id }, ...prev];
      });
    }
  }, [socketCtx?.notifications]);

  // ─── Click outside để đóng ───
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ─── Mark single as read ───
  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch (err) {
      console.error('[NotificationDropdown] markRead error:', err);
    }
  };

  // ─── Mark all as read ───
  const handleMarkAllRead = async () => {
    try {
      const ids = notifications.filter(n => !n.isRead).map(n => n._id);
      if (!ids.length) return;
      await markManyRead(ids);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('[NotificationDropdown] markAllRead error:', err);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(v => !v);
    if (!isOpen) fetchNotifications();
  };

  // Số hiển thị trên badge (max 99+)
  const badgeCount = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <>
      {/* Toast realtime */}
      {toast && (
        <RealtimeToast notif={toast} onClose={() => setToast(null)} />
      )}

      <div className="relative" ref={dropdownRef}>
        {/* Bell button */}
        <button
          id="notification-bell-btn"
          onClick={toggleDropdown}
          className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-label="Thông báo"
        >
          <FiBell size={22} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
              {badgeCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute right-0 mt-3 w-[340px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">

            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-2">
                <FiBell size={16} className="text-blue-600" />
                <h3 className="font-bold text-gray-800 text-sm">Thông báo</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {badgeCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                >
                  <FiCheck size={12} /> Đọc tất cả
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <FiLoader size={24} className="animate-spin text-blue-400" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-4xl mb-3">🔔</div>
                  <p className="text-gray-500 text-sm">Không có thông báo nào</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => !n.isRead && handleMarkRead(n._id)}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors flex gap-3 ${!n.isRead ? 'bg-blue-50/60' : ''}`}
                  >
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${!n.isRead ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      {getNotifIcon(n.type)}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug truncate ${!n.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {new Date(n.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    {/* Unread dot */}
                    {!n.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <Link
                to="/my-itinerary"
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                onClick={() => setIsOpen(false)}
              >
                🗺️ Lịch trình của tôi
              </Link>
              <Link
                to="/profile"
                className="text-xs text-gray-500 hover:text-gray-700"
                onClick={() => setIsOpen(false)}
              >
                Xem tất cả →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* CSS cho animation toast */}
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </>
  );
};

export default NotificationDropdown;
