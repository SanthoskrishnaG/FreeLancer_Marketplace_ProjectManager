import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Sparkles } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo.jsx';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-[#080B12] border-t border-slate-200 dark:border-[#3B82F6]/15 mt-auto relative z-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Presentation */}
          <div className="space-y-4 md:col-span-1">
            <BrandLogo size="md" to="/" />
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
              Enterprise-grade AI Freelance Marketplace & Project Management Suite with automated milestone decomposition and escrow protection.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-[#F8FAFC] mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-[#94A3B8]">
              <li>
                <Link to="/projects" className="hover:text-[#3B82F6] transition-colors">
                  Browse Projects
                </Link>
              </li>
              <li>
                <Link to="/freelancers" className="hover:text-[#3B82F6] transition-colors">
                  Verified Freelancers
                </Link>
              </li>
              <li>
                <Link to="/projects?category=AI+%26+Machine+Learning" className="hover:text-[#3B82F6] transition-colors">
                  AI & ML Projects
                </Link>
              </li>
              <li>
                <Link to="/projects?category=Web+Development" className="hover:text-[#3B82F6] transition-colors">
                  Web Development
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-[#F8FAFC] mb-4">
              Platform Features
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-[#94A3B8]">
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" /> AI Requirement Scoping
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-500" /> Milestone Escrow Vault
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> WebSocket Tickers & Chat
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-[#F8FAFC] mb-4">
              Direct Portals
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-[#94A3B8]">
              <li>
                <Link to="/client/dashboard" className="hover:text-[#3B82F6] transition-colors">
                  Client Workspace
                </Link>
              </li>
              <li>
                <Link to="/freelancer/dashboard" className="hover:text-[#3B82F6] transition-colors">
                  Freelancer Suite
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-[#3B82F6] transition-colors">
                  Admin Console
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
          <p>© {new Date().getFullYear()} WorkPulse AI Platform. "Turn Ideas Into Delivered Work."</p>
          <div className="flex items-center gap-4 font-medium">
            <span>Verified Escrow</span>
            <span>•</span>
            <span>Groq LPU Acceleration</span>
            <span>•</span>
            <span>End-to-End Encryption</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
