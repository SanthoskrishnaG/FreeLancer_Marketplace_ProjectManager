import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { authApi } from '../../api/authApi.js';
import {
  User,
  Mail,
  DollarSign,
  Briefcase,
  Building,
  Save,
  CheckCircle2,
  Sliders,
  Shield,
  Image as ImageIcon,
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, isFreelancer, isClient, updateUserProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || user?.freelancerProfile?.bio || '');
  const [title, setTitle] = useState(user?.freelancerProfile?.title || '');
  const [hourlyRate, setHourlyRate] = useState(String(user?.freelancerProfile?.hourlyRate || '800'));
  const [companyName, setCompanyName] = useState(user?.clientProfile?.companyName || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const res = await authApi.updateProfile({
        name,
        bio,
        avatar,
        ...(isFreelancer && {
          title,
          hourlyRate: Number(hourlyRate),
        }),
        ...(isClient && {
          companyName,
        }),
      });

      if (res.data) {
        updateUserProfile(res.data);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#3B82F6] dark:text-[#60A5FA] text-xs font-mono font-medium mb-2">
          <Sliders className="w-3.5 h-3.5" />
          <span>ACCOUNT & PROFILE PREFERENCES</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
          Profile & Security Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Update public marketplace identity, engineering credentials, avatar graphics, and enterprise billing names.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="cyber-card bg-white dark:bg-[#111726]/85 p-8 rounded-3xl border border-slate-200 dark:border-blue-500/20 shadow-sm space-y-6"
      >
        {saved && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Profile and marketplace settings successfully updated!</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address (Verified)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-[#080B12] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400 dark:text-slate-500 cursor-not-allowed font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Avatar Image URL
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/... or Dicebear avatar link"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
              />
            </div>
          </div>

          {isFreelancer && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Professional Title
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Full-Stack Engineer / Distributed Systems"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Hourly Rate (₹/hr)
                </label>
                <div className="relative">
                  <span className="text-slate-400 dark:text-slate-500 font-bold absolute left-3.5 top-1/2 -translate-y-1/2 text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="100"
                    max="50000"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                  />
                </div>
              </div>
            </>
          )}

          {isClient && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Company / Organization
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. CyberSec Ventures or Acme Systems"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Professional Bio & Expertise
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your specialization, technical architectures delivered, frameworks used, and availability..."
              className="w-full p-3.5 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] leading-relaxed"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-electric px-6 py-2.5 rounded-xl text-white font-semibold text-xs shadow-sm flex items-center gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
