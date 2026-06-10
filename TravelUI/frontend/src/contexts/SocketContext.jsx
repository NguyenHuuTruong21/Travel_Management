/**
 * contexts/SocketContext.jsx
 * ===========================
 * Quản lý Socket.IO connection và chia sẻ instance cho toàn app.
 *
 * Tính năng:
 *  - Kết nối socket khi user đăng nhập (join room user:<userId>)
 *  - Disconnect khi logout / component unmount
 *  - Lắng nghe event 'notification' và 'notification:new'
 *  - Expose: socket, isConnected, notifications, unreadCount, addNotification, clearUnread
 */

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const socketRef = useRef(null);

  const [isConnected, setIsConnected]       = useState(false);
  const [notifications, setNotifications]   = useState([]); // thông báo realtime mới nhận
  const [unreadCount,   setUnreadCount]     = useState(0);

  // ─── Kết nối & join room khi user đăng nhập ───
  useEffect(() => {
    if (!user?.id) {
      // Nếu logout → disconnect
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Tạo socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('[Socket] ✅ Connected:', socket.id);
      setIsConnected(true);

      // Join room theo userId để nhận notification cá nhân
      socket.emit('join', { userId: user.id });
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] 🔌 Disconnected:', reason);
      setIsConnected(false);
    });

    // Lắng nghe cả 2 event name (tương thích với cả cũ và mới)
    const handleNotification = (data) => {
      console.log('[Socket] 🔔 notification:', data);
      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    socket.on('notification',     handleNotification); // event name hiện tại
    socket.on('notification:new', handleNotification); // event name yêu cầu mới

    return () => {
      socket.emit('leave', { userId: user.id });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id]);

  // Thêm thông báo (dùng để manual push từ component khác nếu cần)
  const addNotification = useCallback((notif) => {
    setNotifications(prev => [notif, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  // Reset unread counter (khi user mở notification dropdown)
  const clearUnread = useCallback(() => setUnreadCount(0), []);

  // Xóa notification khỏi list realtime
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id && n._id !== id));
  }, []);

  return (
    <SocketContext.Provider value={{
      socket:         socketRef.current,
      isConnected,
      notifications,        // realtime notifications từ socket
      unreadCount,
      addNotification,
      clearUnread,
      removeNotification,
      setUnreadCount        // cho phép NotificationBell đặt lại từ API response
    }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook tiện dụng
export const useSocket = () => useContext(SocketContext);
