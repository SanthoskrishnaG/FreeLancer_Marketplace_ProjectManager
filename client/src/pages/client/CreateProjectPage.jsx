import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { projectApi } from '../../api/projectApi.js';
import {
  Sparkles,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Layers,
  HelpCircle,
  Calendar,
  Link as LinkIcon,
  Clock,
  Briefcase,
  ChevronDown,
  ChevronUp,
  FileCheck,
} from 'lucide-react';

export const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { isFreelancer } = useAuth();

  // Core Project details
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [experienceLevel, setExperienceLevel] = useState('INTERMEDIATE');

  // Budget details
  const [budget, setBudget] = useState('50000');
  const [minBudget, setMinBudget] = useState('40000');
  const [maxBudget, setMaxBudget] = useState('60000');

  // Timeline details
  const [durationValue, setDurationValue] = useState('4');
  const [durationUnit, setDurationUnit] = useState('weeks');
  const [startDate, setStartDate] = useState('');
  const [targetEndDate, setTargetEndDate] = useState('');

  // Reference links
  const [referenceLinks, setReferenceLinks] = useState([]);
  const [newLink, setNewLink] = useState('');

  // Milestone state
  const [milestones, setMilestones] = useState([
    {
      order: 1,
      title: 'Phase 1: Architecture & Technical Specification',
      description: 'System design, database schemas, component mockups, and API contracts.',
      deliverables: 'Architecture document, OpenAPI schema, Prisma models',
      estimatedDuration: '1 week',
      dueDate: '',
      amount: 15000,
      acceptanceCriteria: 'Code review signoff and peer approval',
      status: 'PENDING',
    },
    {
      order: 2,
      title: 'Phase 2: Core Engineering & Database Implementation',
      description: 'Backend endpoints, PostgreSQL persistence, authentication and state management.',
      deliverables: 'Working API routes, test suites, database migrations',
      estimatedDuration: '2 weeks',
      dueDate: '',
      amount: 25000,
      acceptanceCriteria: 'Passing unit and integration tests, zero regression',
      status: 'PENDING',
    },
    {
      order: 3,
      title: 'Phase 3: Final Verification & Deployment',
      description: 'End-to-end integration, performance profiling, responsive polish, and documentation.',
      deliverables: 'Live deployed preview, documentation handbook, user guide',
      estimatedDuration: '1 week',
      dueDate: '',
      amount: 10000,
      acceptanceCriteria: 'Flawless production build, lighthouse score > 90',
      status: 'PENDING',
    },
  ]);

  const [showReview, setShowReview] = useState(false);
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [catRes, skillRes] = await Promise.all([
          projectApi.getCategories().catch(() => ({ data: [] })),
          projectApi.getSkills().catch(() => ({ data: [] })),
        ]);

        const categoryList = Array.isArray(catRes?.data)
          ? catRes.data
          : Array.isArray(catRes)
          ? catRes
          : [];
        if (categoryList.length > 0) {
          setCategories(categoryList);
          setCategoryId((prev) => prev || categoryList[0].id);
        }

        const skillList = Array.isArray(skillRes?.data)
          ? skillRes.data
          : Array.isArray(skillRes)
          ? skillRes
          : [];
        if (skillList.length > 0) {
          setAvailableSkills(skillList);
        }
      } catch (err) {
        console.error('Failed to load taxonomy lookups:', err);
      }
    };
    fetchLookups();
  }, []);

  const handleGenerateAiMilestones = async () => {
    if (!description.trim() && !summary.trim()) {
      setError('Please provide a detailed description or summary before requesting AI milestone suggestions.');
      return;
    }
    setError('');
    setAnalyzingAi(true);

    try {
      const res = await projectApi.generateAiMilestones({
        title: title || 'Application Project Idea',
        description: description || summary,
        budget: Number(budget) || 50000,
        durationWeeks: Number(durationValue) || 4,
      });

      if (res.data?.milestones) {
        setMilestones(
          res.data.milestones.map((m, idx) => ({
            order: idx + 1,
            title: m.title,
            description: m.description,
            deliverables: m.deliverables || 'Deliverables report',
            estimatedDuration: `${Math.max(1, Math.round(Number(durationValue) / res.data.milestones.length))} ${durationUnit}`,
            dueDate: '',
            amount: m.amount,
            acceptanceCriteria: m.acceptanceCriteria || 'Deliverables review approval',
            status: 'PENDING',
          }))
        );
      }
    } catch (err) {
      setError(err.message || 'AI milestone generation failed.');
    } finally {
      setAnalyzingAi(false);
    }
  };

  const handleAddManualMilestone = () => {
    const nextOrder = milestones.length + 1;
    const remainingBudget = Math.max(0, Number(budget) - milestones.reduce((s, m) => s + (Number(m.amount) || 0), 0));
    setMilestones([
      ...milestones,
      {
        order: nextOrder,
        title: `Phase ${nextOrder}: Deliverable Milestone`,
        description: 'Specific engineering scope, modules, and deliverables for this phase...',
        deliverables: 'Source code, API documentation, demo verification',
        estimatedDuration: `1 ${durationUnit}`,
        dueDate: '',
        amount: remainingBudget > 0 ? remainingBudget : Math.round(Number(budget) / (nextOrder || 1)),
        acceptanceCriteria: 'Code review approval and passing test suites',
        status: 'PENDING',
      },
    ]);
  };

  const handleUpdateMilestone = (index, field, value) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const handleRemoveMilestone = (index) => {
    const filtered = milestones.filter((_, i) => i !== index);
    // Re-index orders
    setMilestones(filtered.map((m, idx) => ({ ...m, order: idx + 1 })));
  };

  const handleAddReferenceLink = () => {
    if (!newLink.trim()) return;
    try {
      new URL(newLink); // Validate URL
      setReferenceLinks([...referenceLinks, newLink.trim()]);
      setNewLink('');
    } catch {
      setError('Please provide a valid URL including http:// or https://');
    }
  };

  const handleRemoveReferenceLink = (index) => {
    setReferenceLinks(referenceLinks.filter((_, i) => i !== index));
  };

  const toggleSkill = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter((id) => id !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  const totalMilestonesAmount = milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
  const budgetNum = Number(budget) || 0;
  const budgetDiff = totalMilestonesAmount - budgetNum;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (title.trim().length < 5) {
      setError('Project title must be at least 5 characters long.');
      return;
    }

    if (isFreelancer && summary.trim().length < 10) {
      setError('Project summary / idea must be at least 10 characters long.');
      return;
    }

    if (description.trim().length < 20) {
      setError('Detailed description and objectives must be at least 20 characters long.');
      return;
    }

    if (budgetNum <= 0) {
      setError('Target budget must be greater than zero.');
      return;
    }

    if (Number(durationValue) <= 0) {
      setError('Duration must be a positive integer.');
      return;
    }

    if (minBudget && maxBudget && Number(minBudget) > Number(maxBudget)) {
      setError('Minimum budget cannot exceed maximum budget.');
      return;
    }

    if (milestones.length > 0 && totalMilestonesAmount > budgetNum) {
      setError(`Total milestone allocations (₹${totalMilestonesAmount.toLocaleString('en-IN')}) exceed target budget (₹${budgetNum.toLocaleString('en-IN')}). Please balance your milestone phases.`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        summary: summary || title,
        description,
        requirements: summary || undefined,
        budget: budgetNum,
        minBudget: minBudget ? Number(minBudget) : undefined,
        maxBudget: maxBudget ? Number(maxBudget) : undefined,
        durationWeeks: Number(durationValue),
        durationUnit,
        startDate: startDate || undefined,
        targetEndDate: targetEndDate || undefined,
        categoryId: categoryId || undefined,
        skillIds: selectedSkills,
        experienceLevel,
        referenceLinks,
        milestones: milestones.map((m, idx) => ({
          title: m.title,
          description: m.description,
          deliverables: m.deliverables ? [m.deliverables] : [],
          estimatedDuration: m.estimatedDuration || `${durationValue} ${durationUnit}`,
          amount: Number(m.amount),
          dueDate: m.dueDate || undefined,
          acceptanceCriteria: m.acceptanceCriteria ? [m.acceptanceCriteria] : [],
          order: idx + 1,
          status: m.status || 'PENDING',
        })),
      };

      if (isFreelancer) {
        await projectApi.createProjectIdea(payload);
        setSuccessMsg('Project idea and milestone scope successfully saved to your workspace!');
        setTimeout(() => {
          navigate('/freelancer/projects');
        }, 1200);
      } else {
        await projectApi.createProject(payload);
        setSuccessMsg('Project published to marketplace successfully!');
        setTimeout(() => {
          navigate('/client/projects');
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to save project. Please verify inputs and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-blue-500/15 pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-500/30 mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span>PROJECT SCOPE & DECOMPOSITION</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
          {isFreelancer ? (
            <>
              <Briefcase className="w-6 h-6 text-blue-500" />
              <span>Add Project Idea & <span className="gradient-cyber-text">Scope</span></span>
            </>
          ) : (
            <span>Create New <span className="gradient-cyber-text">Project</span></span>
          )}
        </h1>
        <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
          {isFreelancer
            ? 'Define your project architecture, target budget, and estimated milestone deliverables. Stored as a private idea in your workspace.'
            : 'Specify your requirements, set a target budget, and configure phase-based milestone deliverables for marketplace candidates.'}
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-400 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Core Project Details */}
        <div className="cyber-card bg-white dark:bg-[#111726]/85 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-blue-500/20 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold">1</span>
            <span>Project Details & Objectives</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Project Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AI-Powered Freelancer Marketplace & Real-Time Analytics"
                className="w-full px-3.5 py-2 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/25 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Project Idea & Executive Summary <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief high-level summary of the proposed solution and core value proposition..."
                className="w-full px-3.5 py-2 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/25 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/25 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                  required
                >
                  {categories.length === 0 ? (
                    <option value="" disabled>Loading categories...</option>
                  ) : (
                    <option value="" disabled>Select a category</option>
                  )}
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/25 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="ENTRY">Entry Level</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Detailed Description & Objectives <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe functional modules, architecture choices, target user journeys, database requirements, and deliverables..."
                className="w-full p-3 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/25 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 leading-relaxed"
              />
            </div>

            {/* Skills & Technologies */}
            {availableSkills.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Required Skills & Technologies (Click to toggle)
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-xl border border-slate-200 dark:border-blue-500/20 bg-slate-50/50 dark:bg-[#0D1220]/70">
                  {availableSkills.slice(0, 30).map((skill) => {
                    const isSelected = selectedSkills.includes(skill.id);
                    return (
                      <button
                        type="button"
                        key={skill.id}
                        onClick={() => toggleSkill(skill.id)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                          isSelected
                            ? 'btn-electric text-white shadow-xs'
                            : 'bg-white dark:bg-[#111726] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-blue-500/20 hover:border-slate-300 dark:hover:border-blue-500/40'
                        }`}
                      >
                        {skill.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Budget & Duration Estimates */}
        <div className="cyber-card bg-white dark:bg-[#111726]/85 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-blue-500/20 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold">2</span>
            <span>Budget Estimates & Timeline</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Target Budget (₹ INR) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="500"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/25 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Min Budget Range (₹ INR)
              </label>
              <input
                type="number"
                min="0"
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/25 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Max Budget Range (₹ INR)
              </label>
              <input
                type="number"
                min="0"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/25 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Expected Duration
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  required
                  value={durationValue}
                  onChange={(e) => setDurationValue(e.target.value)}
                  className="w-20 px-3 py-2 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/25 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
                <select
                  value={durationUnit}
                  onChange={(e) => setDurationUnit(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/25 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Proposed Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/25 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Target Completion Date
              </label>
              <input
                type="date"
                value={targetEndDate}
                onChange={(e) => setTargetEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/25 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Reference Links */}
          <div className="pt-2 border-t border-slate-100 dark:border-blue-500/10">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Reference Links & Design Mocks (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="https://github.com/org/repo or https://figma.com/file/..."
                className="flex-1 px-3 py-1.5 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/25 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddReferenceLink}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors shrink-0"
              >
                + Add Link
              </button>
            </div>

            {referenceLinks.length > 0 && (
              <div className="mt-2 space-y-1">
                {referenceLinks.map((link, idx) => (
                  <div key={idx} className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/20 text-xs text-blue-600 dark:text-blue-400">
                    <span className="truncate max-w-sm">{link}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveReferenceLink(idx)}
                      className="text-slate-400 hover:text-rose-600 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Milestones & Deliverables */}
        <div className="cyber-card bg-white dark:bg-[#111726]/85 p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-blue-500/20 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-blue-500/10">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold">3</span>
                <span>Phased Milestones & Deliverables</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
                Break down work into measurable phases, deliverables, and allocated amounts.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerateAiMilestones}
              disabled={analyzingAi}
              className="px-3.5 py-1.5 rounded-lg border border-blue-300 dark:border-blue-500/40 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              {analyzingAi ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span>Groq AI Scoping Milestones...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
                  <span>AI Scoping Assistant</span>
                </>
              )}
            </button>
          </div>

          {/* Running Allocation Tracker */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Phases: </span>
                <span className="font-bold text-slate-800 dark:text-white">{milestones.length}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Milestone Total: </span>
                <span className="font-bold text-slate-800 dark:text-emerald-400">₹{totalMilestonesAmount.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Target Budget: </span>
                <span className="font-bold text-slate-800 dark:text-white">₹{budgetNum.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div>
              {budgetDiff === 0 ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  100% Balanced
                </span>
              ) : budgetDiff > 0 ? (
                <span className="text-rose-600 dark:text-rose-400 font-semibold">
                  Exceeds budget by ₹{budgetDiff.toLocaleString('en-IN')}
                </span>
              ) : (
                <span className="text-amber-700 dark:text-amber-400 font-medium">
                  ₹{Math.abs(budgetDiff).toLocaleString('en-IN')} unallocated
                </span>
              )}
            </div>
          </div>

          {milestones.length > 0 ? (
            <div className="space-y-3 pt-1">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-[#0D1220]/80 border border-slate-200/80 dark:border-blue-500/15 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      required
                      value={m.title}
                      onChange={(e) => handleUpdateMilestone(idx, 'title', e.target.value)}
                      placeholder="Milestone Phase Title (e.g. Phase 1: Database Setup)"
                      className="flex-1 px-3 py-1.5 bg-white dark:bg-[#111726] border border-slate-200 dark:border-blue-500/25 rounded-md text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">₹</span>
                      <input
                        type="number"
                        required
                        min="100"
                        value={m.amount}
                        onChange={(e) => handleUpdateMilestone(idx, 'amount', e.target.value)}
                        className="w-24 px-2 py-1.5 bg-white dark:bg-[#111726] border border-slate-200 dark:border-blue-500/25 rounded-md text-xs font-bold text-slate-900 dark:text-emerald-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove Milestone"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-0.5">Detailed Description</label>
                      <input
                        type="text"
                        value={m.description || ''}
                        onChange={(e) => handleUpdateMilestone(idx, 'description', e.target.value)}
                        placeholder="Deliverables and key technical activities..."
                        className="w-full px-3 py-1.5 bg-white dark:bg-[#111726] border border-slate-200 dark:border-blue-500/20 rounded-md text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-0.5">Deliverables</label>
                      <input
                        type="text"
                        value={m.deliverables || ''}
                        onChange={(e) => handleUpdateMilestone(idx, 'deliverables', e.target.value)}
                        placeholder="Artifacts e.g. SQL Schema, PR review, Figma mockups..."
                        className="w-full px-3 py-1.5 bg-white dark:bg-[#111726] border border-slate-200 dark:border-blue-500/20 rounded-md text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-0.5">Estimated Duration</label>
                      <input
                        type="text"
                        value={m.estimatedDuration || ''}
                        onChange={(e) => handleUpdateMilestone(idx, 'estimatedDuration', e.target.value)}
                        placeholder="e.g. 1 week, 4 days"
                        className="w-full px-3 py-1.5 bg-white dark:bg-[#111726] border border-slate-200 dark:border-blue-500/20 rounded-md text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-0.5">Target Due Date</label>
                      <input
                        type="date"
                        value={m.dueDate || ''}
                        onChange={(e) => handleUpdateMilestone(idx, 'dueDate', e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-[#111726] border border-slate-200 dark:border-blue-500/20 rounded-md text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-0.5">Acceptance Criteria</label>
                      <input
                        type="text"
                        value={m.acceptanceCriteria || ''}
                        onChange={(e) => handleUpdateMilestone(idx, 'acceptanceCriteria', e.target.value)}
                        placeholder="e.g. Passing unit test suite & approval"
                        className="w-full px-3 py-1.5 bg-white dark:bg-[#111726] border border-slate-200 dark:border-blue-500/20 rounded-md text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddManualMilestone}
                className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-blue-500/30 hover:border-blue-500 text-xs font-semibold text-slate-600 dark:text-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-1.5 bg-slate-50/50 dark:bg-[#0D1220]/40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Another Milestone Phase</span>
              </button>
            </div>
          ) : (
            <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-blue-500/20 bg-slate-50/50 dark:bg-[#0D1220]/50 space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You can draft milestone phases manually or let the scoping assistant draft them from your project description.
              </p>
              <button
                type="button"
                onClick={handleAddManualMilestone}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-blue-500/30 bg-white dark:bg-[#111726] text-xs font-medium text-slate-700 dark:text-blue-300 hover:bg-slate-50"
              >
                + Add Milestone Manually
              </button>
            </div>
          )}
        </div>

        {/* Section 4: Pre-submission Review Accordion */}
        <div className="cyber-card bg-white dark:bg-[#111726]/85 rounded-2xl border border-slate-200/90 dark:border-blue-500/20 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowReview(!showReview)}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-blue-950/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                Review Summary Before Submitting
              </span>
            </div>
            {showReview ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showReview && (
            <div className="p-5 border-t border-slate-100 dark:border-blue-500/10 bg-slate-50/50 dark:bg-[#0D1220]/70 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-slate-500 dark:text-slate-400">Title: </span>
                  <span className="font-semibold text-slate-900 dark:text-white">{title || '(Not provided)'}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-500 dark:text-slate-400">Target Budget: </span>
                  <span className="font-semibold text-slate-900 dark:text-emerald-400">₹{Number(budget).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-500 dark:text-slate-400">Duration: </span>
                  <span className="text-slate-800 dark:text-slate-200">{durationValue} {durationUnit}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-500 dark:text-slate-400">Experience Level: </span>
                  <span className="text-slate-800 dark:text-slate-200">{experienceLevel}</span>
                </div>
              </div>
              <div>
                <span className="font-medium text-slate-500 dark:text-slate-400">Summary: </span>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5">{summary || '(None)'}</p>
              </div>
              <div>
                <span className="font-medium text-slate-500 dark:text-slate-400">Milestones ({milestones.length}): </span>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-700 dark:text-slate-300">
                  {milestones.map((m, idx) => (
                    <li key={idx}>
                      <span className="font-medium text-slate-900 dark:text-white">{m.title}</span> — ₹{Number(m.amount).toLocaleString('en-IN')}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(isFreelancer ? '/freelancer/projects' : '/client/projects')}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-electric px-5 py-2.5 rounded-xl disabled:opacity-50 text-white font-semibold text-xs shadow-md flex items-center gap-1.5"
          >
            {submitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isFreelancer ? 'Save Project Idea to Workspace' : 'Publish Project to Marketplace'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProjectPage;
