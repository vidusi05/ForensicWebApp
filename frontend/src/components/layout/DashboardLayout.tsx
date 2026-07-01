import { useState } from 'react';
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
  ShieldAlert,
  UsersRound,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Case Management', href: '/cases', icon: Files },
  { name: 'Evidence Storage', href: '/evidence', icon: Database },
  { name: 'Reporting', href: '/reports', icon: FileText },
];

export default function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user?.role === 'System Administrator'
    ? [
        ...navigation,
        { name: 'User Administration', href: '/admin/users', icon: UsersRound },
        { name: 'Audit Logs', href: '/audit', icon: ShieldAlert },
      ]
    : navigation;

  const renderNavLink = (item: typeof navItems[number], compact = sidebarCollapsed) => {
    const isActive = location.pathname.startsWith(item.href);
    return (
      <Link
        key={item.name}
        to={item.href}
        onClick={() => setMobileMenuOpen(false)}
        title={compact ? item.name : undefined}
        className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
          compact ? 'justify-center' : ''
        } ${
          isActive
            ? 'bg-primary-50 text-primary-700'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <item.icon
          className={`${compact ? '' : 'mr-3'} h-5 w-5 flex-shrink-0 ${
            isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-500'
          }`}
          aria-hidden="true"
        />
        {!compact && item.name}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 flex-col hidden lg:flex fixed inset-y-0 left-0 z-30 transition-all duration-200`}>
        <div className={`${sidebarCollapsed ? 'justify-center px-3' : 'px-6'} h-16 flex items-center border-b border-slate-200`}>
          <div className="flex items-center gap-2 text-primary-600">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center font-bold text-lg">
              F
            </div>
            {!sidebarCollapsed && <span className="font-bold text-xl tracking-tight text-slate-800">FourCells</span>}
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => renderNavLink(item))}
        </nav>
        
        <div className="p-4 border-t border-slate-200 space-y-1">
          {sidebarCollapsed && (
            <button
              type="button"
              onClick={() => setSidebarCollapsed(false)}
              className="mb-2 flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              aria-label="Expand navigation"
              title="Expand navigation"
            >
              <Menu className="h-5 w-5 text-slate-400" />
            </button>
          )}
          <Link
            to="/settings"
            title={sidebarCollapsed ? 'Settings' : undefined}
            className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <Settings className={`${sidebarCollapsed ? '' : 'mr-3'} h-5 w-5 text-slate-400`} />
            {!sidebarCollapsed && 'Settings'}
          </Link>
          <button
            onClick={handleLogout}
            title={sidebarCollapsed ? 'Logout' : undefined}
            className={`mt-2 flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut className={`${sidebarCollapsed ? '' : 'mr-3'} h-5 w-5 text-red-500`} />
            {!sidebarCollapsed && 'Logout'}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[min(20rem,85vw)] bg-white shadow-xl flex flex-col">
            <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200">
              <div className="flex items-center gap-2 text-primary-600">
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center font-bold text-lg">F</div>
                <span className="font-bold text-xl tracking-tight text-slate-800">FourCells</span>
              </div>
              <button type="button" onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {navItems.map((item) => renderNavLink(item, false))}
            </nav>
            <div className="p-4 border-t border-slate-200">
              <button onClick={handleLogout} className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                <LogOut className="mr-3 h-5 w-5 text-red-500" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className={`${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'} flex-1 flex flex-col min-w-0 transition-all duration-200`}>
        {/* Header */}
        <header className="sticky top-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-20">
          <div className="flex-1 flex items-center gap-3 min-w-0">
            <button type="button" onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100">
              <Menu className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setSidebarCollapsed((value) => !value)}
              className="hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:inline-flex"
              aria-label={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
              title={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="max-w-md w-full relative hidden sm:block">
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
          
          <div className="ml-3 flex items-center gap-2 sm:gap-4">
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
        <main className="flex-1 relative focus:outline-none bg-slate-50 p-4 sm:p-6 pb-24 lg:pb-6">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
          <div className={`grid ${navItems.length > 4 ? 'grid-cols-5' : 'grid-cols-4'}`}>
            {navItems.slice(0, 5).map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium ${
                    isActive ? 'text-primary-700' : 'text-slate-500'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="truncate">{item.name.split(' ')[0]}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
