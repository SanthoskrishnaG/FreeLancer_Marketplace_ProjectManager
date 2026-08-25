import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext.js';
import { Message } from '../types/index.js';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  typingUsers: { [conversationId: string]: string[] };
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendRealtimeMessage: (conversationId: string, content: string, fileIds?: string[]) => void;
  sendTyping: (conversationId: string, isTyping: boolean) => void;
  markConversationRead: (conversationId: string) => void;
  onMessageReceived?: (message: Message) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<{ [conversationId: string]: string[] }>({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5000';

    const socketInstance = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('user_online', ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => Array.from(new Set([...prev, userId])));
    });

    socketInstance.on('user_offline', ({ userId }: { userId: string }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    socketInstance.on(
      'typing_start',
      ({ conversationId, userId }: { conversationId: string; userId: string }) => {
        setTypingUsers((prev) => ({
          ...prev,
          [conversationId]: Array.from(new Set([...(prev[conversationId] || []), userId])),
        }));
      }
    );

    socketInstance.on(
      'typing_stop',
      ({ conversationId, userId }: { conversationId: string; userId: string }) => {
        setTypingUsers((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] || []).filter((id) => id !== userId),
        }));
      }
    );

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated]);

  const joinConversation = (conversationId: string) => {
    socket?.emit('join_conversation', conversationId);
  };

  const leaveConversation = (conversationId: string) => {
    socket?.emit('leave_conversation', conversationId);
  };

  const sendRealtimeMessage = (conversationId: string, content: string, fileIds?: string[]) => {
    socket?.emit('send_message', { conversationId, content, fileIds });
  };

  const sendTyping = (conversationId: string, isTyping: boolean) => {
    if (isTyping) {
      socket?.emit('typing_start', { conversationId });
    } else {
      socket?.emit('typing_stop', { conversationId });
    }
  };

  const markConversationRead = (conversationId: string) => {
    socket?.emit('mark_read', { conversationId });
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        typingUsers,
        joinConversation,
        leaveConversation,
        sendRealtimeMessage,
        sendTyping,
        markConversationRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
