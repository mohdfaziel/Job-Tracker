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
      // Use the correct URL based on environment
      const socketUrl = import.meta.env.VITE_API_URL 
        ? new URL(import.meta.env.VITE_API_URL).origin 
        : 'http://localhost:5000';
      
      console.log(`Connecting to socket at: ${socketUrl}`);
      
      const newSocket = io(socketUrl, {
        auth: {
          token: localStorage.getItem('token'),
          userId: user.id // Send user ID for proper room assignment
        }
      });      newSocket.on('notification', (data) => {
        console.log('Received notification:', data);
        addNotification(data.message, data.type);
      });
      
      newSocket.on('connect', () => {
        console.log('Socket connected with ID:', newSocket.id);
        addNotification(`Connected successfully. Notifications will now sync across all your devices.`, 'success');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        addNotification(`Connection error: ${error.message}. Real-time updates may be unavailable.`, 'error');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);
  
  // Keep socket connection alive with a ping every minute
  useEffect(() => {
    if (socket) {
      const pingInterval = setInterval(() => {
        if (socket.connected) {
          console.log('Sending ping to keep socket connection alive');
          socket.emit('ping');
        }
      }, 60000); // 1 minute

      return () => clearInterval(pingInterval);
    }
  }, [socket]);

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
