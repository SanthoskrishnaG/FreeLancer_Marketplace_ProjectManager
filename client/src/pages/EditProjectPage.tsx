import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectByIdApi, updateProjectApi } from '../api/project.api.js';
import { getMetaSkillsAndCategoriesApi } from '../api/profile.api.js';
import { Briefcase, DollarSign, AlertCircle, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

const editProjectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  requirements: z.string().optional(),
  categoryId: z.string().min(1, 'Please select a category'),
  budgetType: z.enum(['FIXED', 'HOURLY']),
  budget: z.coerce.number().positive('Budget must be greater than zero'),
  experienceLevel: z.enum(['ENTRY', 'INTERMEDIATE', 'EXPERT']),
  deadline: z.string().optional(),
});

type EditFormData = z.infer<typeof editProjectSchema>;

export const EditProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillError, setSkillError] = useState<string | null>(null);

  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProjectByIdApi(id!),
    enabled: !!id,
  });

  const { data: metaData } = useQuery({
    queryKey: ['metaSkillsAndCategories'],
    queryFn: getMetaSkillsAndCategoriesApi,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditFormData>({
    resolver: zodResolver(editProjectSchema),
  });

  useEffect(() => {
    if (project) {
      reset({
        title: project.title,
        description: project.description,
        requirements: project.requirements || '',
        categoryId: project.categoryId || '',
        budgetType: project.budgetType,
        budget: Number(project.budget),
        experienceLevel: project.experienceLevel,
        deadline: project.deadline ? project.deadline.split('T')[0] : '',
      });
      setSelectedSkills(project.skills?.map((s) => s.skillId) || []);
    }
  }, [project, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateProjectApi(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['myProjects'] });
      navigate(`/projects/${id}`);
    },
  });

  const onSubmit = async (formData: EditFormData) => {
    if (selectedSkills.length === 0) {
      setSkillError('Please select at least 1 required skill');
      return;
    }
    setSkillError(null);

    updateMutation.mutate({
      ...formData,
      skillIds: selectedSkills,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
    });
  };

  const toggleSkill = (skillId: string) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter((i) => i !== skillId));
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
      setSkillError(null);
    }
  };

  if (isProjectLoading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400 mx-auto mb-2" />
        <p className="text-xs text-slate-400">Loading project details...</p>
      </div>
    );
  }

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
              Edit Project Details
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Update project specifications, requirements, budget, or skills
            </p>
          </div>
        </div>

        {updateMutation.isError && (
          <div className="flex items-center gap-2.5 p-4 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>
              {(updateMutation.error as any)?.response?.data?.message || 'Failed to update project'}
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            />
            {errors.title && <p className="mt-1.5 text-xs text-rose-400">{errors.title.message}</p>}
          </div>

          {/* Category */}
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
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Description *
            </label>
            <textarea
              rows={5}
              {...register('description')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 focus:outline-none focus:border-brand-500 leading-relaxed"
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-rose-400">{errors.description.message}</p>
            )}
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Technical Requirements
            </label>
            <textarea
              rows={3}
              {...register('requirements')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Required Skills *
            </label>
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
            {skillError && <p className="mt-1.5 text-xs text-rose-400">{skillError}</p>}
          </div>

          {/* Budget & Experience */}
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
                  <option value="FIXED">Fixed Price</option>
                  <option value="HOURLY">Hourly</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Budget ($)
                </label>
                <input
                  type="number"
                  {...register('budget')}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
                />
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
                  <option value="EXPERT">Expert</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Deadline (Optional)
              </label>
              <input
                type="date"
                {...register('deadline')}
                className="w-full sm:w-1/2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting || updateMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-brand-400 hover:bg-brand-300 active:scale-95 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  Save Changes <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
