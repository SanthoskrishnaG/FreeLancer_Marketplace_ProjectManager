import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPasswordApi } from '../api/auth.api.js';
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import axios from 'axios';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoToken, setDemoToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await forgotPasswordApi(email);
      setSubmitted(true);
      const resData = res.data as { resetToken?: string } | undefined;
      if (resData?.resetToken) {
        setDemoToken(resData.resetToken);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to request password reset');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 bg-slate-900/70 border border-slate-800 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-4">
            <Mail className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Forgot Password</h2>
          <p className="mt-1 text-xs text-slate-400">
            Enter your email to receive password reset instructions
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-emerald-400">Instructions Dispatched</p>
                <p className="mt-1">
                  If an account exists for <span className="text-white font-medium">{email}</span>,
                  you will receive reset instructions shortly.
                </p>
              </div>
            </div>

            {demoToken && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-2">
                <p className="text-slate-400 font-semibold">Development Demo Helper:</p>
                <p className="text-slate-300 font-mono text-[11px] break-all">{demoToken}</p>
                <Link
                  to={`/reset-password?token=${demoToken}`}
                  className="inline-block mt-1 text-brand-400 hover:underline text-xs"
                >
                  👉 Click here to proceed with reset using token
                </Link>
              </div>
            )}

            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2.5 p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-slate-950 bg-brand-400 hover:bg-brand-300 active:scale-[0.99] disabled:opacity-50 transition-all shadow-lg shadow-brand-500/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending Instructions...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>

            <p className="text-center text-xs text-slate-400 pt-2">
              Remember your password?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
