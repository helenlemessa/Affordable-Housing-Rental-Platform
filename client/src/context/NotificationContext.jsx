// src/context/NotificationContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from '../api/axios';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children, currentUser }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  const fetchNotifications = async () => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const res = await axios.get('/notifications');
      console.log('📋 Fetched notifications:', res.data);
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.read).length);
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  };

  // Remove the old WebSocket setup since NotificationBell handles it now
  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [currentUser]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};