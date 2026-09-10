import React from 'react';
import { Briefcase, Code2, Server, Database } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-slate-950">
                <Briefcase className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">WorkPulse</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm">
              Scalable, high-performance Freelancer Marketplace and Project Manager built with
              modern full-stack engineering principles.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Frontend Tech
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-brand-400" /> React 18 & TypeScript
              </li>
              <li className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-brand-400" /> Vite & Tailwind CSS
              </li>
              <li className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-brand-400" /> React Router v7
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Backend Tech
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-emerald-400" /> Node.js & Express
              </li>
              <li className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-emerald-400" /> PostgreSQL & Prisma ORM
              </li>
              <li className="flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-emerald-400" /> Layered Monorepo Architecture
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} WorkPulse Marketplace. Phase 1 Foundation.</p>
          <div className="flex items-center gap-6">
            <span>TypeScript Monorepo</span>
            <span>Clean Architecture</span>
            <span>ESLint & Prettier</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
