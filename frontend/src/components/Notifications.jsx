import React from 'react';
import { useNotifications } from '../contexts/NotificationContext.jsx';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * Notifications component that displays all active notifications
 */
const Notifications = () => {
  const { notifications, removeNotification } = useNotifications();

  /**
   * Get the appropriate icon for notification type
   * @param {string} type - The notification type
   * @returns {JSX.Element} The icon component
   */
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  /**
   * Get background color based on notification type
   * @param {string} type - The notification type
   * @returns {string} CSS class for background color
   */
  const getBackgroundColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {notifications.map(notification => (
        <div 
          key={notification.id}
          className={`p-4 rounded-lg border shadow-lg animate-slide-in ${getBackgroundColor(notification.type)}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            <div className="flex-grow">
              <p className="text-gray-900 font-medium">{notification.message}</p>
            </div>
            <button 
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
