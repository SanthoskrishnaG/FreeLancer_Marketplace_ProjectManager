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
    <div className="space-y-24 py-8 bg-slate-50">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>WorkPulse AI • Autonomous Project Scoping & Delivery</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 max-w-5xl mx-auto leading-[1.1]">
          Turn Ideas Into <span className="text-indigo-600">Delivered Work.</span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Transform project descriptions into structured, budget-optimized milestones.
          Protected by automated escrow, real-time developer collaboration, and verified talent.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
          >
            <span>Start Building Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/projects"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Briefcase className="w-4 h-4 text-slate-400" />
            <span>Explore Open Projects</span>
          </Link>
        </div>

        {/* Demo Credentials Quick Callout */}
        <div className="mt-12 max-w-2xl mx-auto bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-xs text-slate-600 flex flex-wrap items-center justify-center gap-4">
          <span className="text-indigo-600 font-bold uppercase tracking-wider text-[11px]">Instant Demo Login:</span>
          <span>Client: <code className="text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded font-mono font-medium">client1@marketplace.com</code></span>
          <span>Freelancer: <code className="text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded font-mono font-medium">freelancer1@marketplace.com</code></span>
          <span>Pass: <code className="text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-mono font-semibold">Password123!</code></span>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Architected for Speed & Reliability</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Full-Lifecycle Project Management</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs relative group hover:border-indigo-300 hover:shadow-md transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">AI Milestone Decomposition</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our intelligent engine analyzes natural language requirements, breaking projects into discrete, verifiable milestone deliverables with realistic timelines and budgets.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs relative group hover:border-sky-300 hover:shadow-md transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mb-6">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Milestone Escrow Protection</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Funds are securely held in milestone escrow. Freelancers work with 100% confidence, while clients only release payments upon reviewing and approving submitted code.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs relative group hover:border-emerald-300 hover:shadow-md transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Real-Time Dashboards</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Gain instantaneous insights into contract progress, live time-tracking stopwatch hours, pending milestone approvals, and automated PDF invoices.
            </p>
          </div>
        </div>
      </section>

      {/* AI Post Project Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 relative overflow-hidden bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 shadow-xl text-white">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-white text-xs font-semibold mb-4">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              Instant AI Project Scoping
            </span>
            <h3 className="text-3xl sm:text-4xl font-black mb-3 leading-tight tracking-tight">
              Have an idea? Let AI write the technical proposal and milestones.
            </h3>
            <p className="text-xs sm:text-sm text-indigo-100 mb-6 leading-relaxed">
              Describe your web, mobile, or enterprise project in plain English. Our system auto-generates milestones, acceptance criteria, estimated hours, and budget splits.
            </p>
            <Link
              to="/client/projects/create"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-900 font-bold text-xs hover:bg-indigo-50 transition-all shadow-md"
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

export default LandingPage;
