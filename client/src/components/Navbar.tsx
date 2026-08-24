import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Layers, LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react';
import { HealthBadge } from './HealthBadge.js';
import { useAuth } from '../context/AuthContext.js';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Briefcase className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-brand-400 transition-colors">
                WorkPulse
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                Marketplace
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium -mt-1 hidden sm:block">
              Talent & Project Manager
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-brand-400" />
            Overview
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-4 h-4 text-brand-400" />
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right Section: Health Badge & Auth Controls */}
        <div className="flex items-center gap-3.5">
          <HealthBadge />

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-all"
              >
                <div className="w-6 h-6 rounded-lg bg-brand-400 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                  {user.firstName[0]}
                </div>
                <span className="font-semibold hidden sm:inline">{user.firstName}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-brand-400 uppercase font-mono">
                  {user.role}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-brand-400 hover:bg-brand-300 rounded-xl transition-all shadow-md shadow-brand-500/10 active:scale-95"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
