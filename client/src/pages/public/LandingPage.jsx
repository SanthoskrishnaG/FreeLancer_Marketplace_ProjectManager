import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle,
  Briefcase,
  Users,
  Layers,
  Lock,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-sky-500/15 blur-[100px] pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-8 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen Autonomous AI Freelancer Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          Hire World-Class Talent With{' '}
          <span className="gradient-text">AI-Engineered Milestones</span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
          Transform vague project descriptions into structured, budget-optimized scopes of work.
          Protected by automated escrow, real-time collaboration, and verified developer talent.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <span>Start Building Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/projects"
            className="w-full sm:w-auto px-8 py-4 rounded-xl glass-card hover:bg-gray-800/80 text-gray-300 hover:text-white font-semibold text-base transition-all flex items-center justify-center gap-2"
          >
            <Briefcase className="w-4 h-4 text-gray-400" />
            <span>Explore Open Projects</span>
          </Link>
        </div>

        {/* Demo Credentials Quick Callout */}
        <div className="mt-12 max-w-2xl mx-auto glass-card p-4 rounded-2xl border border-indigo-500/20 text-xs text-gray-300 flex flex-wrap items-center justify-center gap-4">
          <span className="text-indigo-400 font-semibold uppercase tracking-wider">Demo Credentials:</span>
          <span>Client: <code className="text-white bg-gray-800 px-1.5 py-0.5 rounded">client1@marketplace.com</code></span>
          <span>Freelancer: <code className="text-white bg-gray-800 px-1.5 py-0.5 rounded">freelancer1@marketplace.com</code></span>
          <span>Admin: <code className="text-white bg-gray-800 px-1.5 py-0.5 rounded">admin@marketplace.com</code></span>
          <span>Pass: <code className="text-emerald-400 bg-gray-800 px-1.5 py-0.5 rounded">Password123!</code></span>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">Architected for Speed & Reliability</h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white">Full-Lifecycle Project Management</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-2xl border border-gray-800 relative group hover:border-indigo-500/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">AI Milestone Decomposition</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Our intelligent engine analyzes natural language requirements, breaking projects into discrete, verifiable milestone deliverables with realistic timelines and budgets.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-gray-800 relative group hover:border-sky-500/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-6">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Smart Escrow Protection</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Funds are securely held in milestone escrow. Freelancers work with 100% confidence, while clients only release payments upon reviewing and approving submitted code.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-gray-800 relative group hover:border-emerald-500/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-white mb-3">Real-Time Dashboards</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Gain instantaneous insights into GMV, contract progress, live time-tracking stopwatch hours, pending milestone approvals, and automated PDF invoices.
            </p>
          </div>
        </div>
      </section>

      {/* AI Post Project Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-8 sm:p-14 border border-indigo-500/30 relative overflow-hidden bg-gradient-to-br from-indigo-950/40 via-gray-900 to-black">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Instant AI Project Scoping
            </span>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Have an idea? Let AI write the technical proposal and milestones.
            </h3>
            <p className="text-sm sm:text-base text-gray-300 mb-8 leading-relaxed">
              Describe your web, mobile, or AI application in plain English. Our system auto-generates milestones, acceptance criteria, estimated hours, and budget splits.
            </p>
            <Link
              to="/client/projects/create"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-gray-900 font-bold hover:bg-gray-100 transition-all shadow-xl"
            >
              <span>Try AI Scoping Tool</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
