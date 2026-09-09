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
  CheckCircle2
} from 'lucide-react';

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

  const quickFill = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left: Brand Presentation */}
        <div className="lg:col-span-5 space-y-6 lg:pr-4">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              WorkPulse<span className="text-indigo-600">.ai</span>
            </span>
          </Link>

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Turn Ideas Into <span className="text-indigo-600">Delivered Work.</span>
            </h1>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Sign in to coordinate projects, approve milestones, or manage contracts with AI-assisted delivery.
            </p>
          </div>

          {/* Quick Fill Demo Persona */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>One-Click Demo Access:</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickFill('client1@marketplace.com', 'Client')}
                className="py-1.5 px-2 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/60 rounded-xl text-xs text-indigo-700 font-semibold transition-all text-center"
              >
                Client
              </button>
              <button
                type="button"
                onClick={() => quickFill('freelancer1@marketplace.com', 'Freelancer')}
                className="py-1.5 px-2 bg-violet-50/80 hover:bg-violet-100 border border-violet-200/60 rounded-xl text-xs text-violet-700 font-semibold transition-all text-center"
              >
                Freelancer
              </button>
              <button
                type="button"
                onClick={() => quickFill('admin@market.io', 'Admin')}
                className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 rounded-xl text-xs text-slate-700 font-semibold transition-all text-center"
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* Right: Login Card */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
              <p className="text-xs text-slate-500 mt-1">Sign in to continue managing your projects.</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 leading-relaxed animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => alert('Demo accounts use Password123! You can also sign in using the demo buttons.')}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
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
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600 cursor-pointer">
                  Remember me on this browser
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-5 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
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

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
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
