import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitMilestoneApi } from '../api/milestone.api.js';
import { Milestone, FileItem } from '../types/index.js';
import { FileUploadComponent } from './FileUploadComponent.js';
import {
  Send,
  X,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Link as LinkIcon,
  FileText,
} from 'lucide-react';

const submitSchema = z.object({
  description: z.string().min(10, 'Submission summary must be at least 10 characters'),
  notes: z.string().optional(),
});

type SubmitFormData = z.infer<typeof submitSchema>;

interface SubmitMilestoneModalProps {
  milestone: Milestone;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SubmitMilestoneModal: React.FC<SubmitMilestoneModalProps> = ({
  milestone,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [links, setLinks] = useState<string[]>(['']);
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubmitFormData>({
    resolver: zodResolver(submitSchema),
  });

  const submitMutation = useMutation({
    mutationFn: (data: any) => submitMilestoneApi(milestone.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract', milestone.contractId] });
      queryClient.invalidateQueries({ queryKey: ['milestoneHistory', milestone.id] });
      if (onSuccess) onSuccess();
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleLinkChange = (index: number, val: string) => {
    const updated = [...links];
    updated[index] = val;
    setLinks(updated);
  };

  const handleAddLink = () => {
    setLinks([...links, '']);
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const onSubmit = (formData: SubmitFormData) => {
    const validLinks = links.map((l) => l.trim()).filter(Boolean);
    const fileIds = uploadedFiles.map((f) => f.id);

    submitMutation.mutate({
      description: formData.description,
      notes: formData.notes,
      links: validLinks,
      fileIds,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Submit Milestone Deliverables</h2>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-md">
                {milestone.title} (${Number(milestone.amount).toLocaleString()})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitMutation.isError && (
          <div className="flex items-center gap-2.5 p-3.5 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              {(submitMutation.error as any)?.response?.data?.message ||
                'Failed to submit milestone'}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 overflow-y-auto pr-1 flex-1">
          {/* Deliverables Description */}
          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-brand-400" /> Work Summary & Deliverables *
            </label>
            <textarea
              rows={4}
              {...register('description')}
              placeholder="Describe what was built, key features completed, test results, and instructions for client verification..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 leading-relaxed"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-400">{errors.description.message}</p>
            )}
          </div>

          {/* External Links */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4 text-brand-400" /> Deliverable Links (Github, Figma,
                Staging URL)
              </label>
              <button
                type="button"
                onClick={handleAddLink}
                className="text-[11px] text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Link
              </button>
            </div>

            <div className="space-y-2">
              {links.map((link, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => handleLinkChange(idx, e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                  {links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(idx)}
                      className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* File Upload Component */}
          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Attach Deliverable Files (ZIP, PDF, Screenshots)
            </label>
            <FileUploadComponent
              entityType="MILESTONE"
              entityId={milestone.id}
              maxFiles={5}
              onFilesUploaded={(files) => setUploadedFiles(files)}
            />
          </div>

          {/* Extra Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
              Additional Notes for Client (Optional)
            </label>
            <textarea
              rows={2}
              {...register('notes')}
              placeholder="Credentials, test accounts, or environment variables..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-brand-400 hover:bg-brand-300 active:scale-95 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  Submit Work for Review <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
