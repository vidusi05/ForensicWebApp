import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Files, 
  Database, 
  FileText, 
  Bell, 
  Settings,
  Search,
  UserCircle,
  LogOut,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Case Management', href: '/cases', icon: Files },
  { name: 'Evidence Storage', href: '/evidence', icon: Database },
  { name: 'Reporting', href: '/reports', icon: FileText },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="flex items-center gap-2 text-primary-600">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center font-bold text-lg">
              F
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">FourCells</span>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-500'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-200 space-y-1">
          {user?.role === 'System Administrator' && (
            <Link to="/audit" className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <ShieldAlert className="mr-3 h-5 w-5 text-slate-400" />
              Audit Logs
            </Link>
          )}
          <Link to="/settings" className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <Settings className="mr-3 h-5 w-5 text-slate-400" />
            Settings
          </Link>
          <button onClick={handleLogout} className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors mt-2">
            <LogOut className="mr-3 h-5 w-5 text-red-500" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
          <div className="flex-1 flex items-center">
            <div className="max-w-md w-full relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                placeholder="Search cases, reports, or patients..."
              />
            </div>
          </div>
          
          <div className="ml-4 flex items-center md:ml-6 gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-500 rounded-full hover:bg-slate-100 relative transition-colors">
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              <Bell className="h-6 w-6" />
            </button>
            
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-700 leading-none">{user?.name || 'User'}</p>
                <p className="text-xs text-slate-500 mt-1">{user?.role || 'Guest'}</p>
              </div>
              <UserCircle className="h-8 w-8 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-slate-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
