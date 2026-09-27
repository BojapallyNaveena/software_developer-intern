import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { fetchChatHistory, sendRestMessage, loginUser as apiLoginUser } from '../services/api';

const SocketContext = createContext();

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('chat_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState(null);

  const typingTimeoutRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(BACKEND_URL, {
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to Socket.io server with ID:', newSocket.id);
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket.io server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setIsConnected(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch initial chat history via REST API
  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await fetchChatHistory();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load chat history.');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Handle socket events when connected and user is logged in
  useEffect(() => {
    if (!socket || !user) return;

    // Join room / register socket user
    socket.emit('user:join', { username: user.username, userId: user.id });

    // Handle real-time incoming messages
    const handleNewMessage = (msg) => {
      setMessages((prev) => {
        // Prevent duplicate messages
        if (prev.some((m) => m.id === msg.id)) {
          return prev;
        }
        return [...prev, msg];
      });

      // Automatically mark received messages as read if sent by someone else
      if (msg.sender !== user.username) {
        socket.emit('message:read', { messageIds: [msg.id], username: user.username });
      }
    };

    // Handle user list updates
    const handleUsersUpdate = (usersList) => {
      setOnlineUsers(usersList);
    };

    // Handle typing status updates
    const handleTypingStatus = ({ username, isTyping }) => {
      setTypingUsers((prev) => {
        const copy = { ...prev };
        if (isTyping) {
          copy[username] = true;
        } else {
          delete copy[username];
        }
        return copy;
      });
    };

    // Handle message status updates (e.g. status='read')
    const handleStatusUpdate = ({ messageIds, status }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          messageIds.includes(msg.id) ? { ...msg, status } : msg
        )
      );
    };

    socket.on('message:received', handleNewMessage);
    socket.on('users:update', handleUsersUpdate);
    socket.on('typing:status', handleTypingStatus);
    socket.on('message:status_update', handleStatusUpdate);

    return () => {
      socket.off('message:received', handleNewMessage);
      socket.off('users:update', handleUsersUpdate);
      socket.off('typing:status', handleTypingStatus);
      socket.off('message:status_update', handleStatusUpdate);
    };
  }, [socket, user]);

  // User login action
  const login = async (username) => {
    if (!username || !username.trim()) {
      return { success: false, error: 'Username is required' };
    }
    const cleanName = username.trim();
    try {
      const data = await apiLoginUser(cleanName);
      if (data && data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('chat_user', JSON.stringify(data.user));
        return { success: true };
      }
      throw new Error(data?.error || 'Login failed');
    } catch (err) {
      console.warn('Backend login endpoint unavailable, creating session locally:', err);
      const fallbackUser = {
        id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        username: cleanName,
        is_online: 1,
        last_seen: new Date().toISOString()
      };
      setUser(fallbackUser);
      localStorage.setItem('chat_user', JSON.stringify(fallbackUser));
      return { success: true };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('chat_user');
  };

  // Send message function (Supports Socket.io with REST fallback)
  const sendMessage = async (text, useRest = false) => {
    if (!user || !text.trim()) return;

    const messageData = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      sender: user.username,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    // Trigger typing stop immediately
    stopTyping();

    if (useRest || !isConnected || !socket) {
      // Send via REST API
      try {
        const res = await sendRestMessage(messageData);
        if (res.success && res.message) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === res.message.id)) return prev;
            return [...prev, res.message];
          });
        }
      } catch (err) {
        console.error('Failed to send via REST API:', err);
        throw err;
      }
    } else {
      // Send via Socket.io
      socket.emit('message:send', messageData, (ack) => {
        if (ack && ack.error) {
          console.error('Socket send acknowledgment error:', ack.error);
        }
      });
    }
  };

  // Typing event triggers
  const startTyping = () => {
    if (!socket || !user || !isConnected) return;
    socket.emit('typing:start', { username: user.username });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const stopTyping = () => {
    if (!socket || !user || !isConnected) return;
    socket.emit('typing:stop', { username: user.username });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const activeTypingNames = Object.keys(typingUsers).filter(
    (name) => name !== user?.username
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        user,
        login,
        logout,
        messages,
        onlineUsers,
        typingUsers: activeTypingNames,
        sendMessage,
        startTyping,
        stopTyping,
        loadHistory,
        loadingHistory,
        error
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
