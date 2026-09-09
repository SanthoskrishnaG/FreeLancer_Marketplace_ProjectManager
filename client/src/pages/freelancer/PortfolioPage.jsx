import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { authApi } from '../../api/authApi.js';
import { Briefcase, Plus, ExternalLink, Trash2, FolderPlus } from 'lucide-react';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Portfolio Showcase</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Demonstrate your past engineering achievements to prospective clients.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project</span>
        </button>
      </div>

      {portfolioItems.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No portfolio items added"
          description="Stand out from the crowd by adding your top projects, open-source repositories, or deployed web applications."
          action={
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold"
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
              className="glass-card p-6 rounded-3xl border border-gray-800 space-y-3 flex flex-col justify-between hover:border-purple-500/40 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  {item.projectUrl && (
                    <a
                      href={item.projectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-gray-400 hover:text-white"
                      title="Open external project"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-800 flex justify-end">
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-gray-500 hover:text-rose-400 text-xs flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Portfolio Project">
        <form onSubmit={handleAddItem} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Project Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Real-Time Trading Engine"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Live Demo / Repository URL</label>
            <input
              type="url"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Description & Technologies</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your role, core challenges solved, tech stack, and achievements..."
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30"
            >
              Add to Portfolio
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
