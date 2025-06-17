import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';

// Create the context
const NotificationContext = createContext(undefined);

/**
 * Custom hook to use the notification context
 * @returns {Object} Notification context value
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

/**
 * Provider component for the notification context
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  // Load notifications from local storage on mount
  useEffect(() => {
    try {
      const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      if (storedNotifications.length > 0) {
        setNotifications(storedNotifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, []);

  // Connect to socket when user is authenticated
  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      newSocket.on('notification', (data) => {
        addNotification(data.message, data.type);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);  /**
   * Add a new notification
   * @param {string} message - The notification message
   * @param {string} type - The notification type (info, success, warning, error)
   */
  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date(),
    };

    // Add notification to the beginning of the array
    setNotifications(prev => [notification, ...prev]);
    
    // Store notifications in local storage to persist between sessions
    try {
      const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      localStorage.setItem('notifications', JSON.stringify([notification, ...storedNotifications].slice(0, 50)));
    } catch (error) {
      console.error('Error storing notifications:', error);
    }
  };
  /**
   * Remove a notification by ID
   * @param {string} id - The notification ID
   */
  const removeNotification = (id) => {
    setNotifications(prev => {
      const updatedNotifications = prev.filter(notification => notification.id !== id);
      // Update local storage
      try {
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      } catch (error) {
        console.error('Error updating notifications in storage:', error);
      }
      return updatedNotifications;
    });
  };

  /**
   * Clear all notifications
   */
  const clearNotifications = () => {
    setNotifications([]);
    // Clear notifications in local storage
    try {
      localStorage.setItem('notifications', JSON.stringify([]));
    } catch (error) {
      console.error('Error clearing notifications in storage:', error);
    }
  };

  // Context value
  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
