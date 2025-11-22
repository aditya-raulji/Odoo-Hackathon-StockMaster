import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/auth-context';
import { ROLES, ROLE_PERMISSIONS } from '@lib/constants';
import {
  Menu,
  X,
  LogOut,
  Settings,
  Bell,
  Search,
  ChevronDown,
  Home,
  Package,
  Truck,
  ArrowRightLeft,
  Zap,
  BarChart3,
  MapPin,
  Users,
  FileText,
  Clock,
  HelpCircle,
} from 'lucide-react';

const Layout = ({ children }) => {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const hasPermission = (permission) => {
    if (!user?.role) return false;
    return ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
  };

  const isActive = (path) => router.pathname === path || router.pathname.startsWith(path + '/');

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Home, permission: null },
    { label: 'Products', href: '/products/manage', icon: Package, permission: 'view_products' },
    { label: 'Receipts', href: '/receipts/manage', icon: Truck, permission: 'view_receipts' },
    { label: 'Deliveries', href: '/deliveries/manage', icon: Truck, permission: 'view_deliveries' },
    { label: 'Transfers', href: '/transfers/manage', icon: ArrowRightLeft, permission: 'view_transfers' },
    { label: 'Adjustments', href: '/adjustments', icon: Zap, permission: 'view_adjustments' },
    { label: 'Counts', href: '/counts', icon: BarChart3, permission: 'view_counts' },
    { label: 'Locations', href: '/locations/manage', icon: MapPin, permission: 'view_locations' },
    { label: 'Suppliers', href: '/suppliers/manage', icon: Users, permission: 'view_suppliers' },
    { label: 'Staff', href: '/staff/manage', icon: Users, permission: 'manage_staff' },
    { label: 'Reports', href: '/reports', icon: FileText, permission: 'view_reports' },
    { label: 'Audit Log', href: '/audit-log', icon: Clock, permission: 'view_audit_log' },
    { label: 'Help', href: '/help', icon: HelpCircle, permission: null },
  ];

  const visibleNavItems = navItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  // Check if current route requires permission that user doesn't have
  const currentRouteRequiresPermission = () => {
    const currentItem = navItems.find(item => 
      router.pathname === item.href || router.pathname.startsWith(item.href + '/')
    );
    if (currentItem && currentItem.permission) {
      return !hasPermission(currentItem.permission);
    }
    return false;
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-neutral-200 transition-all duration-300 flex flex-col shadow-sm`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-neutral-200">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            {sidebarOpen && <span className="font-bold text-lg text-neutral-900">Comet</span>}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-neutral-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-neutral-600 hover:bg-neutral-100"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search products, orders..."
                className="input pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 ml-6">
            {/* Notifications */}
            <button className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-neutral-900">{user?.name}</p>
                  <p className="text-xs text-neutral-500">{user?.role}</p>
                </div>
                <ChevronDown size={16} className="text-neutral-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-50">
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 first:rounded-t-lg"
                  >
                    <Settings size={16} className="inline mr-2" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/5 last:rounded-b-lg"
                  >
                    <LogOut size={16} className="inline mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {currentRouteRequiresPermission() ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🔒</span>
                  </div>
                  <h1 className="text-2xl font-bold text-neutral-900 mb-2">Access Denied</h1>
                  <p className="text-neutral-600 mb-6">
                    You don't have permission to access this page. Your current role doesn't have the required access level.
                  </p>
                  <Link
                    href="/dashboard"
                    className="btn btn-primary inline-block"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
