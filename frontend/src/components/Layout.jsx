import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNotifications } from '../contexts/NotificationContext.jsx';
import { formatDistanceToNow } from 'date-fns';
import { 
  LayoutDashboard, 
  Plus, 
  User, 
  LogOut, 
  Briefcase,
  Bell,
  Menu,
  X,
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const { notifications, removeNotification, clearNotifications } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Set sidebar closed by default on small screens, open on larger screens
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };
    
    // Initial check
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const notificationContainer = document.getElementById('notification-container');
      if (notificationContainer && !notificationContainer.contains(event.target) && 
          !event.target.closest('[data-notification-toggle]')) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get icon based on notification type
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-800 bg-opacity-50 z-10 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}
      
      {/* Sidebar */}
      <div 
        className={`w-64 bg-white shadow-lg border-r border-gray-200 fixed md:static inset-y-0 left-0 z-20 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Job Tracker</h1>
          </div>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            <Link
              to="/dashboard"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/jobs/new"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive('/jobs/new')
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
            >
              <Plus className="h-5 w-5" />
              <span>Add Job</span>
            </Link>
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-0">        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 ml-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Mobile Menu Button - Only visible on small screens */}
              <button 
                onClick={toggleSidebar}
                className="md:hidden p-2 rounded-md hover:bg-gray-100"
                aria-label="Toggle menu"
              >
                {sidebarOpen ? (
                  <X className="h-6 w-6 text-gray-600" />
                ) : (
                  <Menu className="h-6 w-6 text-gray-600" />
                )}
              </button>
              <h2 className="text-2xl font-bold text-gray-900">                {location.pathname === '/dashboard' && 'Dashboard'}
                {location.pathname === '/jobs/new' && 'Add New Job'}
                {location.pathname.includes('/jobs/') && location.pathname.includes('/edit') && 'Edit Job'}
                {location.pathname.includes('/jobs/') && !location.pathname.includes('/edit') && !location.pathname.includes('/new') && 'Job Details'}
              </h2>
            </div>
            <div className="flex items-center space-x-4">              <div className="relative" id="notification-container">                <button 
                  data-notification-toggle
                  onClick={toggleNotifications} 
                  className="relative p-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none border border-gray-200"
                  aria-label="Notifications"
                >
                  <Bell className={`h-6 w-6 ${notifications.length > 0 ? 'text-primary-600' : 'text-gray-500'} transition-colors`} />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 bg-red-500 text-white rounded-full text-xs font-bold animate-pulse">
                      {notifications.length}
                    </span>
                  )}
                </button>
                  {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-96 max-h-[70vh] overflow-y-auto bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-fadeIn">
                    <div className="sticky top-0 p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-primary-50 to-white">
                      <h3 className="font-semibold text-primary-700 flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notifications
                        {notifications.length > 0 && (
                          <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                            {notifications.length}
                          </span>
                        )}
                      </h3>
                      {notifications.length > 0 && (
                        <button 
                          onClick={clearNotifications}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    
                    <div className="divide-y divide-gray-100">                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 flex flex-col items-center gap-3">
                          <div className="p-3 bg-gray-50 rounded-full">
                            <Bell className="h-6 w-6 text-gray-400" />
                          </div>
                          <p>No notifications yet</p>
                          <p className="text-xs text-gray-400">Job updates will appear here</p>
                        </div>
                      ) : (
                        notifications.map(notification => {
                          const bgColorClass = notification.type === 'success' ? 'hover:bg-green-50' : 
                                           notification.type === 'error' ? 'hover:bg-red-50' :
                                           notification.type === 'warning' ? 'hover:bg-yellow-50' :
                                           'hover:bg-blue-50';
                          
                          return (
                            <div 
                              key={notification.id}
                              className={`p-4 hover:bg-opacity-50 transition-colors ${bgColorClass}`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                  {getIcon(notification.type)}
                                </div>
                                <div className="flex-grow">
                                  <p className="text-sm text-gray-800 font-medium">{notification.message}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                  </p>
                                </div>
                                <button 
                                  onClick={() => removeNotification(notification.id)}
                                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full"
                                  aria-label="Remove notification"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Notifications Dropdown */}
        {notificationsOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg overflow-hidden z-30" id="notification-container">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={clearNotifications}
                className="text-xs text-gray-500 hover:text-gray-700"
                title="Clear all notifications"
              >
                Clear All
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {notifications.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No new notifications
                </div>
              )}
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className="flex items-start p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="mr-3">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium">{notification.message}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
                    title="Remove notification"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
