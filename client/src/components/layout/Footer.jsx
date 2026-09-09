import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Zap } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3.5 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-slate-900 tracking-tight">
                WorkPulse<span className="text-indigo-600">.ai</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enterprise-grade AI Freelance Marketplace & Project Management Suite with automated milestone planning and escrow protection.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">Marketplace</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/projects" className="hover:text-indigo-600 transition-colors">Browse Projects</Link></li>
              <li><Link to="/freelancers" className="hover:text-indigo-600 transition-colors">Verified Freelancers</Link></li>
              <li><Link to="/projects?category=AI+%26+Machine+Learning" className="hover:text-indigo-600 transition-colors">AI & ML Projects</Link></li>
              <li><Link to="/projects?category=Web+Development" className="hover:text-indigo-600 transition-colors">Web Development</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-indigo-600" /> AI Requirement Scoping</li>
              <li className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-600" /> Milestone Escrow</li>
              <li className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> Real-time Collaboration</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5">Portals</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/client/dashboard" className="hover:text-indigo-600 transition-colors">Client Workspace</Link></li>
              <li><Link to="/freelancer/dashboard" className="hover:text-indigo-600 transition-colors">Freelancer Suite</Link></li>
              <li><Link to="/admin" className="hover:text-indigo-600 transition-colors">Admin Console</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} WorkPulse AI Platform. "Turn Ideas Into Delivered Work."</p>
          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <span>Verified Escrow</span>
            <span>•</span>
            <span>End-to-End Encryption</span>
            <span>•</span>
            <span>Real-time WebSockets</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
