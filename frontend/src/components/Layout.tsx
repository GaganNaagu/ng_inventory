import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, Tags, LogOut, Sun, Moon } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/categories', label: 'Categories', icon: Tags },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-gray-900 flex transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex flex-col border-r border-orange-100 dark:border-gray-700 transition-colors duration-300">
        <div className="p-4 border-b border-orange-100 dark:border-gray-700 flex flex-col items-center">
          {dark ? (
            <img src="/dark-transparent.png" alt="NG Inventory" className="h-20 w-auto object-contain" />
          ) : (
            <img src="/light-transparent.png" alt="NG Inventory" className="h-20 w-auto object-contain" />
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{user?.role}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'}`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-orange-100 dark:border-gray-700 space-y-3">
          <button
            onClick={() => setDark(!dark)}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors w-full"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors w-full">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
