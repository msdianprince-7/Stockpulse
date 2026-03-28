'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { SearchBar } from '@/components';
import { Star, BarChart3, LogOut, User, Bell, Newspaper, Sun, Moon } from 'lucide-react';

const navLinkClass =
  'flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-white/5';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14 gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
              <BarChart3 size={15} className="text-white" />
            </div>
            <span className="text-[15px] font-bold text-gray-900 dark:text-white hidden lg:block tracking-tight">
              StockPulse
            </span>
          </Link>

          {/* Search */}
          <div className="w-56 lg:w-72 shrink-0">
            <SearchBar />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Nav Links */}
          <div className="flex items-center gap-0.5">
            <Link href="/news" className={navLinkClass}>
              <Newspaper size={15} className="text-pink-500" />
              <span className="hidden sm:inline">News</span>
            </Link>

            {user ? (
              <>
                <Link href="/watchlist" className={navLinkClass}>
                  <Star size={15} />
                  <span className="hidden sm:inline">Watchlist</span>
                </Link>
                <Link href="/portfolio" className={navLinkClass}>
                  <BarChart3 size={15} />
                  <span className="hidden sm:inline">Portfolio</span>
                </Link>
                <Link href="/alerts" className={navLinkClass}>
                  <Bell size={15} className="text-indigo-500" />
                  <span className="hidden sm:inline">Alerts</span>
                </Link>
              </>
            ) : null}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {user ? (
              <div className="ml-1 pl-2 border-l border-gray-200 dark:border-gray-700/50 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-white/5"
                  title="Logout"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <Link
                href="/auth"
                className="ml-1 flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
              >
                <User size={14} />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
