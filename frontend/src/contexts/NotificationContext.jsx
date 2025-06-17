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
  }, [user]);

  /**
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

    setNotifications(prev => [notification, ...prev]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
  };

  /**
   * Remove a notification by ID
   * @param {string} id - The notification ID
   */
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  /**
   * Clear all notifications
   */
  const clearNotifications = () => {
    setNotifications([]);
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
