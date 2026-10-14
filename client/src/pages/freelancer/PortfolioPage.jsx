import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Briefcase, Plus, ExternalLink, Trash2, Code2, Globe, Sparkles } from 'lucide-react';
import { Modal } from '../../components/common/Modal.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';

export const PortfolioPage = () => {
  const { user } = useAuth();
  const [portfolioItems, setPortfolioItems] = useState(
    user?.freelancerProfile?.portfolioItems || []
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectUrl, setProjectUrl] = useState('');

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      title,
      description,
      projectUrl,
    };

    setPortfolioItems([...portfolioItems, newItem]);
    setModalOpen(false);
    setTitle('');
    setDescription('');
    setProjectUrl('');
  };

  const handleRemove = (id) => {
    setPortfolioItems(portfolioItems.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#3B82F6] dark:text-[#60A5FA] text-xs font-mono font-medium mb-2">
            <Code2 className="w-3.5 h-3.5" />
            <span>ENGINEERING SHOWCASE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
            Engineering Portfolio & Project Artifacts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Display your production web applications, open-source repositories, and verified client deliverables.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-electric self-start sm:self-auto flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project</span>
        </button>
      </div>

      {portfolioItems.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No portfolio items published"
          description="Elevate your profile visibility by adding flagship projects, live architectures, and GitHub links."
          action={
            <button
              onClick={() => setModalOpen(true)}
              className="btn-electric px-5 py-2.5 rounded-xl text-xs font-semibold"
            >
              Add Your First Project
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolioItems.map((item) => (
            <div
              key={item.id}
              className="cyber-card bg-white dark:bg-[#111726]/85 p-6 rounded-2xl border border-slate-200 dark:border-blue-500/20 shadow-sm space-y-4 flex flex-col justify-between hover:border-blue-500/40 dark:hover:border-blue-500/50 transition-all duration-300 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] group-hover:text-[#3B82F6] dark:group-hover:text-[#60A5FA] transition-colors">
                    {item.title}
                  </h3>
                  {item.projectUrl && (
                    <a
                      href={item.projectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#3B82F6] dark:hover:text-[#60A5FA] transition-colors shrink-0"
                      title="Open external project"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                {item.projectUrl ? (
                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate max-w-[200px]">
                    {item.projectUrl.replace(/^https?:\/\//, '')}
                  </span>
                ) : <span />}

                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 text-xs flex items-center gap-1 transition-colors ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Portfolio Showcase Project">
        <form onSubmit={handleAddItem} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Project Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Real-Time Trading Engine or AI Copilot"
              className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Live Demo / GitHub Repository URL
            </label>
            <input
              type="url"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Architecture & Stack Overview
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the engineering challenges, core technologies (React, Node, PostgreSQL, WebSockets), and performance outcomes..."
              className="w-full p-3.5 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-electric px-5 py-2 rounded-xl text-xs font-semibold"
            >
              Add to Portfolio
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PortfolioPage;
