import React, { useContext } from 'react';
import { FiMenu, FiSun, FiMoon, FiSearch } from 'react-icons/fi';
import ThemeContext from '../context/ThemeContext';
import AuthContext from '../context/AuthContext';

const Navbar = ({ setIsSidebarOpen, title, searchQuery, setSearchQuery }) => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/85 backdrop-blur-md px-6 dark:border-slate-800 dark:bg-dark-900/85">
      <div className="flex items-center space-x-4">
        {/* Hamburger Menu Toggle (Mobile only) */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/60 lg:hidden"
        >
          <FiMenu className="h-5 w-5" />
        </button>

        {/* Dynamic Page Title */}
        <h1 className="hidden sm:block text-lg font-bold text-slate-800 dark:text-slate-100">
          {title || 'Dashboard'}
        </h1>
      </div>

      {/* Center Search Bar - Only shows if search function is passed */}
      {setSearchQuery !== undefined && (
        <div className="relative mx-4 w-full max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <FiSearch className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:bg-dark-900"
          />
        </div>
      )}

      {/* Right Side Actions */}
      <div className="flex items-center space-x-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/60 transition-all duration-200"
          aria-label="Toggle Theme"
        >
          {darkMode ? (
            <FiSun className="h-5 w-5 text-amber-500" />
          ) : (
            <FiMoon className="h-5 w-5 text-indigo-600" />
          )}
        </button>

        {/* User Greeting (Desktop) */}
        <div className="hidden md:flex flex-col text-right">
          <span className="text-xs text-slate-400 dark:text-slate-500">Welcome,</span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {user?.name || 'User'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
