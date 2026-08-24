import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getMetaSkillsAndCategoriesApi } from '../api/profile.api.js';
import { createProjectApi } from '../api/project.api.js';
import {
  Briefcase,
  DollarSign,
  Sparkles,
  AlertCircle,
  Loader2,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

const createProjectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  requirements: z.string().optional(),
  categoryId: z.string().min(1, 'Please select a category'),
  budgetType: z.enum(['FIXED', 'HOURLY']),
  budget: z.coerce.number().positive('Budget must be greater than zero'),
  minBudget: z.coerce.number().positive().optional().nullable(),
  maxBudget: z.coerce.number().positive().optional().nullable(),
  experienceLevel: z.enum(['ENTRY', 'INTERMEDIATE', 'EXPERT']),
  deadline: z.string().optional(),
});

type ProjectFormData = z.infer<typeof createProjectSchema>;

export const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillError, setSkillError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');

  const { data: metaData, isLoading: isMetaLoading } = useQuery({
    queryKey: ['metaSkillsAndCategories'],
    queryFn: getMetaSkillsAndCategoriesApi,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      budgetType: 'FIXED',
      experienceLevel: 'INTERMEDIATE',
      budget: 1500,
    },
  });

  const budgetType = watch('budgetType');

  const createMutation = useMutation({
    mutationFn: (data: any) => createProjectApi(data),
    onSuccess: (created) => {
      navigate(`/projects/${created.id}`);
    },
  });

  const onSubmit = async (formData: ProjectFormData) => {
    if (selectedSkills.length === 0) {
      setSkillError('Please select at least 1 required skill');
      return;
    }
    setSkillError(null);

    createMutation.mutate({
      ...formData,
      skillIds: selectedSkills,
      status: submitStatus,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
    });
  };

  const toggleSkill = (skillId: string) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter((id) => id !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
      setSkillError(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 backdrop-blur-xl space-y-8">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800/80">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Post a New Project
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Specify requirements, budget, timeline, and required skills for top freelancers
            </p>
          </div>
        </div>

        {createMutation.isError && (
          <div className="flex items-center gap-2.5 p-4 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>
              {(createMutation.error as any)?.response?.data?.message || 'Failed to create project'}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Project Title */}
          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Project Title *
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder="e.g. Build an E-commerce Mobile App with Flutter and Stripe"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
            {errors.title && <p className="mt-1.5 text-xs text-rose-400">{errors.title.message}</p>}
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Category *
            </label>
            <select
              {...register('categoryId')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="">Select a Category</option>
              {metaData?.categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1.5 text-xs text-rose-400">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Project Overview & Description *
            </label>
            <textarea
              rows={5}
              {...register('description')}
              placeholder="Provide a detailed overview of the goals, user personas, and deliverables..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 leading-relaxed"
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-rose-400">{errors.description.message}</p>
            )}
          </div>

          {/* Technical Requirements */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                Technical Requirements (Optional)
              </label>
              <span className="text-[11px] text-brand-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Used by AI Milestone Generator
              </span>
            </div>
            <textarea
              rows={3}
              {...register('requirements')}
              placeholder="e.g. Next.js 14, Tailwind CSS, PostgreSQL Prisma schema, Stripe webhooks, Redis caching..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Required Skills Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Required Skills * (Click to toggle)
            </label>
            {isMetaLoading ? (
              <div className="p-4 text-center text-xs text-slate-500">Loading skills...</div>
            ) : (
              <div className="flex flex-wrap gap-2 p-3 bg-slate-950 rounded-2xl border border-slate-800 max-h-40 overflow-y-auto">
                {metaData?.skills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill.id);
                  return (
                    <button
                      type="button"
                      key={skill.id}
                      onClick={() => toggleSkill(skill.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-brand-500 text-slate-950 shadow-md'
                          : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {skill.name} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            )}
            {skillError && <p className="mt-1.5 text-xs text-rose-400">{skillError}</p>}
          </div>

          {/* Budget Configuration */}
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-brand-400" /> Budget & Experience
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Budget Type
                </label>
                <select
                  {...register('budgetType')}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  <option value="FIXED">Fixed Price Project</option>
                  <option value="HOURLY">Hourly Rate</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  {budgetType === 'HOURLY' ? 'Hourly Budget ($)' : 'Total Budget ($)'}
                </label>
                <input
                  type="number"
                  {...register('budget')}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                />
                {errors.budget && (
                  <p className="mt-1 text-[10px] text-rose-400">{errors.budget.message}</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Experience Level
                </label>
                <select
                  {...register('experienceLevel')}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  <option value="ENTRY">Entry Level</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="EXPERT">Expert Specialist</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Estimated Deadline (Optional)
              </label>
              <input
                type="date"
                {...register('deadline')}
                className="w-full sm:w-1/2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
              onClick={() => setSubmitStatus('DRAFT')}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Save as Draft
            </button>

            <button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
              onClick={() => setSubmitStatus('PUBLISHED')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-brand-400 hover:bg-brand-300 active:scale-95 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating Project...
                </>
              ) : (
                <>
                  Publish Project to Marketplace <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
