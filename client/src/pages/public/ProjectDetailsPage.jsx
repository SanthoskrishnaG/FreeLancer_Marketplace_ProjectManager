import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectApi } from '../../api/projectApi.js';
import { proposalApi } from '../../api/proposalApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  Layers,
  ShieldCheck,
  Folder,
  FolderPlus,
  FolderOpen,
  FileText,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';

export const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isFreelancer } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Title Editing State
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [savingTitle, setSavingTitle] = useState(false);
  const [titleError, setTitleError] = useState('');

  // Folder & File Management State
  const [folders, setFolders] = useState([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [newFolderModalOpen, setNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [folderError, setFolderError] = useState('');

  const [newFileModalOpen, setNewFileModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [addingFile, setAddingFile] = useState(false);

  // Proposal Form State
  const [bidAmount, setBidAmount] = useState('');
  const [estimatedDurationDays, setEstimatedDurationDays] = useState('14');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await projectApi.getProjectById(id);
      if (res.data) {
        setProject(res.data);
        setBidAmount(String(res.data.budget || ''));
        setEditTitleValue(res.data.title || '');
      }
    } catch (err) {
      console.error('Failed to load project:', err);
    }
  };

  const fetchFolders = async () => {
    try {
      setLoadingFolders(true);
      const res = await projectApi.getProjectFolders(id);
      if (res.data) {
        setFolders(res.data);
        if (res.data.length > 0 && !selectedFolderId) {
          setSelectedFolderId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load folders:', err);
    } finally {
      setLoadingFolders(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProject(), fetchFolders()]);
      setLoading(false);
    };
    init();
  }, [id]);

  const canManage =
    user &&
    (user.role === 'ADMIN' ||
      user.role === 'CLIENT' ||
      (project && (user.id === project.clientId || user.id === project.client?.userId)));

  const handleSaveTitle = async () => {
    if (!editTitleValue.trim() || editTitleValue.trim().length < 5) {
      setTitleError('Project title must be at least 5 characters');
      return;
    }
    setTitleError('');
    setSavingTitle(true);
    try {
      await projectApi.updateProject(id, { title: editTitleValue.trim() });
      setProject((prev) => ({ ...prev, title: editTitleValue.trim() }));
      setIsEditingTitle(false);
    } catch (err) {
      setTitleError(err.message || 'Failed to update title');
    } finally {
      setSavingTitle(false);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setFolderError('');
    setCreatingFolder(true);
    try {
      const res = await projectApi.createProjectFolder(id, { name: newFolderName.trim() });
      setNewFolderName('');
      setNewFolderModalOpen(false);
      await fetchFolders();
      if (res.data?.id) {
        setSelectedFolderId(res.data.id);
      }
    } catch (err) {
      setFolderError(err.message || 'Failed to create folder');
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleDeleteFolder = async (folderId, folderName) => {
    if (!window.confirm(`Are you sure you want to delete folder "${folderName}" and all its records?`)) return;
    try {
      await projectApi.deleteProjectFolder(id, folderId);
      if (selectedFolderId === folderId) {
        setSelectedFolderId(null);
      }
      await fetchFolders();
    } catch (err) {
      alert(err.message || 'Failed to delete folder');
    }
  };

  const handleAddFile = async (e) => {
    e.preventDefault();
    if (!newFileName.trim() || !selectedFolderId) return;
    setAddingFile(true);
    try {
      await projectApi.addProjectFile(id, selectedFolderId, {
        name: newFileName.trim(),
        url: newFileUrl.trim() || '#',
      });
      setNewFileName('');
      setNewFileUrl('');
      setNewFileModalOpen(false);
      await fetchFolders();
    } catch (err) {
      alert(err.message || 'Failed to add record');
    } finally {
      setAddingFile(false);
    }
  };

  const handleDeleteFile = async (folderId, fileId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await projectApi.deleteProjectFile(id, folderId, fileId);
      await fetchFolders();
    } catch (err) {
      alert(err.message || 'Failed to delete file');
    }
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await proposalApi.submitProposal({
        projectId: id,
        bidAmount: Number(bidAmount),
        estimatedDuration: `${estimatedDurationDays} days`,
        coverLetter,
        milestonePricing: (project.milestones || []).map((m) => ({
          title: m.title,
          amount: Number(m.amount),
        })),
      });

      setSuccess(true);
      setTimeout(() => {
        setModalOpen(false);
        navigate('/freelancer/proposals');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-5">
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-full h-64" />
        <Skeleton className="w-full h-40" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-md mx-auto py-20 text-center text-slate-500">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Project Not Found</h2>
        <p className="text-xs mb-5">The requested project does not exist or has been removed.</p>
        <Link to="/projects" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
          ← Back to Marketplace
        </Link>
      </div>
    );
  }

  const selectedFolder = folders.find((f) => f.id === selectedFolderId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-blue-400 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Projects</span>
      </Link>

      {/* Main Project Overview Card */}
      <div className="cyber-card p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-blue-500/20 bg-white dark:bg-[#111726]/85 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={project.status} />
              {project.category && (
                <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-500/30">
                  {project.category.name}
                </span>
              )}
            </div>

            {/* Project Title & Inline Editor */}
            {isEditingTitle ? (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-2 max-w-xl">
                  <input
                    type="text"
                    value={editTitleValue}
                    onChange={(e) => setEditTitleValue(e.target.value)}
                    placeholder="Enter project title..."
                    className="w-full px-3 py-1.5 border border-blue-500 dark:border-blue-400 rounded-lg text-sm sm:text-base font-semibold text-slate-900 dark:text-white bg-white dark:bg-[#0D1220] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTitle}
                    disabled={savingTitle || editTitleValue.trim().length < 5}
                    className="btn-electric px-3 py-1.5 rounded-lg text-white text-xs font-medium flex items-center gap-1 disabled:opacity-50 shrink-0"
                  >
                    {savingTitle ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingTitle(false);
                      setEditTitleValue(project.title);
                      setTitleError('');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium flex items-center gap-1 shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                </div>
                {titleError && <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">{titleError}</p>}
              </div>
            ) : (
              <div className="flex items-center gap-2.5 group pt-1">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
                  {project.title}
                </h1>
                {canManage && (
                  <button
                    onClick={() => {
                      setEditTitleValue(project.title);
                      setIsEditingTitle(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Project Title"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              Posted on {new Date(project.createdAt).toLocaleDateString()} by{' '}
              <span className="text-slate-800 dark:text-white font-medium">{project.client?.name || 'Verified Client'}</span>
            </p>
          </div>

          <div className="cyber-card bg-slate-50 dark:bg-[#0D1220]/90 p-5 rounded-xl border border-slate-200/80 dark:border-blue-500/25 flex flex-col items-center justify-center shrink-0 min-w-[210px] text-center shadow-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Fixed Budget</span>
            <span className="text-2xl font-black text-slate-900 dark:text-emerald-400 mt-0.5">
              ₹{Number(project.budget).toLocaleString('en-IN')}
            </span>
            <div className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Escrow Protected</span>
            </div>

            {isFreelancer && project.status === 'PUBLISHED' && (
              <button
                onClick={() => setModalOpen(true)}
                className="btn-electric mt-4 w-full py-2 px-4 rounded-lg text-white font-semibold text-xs shadow-md flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Proposal</span>
              </button>
            )}
          </div>
        </div>

        {/* Project Description */}
        <div className="border-t border-slate-100 dark:border-blue-500/10 pt-5 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-blue-400">Project Description</h2>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Required Skills */}
        {project.skills && project.skills.length > 0 && (
          <div className="border-t border-slate-100 dark:border-blue-500/10 pt-5 space-y-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-blue-400">Required Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {project.skills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-[#0D1220] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-blue-500/20"
                >
                  {s.skill?.name || s.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Project Folders & Records Section */}
      <div className="cyber-card bg-white dark:bg-[#111726]/85 p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-blue-500/20 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-blue-500/10">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Project Folders & Records</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">({folders.length} Folders)</span>
          </div>
          {canManage && (
            <button
              onClick={() => {
                setFolderError('');
                setNewFolderName('');
                setNewFolderModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-500/30 transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>New Folder</span>
            </button>
          )}
        </div>

        {loadingFolders ? (
          <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">Loading project folders...</div>
        ) : folders.length === 0 ? (
          <div className="py-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-blue-500/20 bg-slate-50/50 dark:bg-[#0D1220]/50">
            <Folder className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">No project folders created yet</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Create folders to organize specifications, deliverables, and file records for this project.
            </p>
            {canManage && (
              <button
                onClick={() => {
                  setFolderError('');
                  setNewFolderName('');
                  setNewFolderModalOpen(true);
                }}
                className="btn-electric mt-3 px-3 py-1.5 rounded-lg text-white text-xs font-medium inline-flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Folder</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Folder Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {folders.map((f) => {
                const isSelected = selectedFolderId === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFolderId(isSelected ? null : f.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-blue-500/20 hover:border-slate-300 dark:hover:border-blue-500/40 bg-white dark:bg-[#0D1220]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {isSelected ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-semibold text-slate-900 dark:text-white truncate">{f.name}</h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{(f.files || []).length} items</p>
                        </div>
                      </div>
                      {canManage && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(f.id, f.name);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Delete Folder"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Expanded Folder Detail View */}
            {selectedFolder && (
              <div className="mt-3 p-4 rounded-xl border border-slate-200 dark:border-blue-500/20 bg-slate-50/60 dark:bg-[#0D1220]/60 space-y-3">
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80 dark:border-blue-500/15">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{selectedFolder.name}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      ({(selectedFolder.files || []).length} records)
                    </span>
                  </div>
                  {canManage && (
                    <button
                      onClick={() => {
                        setNewFileName('');
                        setNewFileUrl('');
                        setNewFileModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-[#111726] border border-slate-200 dark:border-blue-500/30 hover:bg-slate-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 text-xs font-medium shadow-xs transition-colors"
                    >
                      <Plus className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span>Add Record / File</span>
                    </button>
                  )}
                </div>

                {(selectedFolder.files || []).length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-3 text-center">
                    No documents or files in this folder yet.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedFolder.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#111726]/80 border border-slate-200/70 dark:border-blue-500/15 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{file.name}</span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
                            {new Date(file.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {file.url && file.url !== '#' && (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Open Link"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {canManage && (
                            <button
                              onClick={() => handleDeleteFile(selectedFolder.id, file.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Remove Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Structured Milestones Schedule */}
      {project.milestones && project.milestones.length > 0 && (
        <div className="cyber-card bg-white dark:bg-[#111726]/85 p-6 sm:p-7 rounded-2xl border border-slate-200/90 dark:border-blue-500/20 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-blue-500/10">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Project Milestone Roadmap ({project.milestones.length} Phases)
            </h2>
          </div>
          <div className="space-y-3">
            {project.milestones.map((m, idx) => (
              <div
                key={m.id || idx}
                className="p-4 rounded-xl bg-slate-50 dark:bg-[#0D1220]/80 border border-slate-200/70 dark:border-blue-500/15 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[11px] font-semibold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-white truncate">{m.title}</h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                    ₹{Number(m.amount).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 leading-relaxed">{m.description}</p>
                {m.acceptanceCriteria && (
                  <div className="pl-7 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Acceptance criteria: {m.acceptanceCriteria}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      <Modal isOpen={newFolderModalOpen} onClose={() => setNewFolderModalOpen(false)} title="Create Project Folder">
        <form onSubmit={handleCreateFolder} className="space-y-4">
          {folderError && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{folderError}</span>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Folder Name</label>
            <input
              type="text"
              required
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g. Design Specs, Milestone 1 Deliverables, Contracts"
              className="w-full px-3 py-2 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/30 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setNewFolderModalOpen(false)}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingFolder || !newFolderName.trim()}
              className="btn-electric px-4 py-2 rounded-lg text-white font-medium text-xs shadow-sm disabled:opacity-50"
            >
              {creatingFolder ? 'Creating...' : 'Create Folder'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add File / Record Modal */}
      <Modal
        isOpen={newFileModalOpen}
        onClose={() => setNewFileModalOpen(false)}
        title="Add Document / Record to Folder"
      >
        <form onSubmit={handleAddFile} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Document / Record Name</label>
            <input
              type="text"
              required
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="e.g. System Architecture Diagram v1.pdf"
              className="w-full px-3 py-2 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/30 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Reference URL or Attachment Link (Optional)
            </label>
            <input
              type="text"
              value={newFileUrl}
              onChange={(e) => setNewFileUrl(e.target.value)}
              placeholder="e.g. https://drive.google.com/... or Figma link"
              className="w-full px-3 py-2 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/30 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setNewFileModalOpen(false)}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addingFile || !newFileName.trim()}
              className="btn-electric px-4 py-2 rounded-lg text-white font-medium text-xs shadow-sm disabled:opacity-50"
            >
              {addingFile ? 'Adding...' : 'Add Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Proposal Submission Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Submit Project Proposal">
        {success ? (
          <div className="text-center py-6 space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Proposal Submitted Successfully</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Redirecting to your proposals portfolio...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitProposal} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Proposed Bid Amount (₹ INR)
              </label>
              <div className="relative">
                <span className="text-slate-400 dark:text-slate-500 font-medium absolute left-3 top-1/2 -translate-y-1/2 text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  min="1"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/30 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Estimated Duration (Days)</label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  required
                  min="1"
                  value={estimatedDurationDays}
                  onChange={(e) => setEstimatedDurationDays(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/30 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Cover Letter & Implementation Plan
              </label>
              <textarea
                required
                rows={5}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Explain why your experience aligns with this requirement, past projects, and delivery timeline..."
                className="w-full p-3 bg-white dark:bg-[#0D1220] border border-slate-200 dark:border-blue-500/30 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-electric px-4 py-2 rounded-lg text-white font-medium text-xs shadow-sm transition-colors flex items-center gap-1.5"
              >
                {submitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Proposal</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ProjectDetailsPage;
