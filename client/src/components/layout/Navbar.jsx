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

  const displayName = user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'My Account');

  return (
    <nav className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-600/20 text-white group-hover:scale-105 transition-all">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">
              WorkPulse<span className="text-indigo-600">.ai</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/projects" className="hover:text-slate-900 transition-colors flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-slate-400" />
              Find Work
            </Link>
            <Link to="/freelancers" className="hover:text-slate-900 transition-colors flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              Find Talent
            </Link>
            {isAuthenticated && (
              <Link to={getDashboardLink()} className="hover:text-indigo-600 font-semibold transition-colors flex items-center gap-1.5 text-indigo-600">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}
          </div>

          {/* User / Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => navigate(isClient ? '/client/notifications' : isFreelancer ? '/freelancer/notifications' : '/client/notifications')}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {latestNotification && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white animate-ping" />
                    )}
                  </button>
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">{displayName}</div>
                      <Badge variant={user?.role} className="text-[10px] py-0 px-1.5 mt-0.5" />
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-50 animate-fadeIn"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Signed in as</p>
                        <p className="text-xs font-semibold text-slate-800 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to={getDashboardLink()}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                        Dashboard
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
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
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/projects"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-indigo-600"
          >
            Find Work
          </Link>
          <Link
            to="/freelancers"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-indigo-600"
          >
            Find Talent
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm text-indigo-600 font-semibold"
              >
                Go to Dashboard ({user?.role})
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="block w-full text-left py-2 text-sm text-rose-600 font-medium"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-sm"
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

export default Navbar;
