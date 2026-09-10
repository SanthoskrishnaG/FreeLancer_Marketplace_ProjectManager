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

export const RegisterPage = () => {
  const [role, setRole] = useState('CLIENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [title, setTitle] = useState('');
  const [hourlyRate, setHourlyRate] = useState('45');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-200' };
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
          hourlyRate: Number(hourlyRate) || 45,
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
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
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              AI-powered project planning and smarter freelance collaboration with escrow-backed milestones.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">AI-Powered Milestones</h4>
                <p className="text-xs text-slate-500">Generate scopes, deliverable breakdowns, and budgets in seconds.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Escrow Milestone Protection</h4>
                <p className="text-xs text-slate-500">Funds are held safely and released only upon client approval.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Collaborative Workflow</h4>
                <p className="text-xs text-slate-500">Real-time messaging, automated invoicing, and live progress tracking.</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-indigo-500 text-[10px] text-white flex items-center justify-center font-bold ring-2 ring-white">AM</div>
              <div className="w-7 h-7 rounded-full bg-violet-500 text-[10px] text-white flex items-center justify-center font-bold ring-2 ring-white">SK</div>
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-[10px] text-white flex items-center justify-center font-bold ring-2 ring-white">JD</div>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Trusted by 10,000+ businesses and verified independent consultants.
            </p>
          </div>
        </div>

        {/* Right: Registration Card */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create your account</h2>
              <p className="text-xs text-slate-500 mt-1">Choose how you want to use WorkPulse AI</p>
            </div>

            {/* Account Type Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setRole('CLIENT')}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  role === 'CLIENT'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {role === 'CLIENT' && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 absolute top-3 right-3" />
                )}
                <div className="w-8 h-8 rounded-lg bg-indigo-100/80 text-indigo-600 flex items-center justify-center mb-2">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Client</h3>
                <p className="text-xs text-slate-500 mt-0.5">I want to hire talented professionals</p>
              </button>

              <button
                type="button"
                onClick={() => setRole('FREELANCER')}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  role === 'FREELANCER'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {role === 'FREELANCER' && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 absolute top-3 right-3" />
                )}
                <div className="w-8 h-8 rounded-lg bg-violet-100/80 text-violet-600 flex items-center justify-center mb-2">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Freelancer</h3>
                <p className="text-xs text-slate-500 mt-0.5">I want to find projects and grow my career</p>
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 leading-relaxed animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Santhoskrishna G"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                    <span className="text-slate-500">Password Strength:</span>
                    <span className="font-semibold text-slate-700">{pwdStrength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 rounded-full ${pwdStrength.score >= 1 ? pwdStrength.color : 'bg-slate-200'}`} />
                    <div className={`h-full flex-1 rounded-full ${pwdStrength.score >= 2 ? pwdStrength.color : 'bg-slate-200'}`} />
                    <div className={`h-full flex-1 rounded-full ${pwdStrength.score >= 3 ? pwdStrength.color : 'bg-slate-200'}`} />
                  </div>
                </div>
              )}

              {/* Freelancer Specific Details */}
              {role === 'FREELANCER' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Professional Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Senior AI Full Stack Engineer"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Hourly Rate ($/hr)</label>
                    <input
                      type="number"
                      min="10"
                      max="500"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-5 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
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

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
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
