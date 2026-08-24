import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Briefcase, LogOut, Sparkles, Plus, Compass, Users } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isClient = user?.role === 'CLIENT' || user?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/75 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-emerald-400 p-0.5 shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                WorkPulse
              </span>
              <span className="text-[10px] font-semibold text-brand-400 -mt-1 tracking-widest uppercase">
                Enterprise AI
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/projects"
              className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-brand-400" /> Browse Projects
            </Link>

            <Link
              to="/freelancers"
              className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" /> Find Talent
            </Link>

            {isAuthenticated && isClient && (
              <Link
                to="/my-projects"
                className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <Briefcase className="w-3.5 h-3.5 text-purple-400" /> My Projects
              </Link>
            )}
          </nav>

          {/* Right Action / Auth Profile */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {isClient && (
                  <Link
                    to="/projects/create"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-brand-400 hover:bg-brand-300 transition-all shadow-sm active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" /> Post Project
                  </Link>
                )}

                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <Link
                    to="/settings/profile"
                    className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-900 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center shadow-sm">
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.firstName}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        `${user?.firstName[0] || 'U'}`
                      )}
                    </div>
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-xs font-bold text-white leading-none">
                        {user?.firstName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{user?.role}</span>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-brand-400 hover:bg-brand-300 rounded-xl transition-all shadow-md shadow-brand-500/20 active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
