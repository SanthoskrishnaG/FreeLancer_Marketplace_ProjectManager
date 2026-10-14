import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  Sparkles, 
  ArrowRight, 
  User, 
  Mail, 
  Lock, 
  Briefcase, 
  CheckCircle2, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Clock,
  Layers
} from 'lucide-react';
import { BrandLogo } from '../../components/common/BrandLogo.jsx';

export const RegisterPage = () => {
  const [role, setRole] = useState('CLIENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [title, setTitle] = useState('');
  const [hourlyRate, setHourlyRate] = useState('800');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-200 dark:bg-slate-700' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Good', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const pwdStrength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const nameParts = name.trim().split(/\s+/);
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Member';

      const payload = {
        name: name.trim(),
        firstName,
        lastName,
        email: email.trim().toLowerCase(),
        password,
        role,
        ...(role === 'FREELANCER' && {
          title: title.trim() || 'Professional Consultant',
          hourlyRate: Number(hourlyRate) || 800,
        }),
      };

      const user = await register(payload);
      if (user?.role === 'CLIENT') {
        navigate('/client/dashboard');
      } else if (user?.role === 'FREELANCER') {
        navigate('/freelancer/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('already exists')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(msg || 'Registration failed. Please check your information.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative">
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left: Brand Presentation */}
        <div className="lg:col-span-5 space-y-6 lg:pr-4">
          <BrandLogo size="lg" to="/" />

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight leading-tight font-display">
              Turn Ideas Into <span className="gradient-cyber-text">Delivered Work.</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-[#94A3B8] leading-relaxed">
              AI-powered project planning and smarter freelance collaboration with escrow-backed milestones.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6] shrink-0 mt-0.5 shadow-[0_0_12px_rgba(59,130,246,0.15)]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">AI-Powered Milestones</h4>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Generate scopes, deliverable breakdowns, and budgets in seconds via Groq LPU.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Escrow Milestone Protection</h4>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Funds are held safely in escrow and released only upon client review and sign-off.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] shrink-0 mt-0.5 shadow-[0_0_12px_rgba(139,92,246,0.15)]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Collaborative Workflow</h4>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Real-time messaging, automated invoicing, and live stopwatch tracking.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Registration Card */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-[#111726] rounded-2xl border border-slate-200 dark:border-[#3B82F6]/20 shadow-xl dark:shadow-[0_4px_30px_rgba(0,0,0,0.6)] p-6 sm:p-8 transition-colors">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight font-display">Create Your Account</h2>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">Choose how you want to use WorkPulse AI</p>
            </div>

            {/* Account Type Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setRole('CLIENT')}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  role === 'CLIENT'
                    ? 'border-[#3B82F6] bg-[#3B82F6]/10 dark:bg-[#3B82F6]/15 ring-2 ring-[#3B82F6]/25 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#0D1220]'
                }`}
              >
                {role === 'CLIENT' && (
                  <CheckCircle2 className="w-4 h-4 text-[#3B82F6] absolute top-3 right-3" />
                )}
                <div className="w-9 h-9 rounded-lg bg-[#3B82F6]/15 text-[#3B82F6] flex items-center justify-center mb-2">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Client Workspace</h3>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">I want to scope projects & hire talented professionals</p>
              </button>

              <button
                type="button"
                onClick={() => setRole('FREELANCER')}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  role === 'FREELANCER'
                    ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 dark:bg-[#8B5CF6]/15 ring-2 ring-[#8B5CF6]/25 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#0D1220]'
                }`}
              >
                {role === 'FREELANCER' && (
                  <CheckCircle2 className="w-4 h-4 text-[#8B5CF6] absolute top-3 right-3" />
                )}
                <div className="w-9 h-9 rounded-lg bg-[#8B5CF6]/15 text-[#8B5CF6] flex items-center justify-center mb-2">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Freelancer Suite</h3>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">I want to bid on projects & deliver high-value work</p>
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2.5 leading-relaxed animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Santhoskrishna G"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-1 text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Password Strength:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{pwdStrength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 rounded-full ${pwdStrength.score >= 1 ? pwdStrength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                    <div className={`h-full flex-1 rounded-full ${pwdStrength.score >= 2 ? pwdStrength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                    <div className={`h-full flex-1 rounded-full ${pwdStrength.score >= 3 ? pwdStrength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                  </div>
                </div>
              )}

              {/* Freelancer Specific Details */}
              {role === 'FREELANCER' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Professional Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Senior AI Full Stack Engineer"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Hourly Rate ($/hr)</label>
                    <input
                      type="number"
                      min="10"
                      max="1000"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-5 btn-electric text-sm py-3 px-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                Already have an account?{' '}
                <Link to="/login" className="text-[#3B82F6] hover:underline font-bold transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
