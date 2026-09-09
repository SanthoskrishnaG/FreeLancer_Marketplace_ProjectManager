import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/authApi.js';
import { chatApi } from '../../api/chatApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import {
  Star,
  CheckCircle2,
  DollarSign,
  Briefcase,
  MessageSquare,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const FreelancerProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isClient } = useAuth();

  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authApi.getFreelancerById(id);
        if (res.data) setFreelancer(res.data);
      } catch (err) {
        console.error('Error fetching freelancer profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleStartChat = async () => {
    try {
      await chatApi.getOrCreateConversation(id);
      navigate(isClient ? '/client/messages' : '/freelancer/messages');
    } catch (err) {
      console.error('Failed to initiate conversation:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="w-1/4 h-6" />
        <Skeleton className="w-full h-48" />
        <Skeleton className="w-full h-64" />
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="max-w-md mx-auto py-20 text-center text-gray-400">
        <h2 className="text-xl font-bold text-white mb-2">Profile Not Found</h2>
        <Link to="/freelancers" className="text-purple-400 hover:underline">
          Back to Directory
        </Link>
      </div>
    );
  }

  const profile = freelancer.freelancerProfile || {};

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Link
        to="/freelancers"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Freelancers Directory
      </Link>

      {/* Header Profile Card */}
      <div className="glass-card p-8 rounded-3xl border border-gray-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <img
              src={freelancer.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${freelancer.name}`}
              alt={freelancer.name}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-purple-500/30 shrink-0"
            />
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold text-white">{freelancer.name}</h1>
                {profile.isVerified && (
                  <span className="inline-flex items-center gap-1 text-xs text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-purple-400">{profile.title || 'Full Stack Engineer'}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
                <div className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{Number(profile.rating || 5.0).toFixed(1)}</span>
                </div>
                <span>•</span>
                <span>{profile.completedProjectsCount || 0} completed contracts</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">${profile.hourlyRate || 45}/hour</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            {user && user.id !== freelancer.id && (
              <button
                onClick={handleStartChat}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message Freelancer</span>
              </button>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="border-t border-gray-800/80 pt-6 space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">About</h3>
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
            {profile.bio || 'Specialized in building full-stack applications with modern web technologies, AI pipelines, and responsive user interfaces.'}
          </p>
        </div>

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="border-t border-gray-800/80 pt-6 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300">Skills & Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20"
                >
                  {s.skill?.name || s.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Portfolio Items */}
      {profile.portfolioItems && profile.portfolioItems.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Portfolio Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.portfolioItems.map((item) => (
              <div key={item.id} className="glass-card p-5 rounded-2xl border border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  {item.projectUrl && (
                    <a
                      href={item.projectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-400 hover:text-white"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {freelancer.freelancerReviews && freelancer.freelancerReviews.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Client Reviews</h2>
          <div className="space-y-3">
            {freelancer.freelancerReviews.map((rev) => (
              <div key={rev.id} className="glass-card p-5 rounded-2xl border border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{rev.reviewer?.name}</span>
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-500">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-300 italic">"{rev.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
