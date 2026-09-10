import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyProfileApi,
  updateMyProfileApi,
  addFreelancerSkillApi,
  removeFreelancerSkillApi,
  getMetaSkillsAndCategoriesApi,
} from '../api/profile.api.js';
import { useAuth } from '../context/AuthContext.js';
import {
  User,
  Building2,
  Briefcase,
  Layers,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export const ProfileSettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'general' | 'role' | 'skills' | 'portfolio'>(
    'general'
  );
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [location, setLocation] = useState('');

  // Client fields
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [clientDesc, setClientDesc] = useState('');
  const [industry, setIndustry] = useState('');

  // Freelancer fields
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number>(75);
  const [experienceYears, setExperienceYears] = useState<number>(5);
  const [experienceLevel, setExperienceLevel] = useState<'ENTRY' | 'INTERMEDIATE' | 'EXPERT'>(
    'INTERMEDIATE'
  );
  const [isAvailable, setIsAvailable] = useState(true);
  const [languagesStr, setLanguagesStr] = useState('English');

  // Portfolio items
  const [portfolioItems, setPortfolioItems] = useState<
    Array<{ title: string; description: string; url: string }>
  >([]);

  // Skill select
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState<
    'Beginner' | 'Intermediate' | 'Expert'
  >('Intermediate');

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['myFullProfile'],
    queryFn: getMyProfileApi,
  });

  const { data: metaData } = useQuery({
    queryKey: ['metaSkillsAndCategories'],
    queryFn: getMetaSkillsAndCategoriesApi,
  });

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhoneNumber(user.phoneNumber || '');
      setAvatarUrl(user.avatarUrl || '');
      setLocation(user.location || '');

      if (user.clientProfile) {
        setCompanyName(user.clientProfile.companyName || '');
        setCompanyWebsite(user.clientProfile.companyWebsite || '');
        setClientDesc(user.clientProfile.description || '');
        setIndustry(user.clientProfile.industry || '');
      }

      if (user.freelancerProfile) {
        setTitle(user.freelancerProfile.title || '');
        setBio(user.freelancerProfile.bio || '');
        setHourlyRate(Number(user.freelancerProfile.hourlyRate) || 75);
        setExperienceYears(user.freelancerProfile.experienceYears || 5);
        setExperienceLevel(user.freelancerProfile.experienceLevel || 'INTERMEDIATE');
        setIsAvailable(user.freelancerProfile.isAvailable);
        setLanguagesStr(user.freelancerProfile.languages?.join(', ') || 'English');
        setPortfolioItems((user.freelancerProfile.portfolio as any[]) || []);
      }
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateMyProfileApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myFullProfile'] });
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setErrorMsg(null), 4000);
    },
  });

  const addSkillMutation = useMutation({
    mutationFn: (data: { skillId: string; proficiency: 'Beginner' | 'Intermediate' | 'Expert' }) =>
      addFreelancerSkillApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myFullProfile'] });
      setSelectedSkillId('');
    },
  });

  const removeSkillMutation = useMutation({
    mutationFn: (skillId: string) => removeFreelancerSkillApi(skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myFullProfile'] });
    },
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    const languages = languagesStr
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);

    updateMutation.mutate({
      firstName,
      lastName,
      phoneNumber,
      avatarUrl: avatarUrl || null,
      location,
      companyName,
      companyWebsite: companyWebsite || null,
      description: clientDesc,
      industry,
      title,
      bio,
      hourlyRate,
      experienceYears,
      experienceLevel,
      isAvailable,
      languages,
      portfolio: portfolioItems,
    });
  };

  const handleAddPortfolioItem = () => {
    setPortfolioItems([
      ...portfolioItems,
      {
        title: 'New Project Showcase',
        description: 'Description of key deliverables',
        url: 'https://',
      },
    ]);
  };

  const handleUpdatePortfolio = (index: number, field: string, val: string) => {
    const updated = [...portfolioItems];
    updated[index] = { ...updated[index], [field]: val };
    setPortfolioItems(updated);
  };

  const handleDeletePortfolio = (index: number) => {
    setPortfolioItems(portfolioItems.filter((_, i) => i !== index));
  };

  if (isUserLoading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400 mx-auto mb-2" />
        <p className="text-xs text-slate-400">Loading profile settings...</p>
      </div>
    );
  }

  const isFreelancer = authUser?.role === 'FREELANCER';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Profile & Account Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your personal data, credentials, public profile, and skills
          </p>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="flex items-center gap-2.5 p-4 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2.5 p-4 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/60 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'general'
              ? 'bg-brand-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5" /> General Info
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('role')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'role'
              ? 'bg-brand-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
          }`}
        >
          {isFreelancer ? (
            <>
              <Briefcase className="w-3.5 h-3.5" /> Freelancer Profile
            </>
          ) : (
            <>
              <Building2 className="w-3.5 h-3.5" /> Client Profile
            </>
          )}
        </button>

        {isFreelancer && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('skills')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'skills'
                  ? 'bg-brand-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Manage Skills
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('portfolio')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'portfolio'
                  ? 'bg-brand-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" /> Portfolio
            </button>
          </>
        )}
      </div>

      {/* Main Settings Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 backdrop-blur-xl">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Location / Country
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA or London, UK"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Avatar / Profile Image URL
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'role' && !isFreelancer && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Company / Organization Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="TechCorp Innovations"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Company Website
                  </label>
                  <input
                    type="url"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Industry
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. SaaS, Fintech, Healthcare, E-commerce"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Company Overview & Description
                </label>
                <textarea
                  rows={4}
                  value={clientDesc}
                  onChange={(e) => setClientDesc(e.target.value)}
                  placeholder="Describe your organization and project missions..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'role' && isFreelancer && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Professional Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Senior Full Stack React & Node Engineer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Hourly Rate ($/hr)
                  </label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Experience Years
                  </label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Seniority Level
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="ENTRY">Entry Level</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="EXPERT">Expert Specialist</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Languages Spoken (comma separated)
                </label>
                <input
                  type="text"
                  value={languagesStr}
                  onChange={(e) => setLanguagesStr(e.target.value)}
                  placeholder="English, Spanish, German"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Professional Biography
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Summarize your engineering background, achievements, and core stack..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="rounded text-brand-500 focus:ring-brand-500 bg-slate-900 border-slate-800"
                  />
                  <span>Mark as Available for New Client Projects</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'skills' && isFreelancer && (
            <div className="space-y-6">
              {/* Add Skill Row */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Add New Skill to Profile
                </h4>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <select
                    value={selectedSkillId}
                    onChange={(e) => setSelectedSkillId(e.target.value)}
                    className="w-full sm:w-1/2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="">Select a Skill</option>
                    {metaData?.skills.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedProficiency}
                    onChange={(e) => setSelectedProficiency(e.target.value as any)}
                    className="w-full sm:w-1/3 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>

                  <button
                    type="button"
                    disabled={!selectedSkillId || addSkillMutation.isPending}
                    onClick={() =>
                      addSkillMutation.mutate({
                        skillId: selectedSkillId,
                        proficiency: selectedProficiency,
                      })
                    }
                    className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-brand-400 hover:bg-brand-300 disabled:opacity-50 transition-colors"
                  >
                    Add Skill
                  </button>
                </div>
              </div>

              {/* Current Skills List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Active Verified Skills ({user?.freelancerProfile?.skills?.length || 0})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {user?.freelancerProfile?.skills?.map((fSkill) => (
                    <div
                      key={fSkill.id}
                      className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white">{fSkill.skill.name}</span>
                        {fSkill.proficiency && (
                          <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-slate-800 text-brand-400">
                            {fSkill.proficiency}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeSkillMutation.mutate(fSkill.skillId)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && isFreelancer && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Portfolio Projects</h3>
                  <p className="text-xs text-slate-400">
                    Add links and descriptions to your notable past projects
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddPortfolioItem}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 hover:bg-brand-500/20 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Project
                </button>
              </div>

              <div className="space-y-4">
                {portfolioItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleUpdatePortfolio(idx, 'title', e.target.value)}
                        placeholder="Project Title"
                        className="bg-transparent border-b border-slate-700 text-sm font-bold text-white focus:border-brand-500 focus:outline-none flex-1 py-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeletePortfolio(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="url"
                      value={item.url}
                      onChange={(e) => handleUpdatePortfolio(idx, 'url', e.target.value)}
                      placeholder="https://project-demo.com"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                    />

                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => handleUpdatePortfolio(idx, 'description', e.target.value)}
                      placeholder="Brief description of tech stack and achievements..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-brand-400 hover:bg-brand-300 active:scale-95 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  Save All Profile Changes <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
