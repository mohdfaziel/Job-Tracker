import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { 
  LayoutDashboard, 
  Plus, 
  User, 
  LogOut, 
  Briefcase,
  Bell,
  Menu,
  X
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
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

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Mobile Menu Button - Only visible on small screens */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-20 p-2 rounded-md bg-white shadow-md"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? (
          <X className="h-6 w-6 text-gray-600" />
        ) : (
          <Menu className="h-6 w-6 text-gray-600" />
        )}
      </button>
      
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
      <div className="flex-1 flex flex-col md:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 ml-0 md:ml-64">
          <div className="flex items-center justify-between">
            <div className="ml-8 md:ml-0">
              <h2 className="text-2xl font-bold text-gray-900">
                {location.pathname === '/dashboard' && 'Dashboard'}
                {location.pathname === '/jobs/new' && 'Add New Job'}
                {location.pathname.includes('/jobs/') && location.pathname.includes('/edit') && 'Edit Job'}
                {location.pathname.includes('/jobs/') && !location.pathname.includes('/edit') && !location.pathname.includes('/new') && 'Job Details'}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-400 hover:text-gray-600 cursor-pointer" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
