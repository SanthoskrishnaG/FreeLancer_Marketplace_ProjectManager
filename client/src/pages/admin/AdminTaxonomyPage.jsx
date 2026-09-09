import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi.js';
import { Plus, Trash2, Tags, Layers, Sparkles } from 'lucide-react';

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Platform Taxonomy & Categorization</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Configure marketplace categories and verified engineering skill tags.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Categories Section */}
        <div className="glass-card p-6 rounded-3xl border border-gray-800 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Project Categories ({categories.length})</span>
            </h2>
          </div>

          <form onSubmit={handleCreateCategory} className="space-y-3 bg-gray-900/60 p-4 rounded-2xl border border-gray-800">
            <input
              type="text"
              required
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="New Category Name (e.g. DevOps & Cloud)"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              placeholder="Short Description..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs text-gray-300 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
          </form>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {categories.map((c) => (
              <div
                key={c.id}
                className="p-3 bg-gray-900/40 rounded-xl border border-gray-800/80 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-white">{c.name}</div>
                  <div className="text-[11px] text-gray-400">{c._count?.projects || 0} active projects</div>
                </div>
                <button
                  onClick={() => handleDeleteCategory(c.id)}
                  className="p-1 text-gray-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Section */}
        <div className="glass-card p-6 rounded-3xl border border-gray-800 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Tags className="w-5 h-5 text-purple-400" />
              <span>Verified Skills ({skills.length})</span>
            </h2>
          </div>

          <form onSubmit={handleCreateSkill} className="flex gap-2 bg-gray-900/60 p-4 rounded-2xl border border-gray-800">
            <input
              type="text"
              required
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="New Skill Tag (e.g. PyTorch, Rust, Solana)"
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/30 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          <div className="flex flex-wrap gap-2 max-h-96 overflow-y-auto p-1">
            {skills.map((s) => (
              <div
                key={s.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-900/80 border border-gray-800 text-xs text-gray-200"
              >
                <span>{s.name}</span>
                <button
                  onClick={() => handleDeleteSkill(s.id)}
                  className="text-gray-500 hover:text-rose-400 ml-1"
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
