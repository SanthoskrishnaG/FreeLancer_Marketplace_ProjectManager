import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [latestNotification, setLatestNotification] = useState(null);
  const [latestMessage, setLatestMessage] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    // Resolve socket server URL: fallback to window.location.origin for local dev proxy
    const rawSocketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    const socketUrl = typeof rawSocketUrl === 'string' ? rawSocketUrl.trim().replace(/\/+$/, '') : window.location.origin;

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('⚡ Connected to WorkPulse WebSocket cluster');
    });

    newSocket.on('user_online', ({ userId }) => {
      setOnlineUserIds((prev) => new Set([...prev, userId]));
    });

    newSocket.on('user_offline', ({ userId }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    newSocket.on('notification', (notification) => {
      setLatestNotification(notification);
    });

    newSocket.on('chat_notification', ({ message }) => {
      setLatestMessage(message);
    });

    newSocket.on('connect_error', (err) => {
      console.warn('⚠️ WorkPulse WebSocket connection attempt warning:', err.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  const isUserOnline = (userId) => onlineUserIds.has(userId);

  const value = {
    socket,
    onlineUserIds,
    isUserOnline,
    latestNotification,
    latestMessage,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
