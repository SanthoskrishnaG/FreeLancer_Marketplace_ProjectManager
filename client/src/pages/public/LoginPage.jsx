import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle,
  ShieldCheck,
  Zap,
  KeyRound
} from 'lucide-react';
import { BrandLogo } from '../../components/common/BrandLogo.jsx';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login({ email: email.trim().toLowerCase(), password });
      if (user?.role === 'ADMIN') navigate('/admin');
      else if (user?.role === 'CLIENT') navigate('/client/dashboard');
      else if (user?.role === 'FREELANCER') navigate('/freelancer/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative">
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left: Brand Presentation */}
        <div className="lg:col-span-5 space-y-6 lg:pr-4">
          <BrandLogo size="lg" to="/" />

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight leading-tight font-display">
              Turn Ideas Into <span className="gradient-cyber-text">Delivered Work.</span>
            </h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
              Sign in to coordinate projects, approve milestones, or manage contracts with AI-assisted delivery.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-[#3B82F6]/15 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-[#F8FAFC]">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Enterprise-Grade Authentication</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
              Protected by encrypted sessions, database-backed role validation, and secure token exchange.
            </p>
          </div>

          {/* Quick Demo Credentials for Fast Testing */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <KeyRound className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>One-Click Test Credentials:</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDemoAccount('client1@marketplace.com', 'Password123!')}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20 border border-[#3B82F6]/25 transition-colors"
              >
                Client Demo
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('lukas.novak@freelance.io', 'Password123!')}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/25 transition-colors"
              >
                Freelancer Demo
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('admin@market.io', 'Password123!')}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/25 transition-colors"
              >
                Admin Demo
              </button>
            </div>
          </div>
        </div>

        {/* Right: Login Card */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-[#111726] rounded-2xl border border-slate-200 dark:border-[#3B82F6]/20 shadow-xl dark:shadow-[0_4px_30px_rgba(0,0,0,0.6)] p-6 sm:p-8 transition-colors">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight font-display">Welcome Back</h2>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">Sign in to continue to your WorkPulse workspace.</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2.5 leading-relaxed animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client1@marketplace.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setError('Please contact administrator or use a demo account if you need a password reset.')}
                    className="text-xs text-[#3B82F6] hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#3B82F6] bg-slate-50 dark:bg-[#0D1220] border-slate-300 dark:border-slate-700 rounded focus:ring-[#3B82F6]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600 dark:text-[#94A3B8] cursor-pointer">
                  Remember me on this browser
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 btn-electric text-sm py-3 px-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                Don't have an account?{' '}
                <Link to="/register" className="text-[#3B82F6] hover:underline font-bold transition-colors">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
