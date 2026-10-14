import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

export const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative p-2 rounded-xl transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 ${
        isDark
          ? 'bg-[#0D1220] border-slate-800 text-[#93C5FD] hover:text-white hover:border-[#3B82F6]/40 hover:bg-[#111726] shadow-[0_0_12px_rgba(59,130,246,0.15)]'
          : 'bg-white border-slate-200 text-amber-500 hover:text-amber-600 hover:border-slate-300 hover:bg-slate-50 shadow-xs'
      } ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Moon className="w-4 h-4 transition-transform duration-300 transform rotate-0 hover:-rotate-12 text-[#93C5FD]" />
        ) : (
          <Sun className="w-4 h-4 transition-transform duration-300 transform rotate-0 hover:rotate-45 text-amber-500" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
