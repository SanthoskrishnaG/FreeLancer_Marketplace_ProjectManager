import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import {
  Sparkles,
  Bell,
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard,
  Briefcase,
  Users,
  ChevronDown,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isClient, isFreelancer, isAdmin } = useAuth();
  const { latestNotification } = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    if (isClient) return '/client/dashboard';
    if (isFreelancer) return '/freelancer/dashboard';
    return '/';
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-card border-b border-gray-800/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                WorkPulse <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono">AI</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
            <Link to="/projects" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-gray-400" />
              Find Work
            </Link>
            <Link to="/freelancers" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Users className="w-4 h-4 text-gray-400" />
              Find Talent
            </Link>
            {isAuthenticated && (
              <Link to={getDashboardLink()} className="hover:text-white transition-colors flex items-center gap-1.5 text-indigo-400">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}
          </div>

          {/* User / Auth Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => navigate(isClient ? '/client/dashboard' : '/freelancer/dashboard')}
                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                    {latestNotification && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-[#0B0F19] animate-ping" />
                    )}
                  </button>
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-gray-800/60 border border-transparent hover:border-gray-700/60 transition-all"
                  >
                    <img
                      src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'user'}`}
                      alt={user?.name}
                      className="w-8 h-8 rounded-lg object-cover ring-1 ring-gray-700"
                    />
                    <div className="text-left">
                      <div className="text-xs font-semibold text-white leading-tight">{user?.name}</div>
                      <Badge variant={user?.role} className="text-[10px] py-0 px-1.5 mt-0.5" />
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 glass-card rounded-xl border border-gray-800 shadow-2xl py-2 z-50 animate-scaleUp"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-gray-800">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
                      </div>
                      <Link
                        to={getDashboardLink()}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/60"
                      >
                        <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                        Dashboard
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card border-b border-gray-800 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/projects"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-gray-300 hover:text-white"
          >
            Find Work
          </Link>
          <Link
            to="/freelancers"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-gray-300 hover:text-white"
          >
            Find Talent
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-indigo-400 font-semibold"
              >
                Go to Dashboard ({user?.role})
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="block w-full text-left py-2 text-rose-400"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-xl bg-gray-800 text-white font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/30"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
