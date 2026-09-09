import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Zap, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="glass-card border-t border-gray-800/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base text-white tracking-tight">
                WorkPulse <span className="text-xs text-indigo-400 font-mono">AI</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Enterprise-ready AI Freelance Marketplace & Project Management Suite with automated milestone generation and escrow settlements.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-4">Marketplace</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/projects" className="hover:text-indigo-400 transition-colors">Browse Projects</Link></li>
              <li><Link to="/freelancers" className="hover:text-indigo-400 transition-colors">Verified Freelancers</Link></li>
              <li><Link to="/projects?category=AI+%26+Machine+Learning" className="hover:text-indigo-400 transition-colors">AI & ML Projects</Link></li>
              <li><Link to="/projects?category=Web+Development" className="hover:text-indigo-400 transition-colors">Web Engineering</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI Requirement Scoping</li>
              <li className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-sky-400" /> Escrow Protection</li>
              <li className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> Real-time Collaboration</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300 mb-4">Portals</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/client/dashboard" className="hover:text-indigo-400 transition-colors">Client Workspace</Link></li>
              <li><Link to="/freelancer/dashboard" className="hover:text-indigo-400 transition-colors">Freelancer Suite</Link></li>
              <li><Link to="/admin" className="hover:text-indigo-400 transition-colors">Admin Console</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} WorkPulse AI Platform. Built with React & Node.js.</p>
          <div className="flex items-center gap-4">
            <span>Enterprise Security</span>
            <span>•</span>
            <span>Encrypted Escrow</span>
            <span>•</span>
            <span>Realtime WebSockets</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
