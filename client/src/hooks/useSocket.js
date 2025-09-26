import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';
import { toast } from 'react-toastify';

export const useSocket = () => {
  const { user, token } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (user && token) {
      initializeSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [user, token]);

  const initializeSocket = () => {
    const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    
    socketRef.current = io(serverUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      
      // Join community room automatically
      socket.emit('join_community', {
        roomType: 'community',
        roomId: 'general'
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    // User presence events
    socket.on('user_online', (data) => {
      setOnlineUsers(prev => {
        const existing = prev.find(u => u.userId === data.userId);
        if (existing) return prev;
        return [...prev, data];
      });
      
      toast.info(`${data.userName} joined the community`, {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: true
      });
    });

    socket.on('user_offline', (data) => {
      setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    // Community events
    socket.on('new_post', (data) => {
      toast.success(`New post by ${data.post.author.name}: ${data.post.title}`, {
        position: 'top-right',
        autoClose: 5000,
        onClick: () => {
          // Navigate to post or refresh posts
          window.dispatchEvent(new CustomEvent('new-community-post', { detail: data.post }));
        }
      });
    });

    socket.on('post_updated', (data) => {
      // Emit custom event for components to listen
      window.dispatchEvent(new CustomEvent('post-updated', { detail: data }));
    });

    socket.on('post_liked', (data) => {
      window.dispatchEvent(new CustomEvent('post-liked', { detail: data }));
    });

    socket.on('new_comment', (data) => {
      window.dispatchEvent(new CustomEvent('new-comment', { detail: data }));
    });

    // Typing indicators
    socket.on('user_typing', (data) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(u => u.userId !== data.userId);
        if (data.isTyping) {
          return [...filtered, data];
        }
        return filtered;
      });
    });

    // Notifications
    socket.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      
      toast.info(notification.message, {
        position: 'top-right',
        autoClose: 5000
      });
    });

    // Study group events
    socket.on('group_updated', (data) => {
      const { groupId, updateType } = data;
      
      switch (updateType) {
        case 'member_joined':
          toast.info(`Someone joined your study group!`);
          break;
        case 'member_left':
          toast.info(`Someone left your study group`);
          break;
        case 'discussion_added':
          toast.info(`New discussion in your study group`);
          break;
      }
      
      window.dispatchEvent(new CustomEvent('group-updated', { detail: data }));
    });

    // Real-time reactions
    socket.on('post_reaction', (data) => {
      // Show quick reaction animation or toast
      window.dispatchEvent(new CustomEvent('post-reaction', { detail: data }));
    });
  };

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setOnlineUsers([]);
      setTypingUsers([]);
    }
  };

  // Methods for components to use
  const joinRoom = (roomType, roomId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join_community', { roomType, roomId });
    }
  };

  const leaveRoom = (roomType, roomId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave_community', { roomType, roomId });
    }
  };

  const startTyping = (roomType, roomId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing_start', { roomType, roomId });
    }
  };

  const stopTyping = (roomType, roomId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing_stop', { roomType, roomId });
    }
  };

  const sendReaction = (postId, reaction, roomType, roomId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('quick_reaction', {
        postId,
        reaction,
        roomType,
        roomId
      });
    }
  };

  const sendNotification = (targetUserId, type, message, metadata = {}) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send_notification', {
        targetUserId,
        type,
        message,
        metadata
      });
    }
  };

  const markNotificationRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    notifications,
    typingUsers,
    joinRoom,
    leaveRoom,
    startTyping,
    stopTyping,
    sendReaction,
    sendNotification,
    markNotificationRead,
    clearNotifications
  };
};

export default useSocket;
