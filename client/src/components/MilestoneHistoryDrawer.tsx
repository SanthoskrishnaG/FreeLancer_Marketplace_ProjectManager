import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMilestoneHistoryApi } from '../api/milestone.api.js';
import {
  History,
  X,
  Send,
  RefreshCw,
  ExternalLink,
  FileText,
  Loader2,
  Calendar,
} from 'lucide-react';

interface MilestoneHistoryDrawerProps {
  milestoneId: string;
  milestoneTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export const MilestoneHistoryDrawer: React.FC<MilestoneHistoryDrawerProps> = ({
  milestoneId,
  milestoneTitle,
  isOpen,
  onClose,
}) => {
  const { data: milestone, isLoading } = useQuery({
    queryKey: ['milestoneHistory', milestoneId],
    queryFn: () => getMilestoneHistoryApi(milestoneId),
    enabled: isOpen && !!milestoneId,
  });

  if (!isOpen) return null;

  const submissions = milestone?.submissions || [];
  const revisions = milestone?.revisions || [];

  // Combine chronological timeline events
  type TimelineEvent =
    { type: 'SUBMISSION'; data: any; date: string } | { type: 'REVISION'; data: any; date: string };

  const timelineEvents: TimelineEvent[] = [
    ...submissions.map((s) => ({ type: 'SUBMISSION' as const, data: s, date: s.submittedAt })),
    ...revisions.map((r) => ({ type: 'REVISION' as const, data: r, date: r.createdAt })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full p-6 sm:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Milestone Audit Trail</h2>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-sm">{milestoneTitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-6 overflow-y-auto flex-1 space-y-6">
          {isLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-brand-400 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Loading history log...</p>
            </div>
          ) : timelineEvents.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              No submissions or revision requests logged for this milestone yet.
            </div>
          ) : (
            <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
              {timelineEvents.map((evt, idx) => {
                const isSubmission = evt.type === 'SUBMISSION';

                return (
                  <div key={idx} className="relative group">
                    {/* Node Dot */}
                    <div
                      className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSubmission
                          ? 'bg-brand-500 border-brand-300'
                          : 'bg-amber-500 border-amber-300'
                      }`}
                    />

                    {/* Event Box */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isSubmission
                              ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {isSubmission ? (
                            <>
                              <Send className="w-3 h-3" /> Deliverables Submitted
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3 h-3" /> Revision Requested
                            </>
                          )}
                        </span>

                        <span className="text-[11px] text-slate-500">
                          {new Date(evt.date).toLocaleString()}
                        </span>
                      </div>

                      {/* Details */}
                      {isSubmission ? (
                        <div className="space-y-3">
                          <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                            {evt.data.description}
                          </p>

                          {evt.data.links && evt.data.links.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[11px] font-semibold text-slate-400">
                                Links:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {evt.data.links.map((link: string, lIdx: number) => (
                                  <a
                                    key={lIdx}
                                    href={link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] text-brand-400 hover:text-brand-300 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800"
                                  >
                                    {link} <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {evt.data.files && evt.data.files.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[11px] font-semibold text-slate-400">
                                Files:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {evt.data.files.map((file: any) => (
                                  <a
                                    key={file.id}
                                    href={file.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 p-1.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-300 hover:text-white"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-brand-400" />
                                    <span className="truncate">{file.originalName}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs text-amber-200/90 whitespace-pre-line leading-relaxed">
                            {evt.data.feedback}
                          </p>

                          {evt.data.requestedChanges && evt.data.requestedChanges.length > 0 && (
                            <div className="space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                              <span className="text-[11px] font-semibold text-slate-300">
                                Required Changes:
                              </span>
                              <ul className="list-disc list-inside text-xs text-slate-400 space-y-0.5">
                                {evt.data.requestedChanges.map((c: string, cIdx: number) => (
                                  <li key={cIdx}>{c}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {evt.data.dueDate && (
                            <p className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              Target Date: {new Date(evt.data.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
};
