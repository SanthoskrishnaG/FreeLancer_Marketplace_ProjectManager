import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi.js';
import { Plus, Trash2, Tags, Layers, Sparkles, FolderTree } from 'lucide-react';

export const AdminTaxonomyPage = () => {
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // New category state
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // New skill state
  const [skillName, setSkillName] = useState('');

  const fetchData = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        adminApi.getCategories(),
        adminApi.getSkills(),
      ]);
      if (cRes.data) setCategories(cRes.data);
      if (sRes.data) setSkills(sRes.data);
    } catch (err) {
      console.error('Failed to load taxonomy:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    try {
      await adminApi.createCategory({ name: catName, description: catDesc });
      setCatName('');
      setCatDesc('');
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await adminApi.deleteCategory(id);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    if (!skillName.trim()) return;
    try {
      await adminApi.createSkill({ name: skillName });
      setSkillName('');
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to create skill');
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm('Delete skill?')) return;
    try {
      await adminApi.deleteSkill(id);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete skill');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#3B82F6] dark:text-[#60A5FA] text-xs font-mono font-medium mb-2">
          <FolderTree className="w-3.5 h-3.5" />
          <span>MARKETPLACE ONTOLOGY & SKILLS REGISTRY</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
          Platform Taxonomy & Classification
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure marketplace categories, technical stacks, verified skills, and search taxonomy filters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Categories Section */}
        <div className="cyber-card bg-white dark:bg-[#111726]/85 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-blue-500/20 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#3B82F6]" />
              <span>Project Categories ({categories.length})</span>
            </h2>
          </div>

          <form
            onSubmit={handleCreateCategory}
            className="space-y-3 bg-slate-50 dark:bg-[#0D1220] p-4 rounded-2xl border border-slate-200 dark:border-slate-800"
          >
            <input
              type="text"
              required
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="New Category Name (e.g. Cloud Security & DevSecOps)"
              className="w-full px-3.5 py-2.5 bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
            />
            <input
              type="text"
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              placeholder="Short Description..."
              className="w-full px-3.5 py-2.5 bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
            />
            <button
              type="submit"
              className="w-full py-2.5 btn-electric text-white rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
          </form>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {categories.map((c) => (
              <div
                key={c.id}
                className="p-3.5 bg-slate-50/70 dark:bg-[#0D1220]/60 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-blue-500/30 transition-all"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC]">{c.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    {c._count?.projects || 0} active listings
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteCategory(c.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Section */}
        <div className="cyber-card bg-white dark:bg-[#111726]/85 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-blue-500/20 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
              <Tags className="w-4 h-4 text-[#8B5CF6]" />
              <span>Technical Skills ({skills.length})</span>
            </h2>
          </div>

          <form
            onSubmit={handleCreateSkill}
            className="flex gap-2 bg-slate-50 dark:bg-[#0D1220] p-4 rounded-2xl border border-slate-200 dark:border-slate-800"
          >
            <input
              type="text"
              required
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="Skill Tag (e.g. PyTorch, Rust, Solana, gRPC)"
              className="flex-1 px-3.5 py-2.5 bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 btn-electric text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto p-1">
            {skills.map((s) => (
              <div
                key={s.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-mono font-medium text-[#8B5CF6] dark:text-[#A78BFA]"
              >
                <span>{s.name}</span>
                <button
                  onClick={() => handleDeleteSkill(s.id)}
                  className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 ml-1 transition-colors"
                  title="Delete skill"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTaxonomyPage;
