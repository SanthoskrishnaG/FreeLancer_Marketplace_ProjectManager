import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Briefcase,
  CheckCircle,
  Code2,
  Server,
  Layers,
  FolderTree,
} from 'lucide-react';
import { useHealthCheck } from '../hooks/useHealthCheck.js';

export const LandingPage: React.FC = () => {
  const { data, isLoading, isHealthy, error, refetch } = useHealthCheck();

  const coreFeatures = [
    {
      icon: <Briefcase className="w-6 h-6 text-brand-400" />,
      title: 'Smart Job Matching',
      description:
        'Connect top clients with vetted developers, designers, and project specialists effortlessly.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      title: 'Escrow & Milestone Protection',
      description:
        'Secure multi-tier milestone payment workflows ensuring peace of mind for both parties.',
    },
    {
      icon: <Zap className="w-6 h-6 text-cyan-400" />,
      title: 'Built-in Project Management',
      description:
        'Integrated Kanban boards, time tracking, task milestones, and real-time deliverables.',
    },
    {
      icon: <Users className="w-6 h-6 text-amber-400" />,
      title: 'Reputation & Verified Badges',
      description:
        'Transparent feedback, skill validation, and verified portfolio proofs for talent.',
    },
  ];

  const techStack = [
    {
      category: 'Frontend Client',
      color: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
      items: ['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'React Router v7', 'Axios'],
    },
    {
      category: 'Backend API',
      color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
      items: ['Node.js', 'Express', 'TypeScript', 'Zod Validation', 'Centralized Error Handling'],
    },
    {
      category: 'Database & ORM',
      color: 'border-indigo-500/30 bg-indigo-500/5 text-indigo-400',
      items: ['PostgreSQL', 'Prisma ORM', 'Schema Migrations', 'Connection Pooling'],
    },
    {
      category: 'Code Quality & Tooling',
      color: 'border-purple-500/30 bg-purple-500/5 text-purple-400',
      items: ['ESLint Flat Config', 'Prettier', 'Strict Type Checking', 'NPM Workspaces'],
    },
  ];

  return (
    <div className="flex flex-col gap-24 py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 sm:pt-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-6">
          <span className="flex h-2 w-2 rounded-full bg-brand-400 animate-ping" />
          Phase 1 Foundation Initialized
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
          The Next-Generation <br />
          <span className="bg-gradient-to-r from-brand-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
            Freelancer Marketplace
          </span>{' '}
          & Project Suite
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
          A production-grade platform built with clean, scalable architecture separating client
          presentation and resilient Express backend services.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#architecture"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-950 bg-brand-400 hover:bg-brand-300 transition-all shadow-lg shadow-brand-500/20 active:scale-95"
          >
            Explore Architecture
            <ArrowRight className="w-4 h-4" />
          </a>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all active:scale-95"
          >
            <Server className="w-4 h-4 text-emerald-400" />
            Check API Health
          </button>
        </div>

        {/* Live Status Card */}
        <div className="mt-14 max-w-xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-left">
              <div
                className={`p-2.5 rounded-xl ${
                  isLoading
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : isHealthy
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                <Server className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Backend Live Status</p>
                <p className="text-sm font-semibold text-white">
                  {isLoading ? 'Checking connection...' : isHealthy ? data?.message : 'Offline'}
                </p>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-400">Target Endpoint: </span>
              <code className="text-brand-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                GET /api/health
              </code>
            </div>
          </div>

          {error && (
            <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-rose-400 text-left">
              <span className="font-semibold">Notice:</span> Start the backend with{' '}
              <code className="bg-slate-950 px-1 py-0.5 rounded">npm run dev:server</code> to verify
              live connectivity.
            </div>
          )}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Upcoming Marketplace Modules
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Phase 1 sets up the scaffold for future business domains.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreFeatures.map((feat, index) => (
            <div
              key={index}
              className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-brand-500/40 transition-all hover:-translate-y-1 group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {feat.icon}
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture & Tech Stack Grid */}
      <section id="architecture" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-slate-900/30 border border-slate-800/90 rounded-3xl p-8 sm:p-12 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="lg:w-1/3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
                <Layers className="w-3.5 h-3.5" />
                Monorepo Setup
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Scalable Project Foundation
              </h2>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                Organized with dedicated directories for client UI components, API layer, routing,
                and backend controllers, middlewares, repositories, and services.
              </p>

              <div className="mt-6 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Strict TypeScript in both Client & Server</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Configured ESLint 9 & Prettier</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Prisma ORM & PostgreSQL Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Tailwind CSS Custom Design System</span>
                </div>
              </div>
            </div>

            <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {techStack.map((stack, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <span
                      className={`inline-block text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md border mb-3 ${stack.color}`}
                    >
                      {stack.category}
                    </span>
                    <ul className="space-y-1.5 mt-2">
                      {stack.items.map((item, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Directory Structure Blueprint Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Project Structure Blueprint</h3>
              <p className="text-xs text-slate-400">
                Standardized structure implemented in Phase 1
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
              <div className="flex items-center gap-2 text-brand-400 font-semibold mb-3">
                <Code2 className="w-4 h-4" /> Frontend (client/src/)
              </div>
              <p>├── api/ # API clients & health hooks</p>
              <p>├── components/ # Shared UI & Header/Footer</p>
              <p>├── features/ # Domain feature slices</p>
              <p>├── hooks/ # Reusable hooks</p>
              <p>├── layouts/ # Application shells</p>
              <p>├── pages/ # Routed pages</p>
              <p>├── services/ # Business & external services</p>
              <p>├── types/ # TypeScript interfaces</p>
              <p>├── utils/ # Tailwind cn & formatters</p>
              <p>└── App.tsx # Router entrypoint</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-3">
                <Server className="w-4 h-4" /> Backend (server/src/)
              </div>
              <p>├── config/ # Environment & Prisma DB</p>
              <p>├── controllers/ # HTTP controller handlers</p>
              <p>├── middleware/ # Error, logging, auth middleware</p>
              <p>├── routes/ # Express routers & health check</p>
              <p>├── services/ # Business logic layer</p>
              <p>├── repositories/ # Prisma persistence layer</p>
              <p>├── validators/ # Zod request schemas</p>
              <p>├── utils/ # ApiError, ApiResponse & Logger</p>
              <p>├── modules/ # Domain modules</p>
              <p>├── app.ts # Express app setup</p>
              <p>└── server.ts # Server startup & shutdown</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
