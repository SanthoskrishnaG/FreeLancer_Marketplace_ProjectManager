import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Briefcase,
  Lock,
  TrendingUp,
  Zap,
  Code2,
  ShieldCheck,
  Cpu,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="space-y-24 py-8 relative">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Hero Copy & Actions */}
          <div className="lg:col-span-7 text-left space-y-6">
            {/* Pill Badge matching reference style */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D1629] border border-[#3B82F6]/30 text-[#93C5FD] text-xs font-semibold shadow-[0_0_15px_rgba(59,130,246,0.18)]">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-pulse shadow-[0_0_8px_#3B82F6]" />
              <span className="uppercase tracking-wider text-[11px]">Secure Workspace Active</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-[#F8FAFC] leading-[1.08] font-display">
              Turn Complex Ideas Into{' '}
              <span className="gradient-cyber-text">
                Delivered Work.
              </span>
            </h1>

            {/* Sub-headline with cyber emphasis */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-[#94A3B8] leading-relaxed max-w-2xl font-normal">
              "Building Secure Digital Solutions Through Code, Innovation, and AI-Powered Milestone Execution."
            </p>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
              Decompose natural language project briefs into discrete, verifiable milestone deliverables with automated escrow security and real-time collaboration.
            </p>

            {/* Action Buttons matching reference visual hierarchy */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="btn-electric text-sm py-3 px-6 shadow-[0_0_25px_rgba(59,130,246,0.35)]"
              >
                <span>Start Building Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                to="/projects"
                className="btn-cyber-outline text-sm py-3 px-6"
              >
                <Briefcase className="w-4 h-4 text-slate-400 dark:text-[#60A5FA]" />
                <span>View Projects &gt;</span>
              </Link>

              <Link
                to="/freelancers"
                className="text-xs font-semibold text-slate-600 dark:text-[#94A3B8] hover:text-[#3B82F6] dark:hover:text-[#F8FAFC] transition-colors py-2 px-3"
              >
                Explore Talent
              </Link>
            </div>

            {/* Micro Feature Indicators */}
            <div className="pt-4 flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Milestone Escrow</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-[#3B82F6]" />
                <span>Groq LPU 120B AI</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Zero Risk Sign-up</span>
              </div>
            </div>
          </div>

          {/* Right Column: Circular Cyber Visual Widget matching reference illustration */}
          <div className="lg:col-span-5 flex justify-center items-center relative">
            {/* Ambient Background Glow */}
            <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-[#3B82F6]/20 via-[#8B5CF6]/15 to-transparent blur-3xl pointer-events-none" />

            <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full border-2 border-[#3B82F6]/30 dark:border-[#3B82F6]/25 p-3 flex items-center justify-center bg-radial from-[#111726]/60 via-[#0D1220]/80 to-[#080B12] shadow-[0_0_50px_rgba(59,130,246,0.18)]">
              {/* Inner Decorative Hex Ring */}
              <div className="w-full h-full rounded-full border border-dashed border-slate-700/60 dark:border-[#8B5CF6]/30 flex items-center justify-center p-6 relative">
                
                {/* Floating Lock Badge (Cyan Neon) */}
                <div className="absolute -top-3 right-8 w-10 h-10 rounded-xl bg-[#0D1220] border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)] animate-bounce duration-1000">
                  <Lock className="w-5 h-5" />
                </div>

                {/* Floating Code Badge (Purple Neon) */}
                <div className="absolute -bottom-2 left-6 w-10 h-10 rounded-xl bg-[#0D1220] border border-[#8B5CF6]/50 flex items-center justify-center text-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.35)]">
                  <Code2 className="w-5 h-5" />
                </div>

                {/* Center Core HUD */}
                <div className="w-full h-full rounded-full bg-slate-900/80 dark:bg-[#0B101D] border border-slate-800 dark:border-[#3B82F6]/30 flex flex-col items-center justify-center text-center p-6 shadow-inner">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#8B5CF6] flex items-center justify-center text-white mb-3 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-100 dark:text-[#F8FAFC] tracking-tight">
                    WorkPulse AI Engine
                  </h3>
                  <p className="text-[11px] text-[#93C5FD] font-mono mt-1">
                    Autonomous Project Scoping
                  </p>
                  <div className="mt-3 px-3 py-1 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[10px] font-bold text-[#60A5FA]">
                    LPU INFERENCE ACTIVE
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/25 text-[#3B82F6] dark:text-[#60A5FA] text-xs font-bold uppercase tracking-wider mb-2">
            Architected for Speed & Reliability
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight font-display">
            Full-Lifecycle Intelligent Execution
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="cyber-card p-8 group hover:border-[#3B82F6]/40 transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#3B82F6] flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC] mb-2 tracking-tight">
              AI Milestone Decomposition
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
              Our intelligent engine analyzes natural language requirements, breaking projects into discrete, verifiable milestone deliverables with realistic timelines and budgets.
            </p>
          </div>

          <div className="cyber-card p-8 group hover:border-cyan-500/40 transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC] mb-2 tracking-tight">
              Milestone Escrow Vault
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
              Funds are securely held in milestone escrow. Freelancers work with 100% confidence, while clients only release payments upon reviewing and approving submitted code.
            </p>
          </div>

          <div className="cyber-card p-8 group hover:border-[#8B5CF6]/40 transition-all duration-200">
            <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6] flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC] mb-2 tracking-tight">
              Real-Time Telemetry
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
              Gain instantaneous insights into contract progress, live time-tracking stopwatch hours, pending milestone approvals, and automated PDF invoices.
            </p>
          </div>
        </div>
      </section>

      {/* AI Project Scoping CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 relative overflow-hidden bg-gradient-to-r from-[#0D1220] via-[#111726] to-[#151C30] border border-[#3B82F6]/30 shadow-[0_0_40px_rgba(59,130,246,0.15)] text-white">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-[#93C5FD] text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Instant AI Project Scoping
            </span>
            <h3 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight text-[#F8FAFC] font-display">
              Have an idea? Let AI write the technical proposal and milestones.
            </h3>
            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
              Describe your web, mobile, or enterprise project in plain English. Our system auto-generates milestones, acceptance criteria, estimated hours, and budget splits.
            </p>
            <div className="pt-2">
              <Link
                to="/client/projects/create"
                className="btn-electric text-xs py-3 px-6 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              >
                <span>Try AI Scoping Tool Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
