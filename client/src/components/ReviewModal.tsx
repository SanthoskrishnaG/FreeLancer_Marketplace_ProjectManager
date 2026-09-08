import React, { useState } from 'react';
import { submitReviewApi } from '../api/review.api.js';
import { Star, X, Loader2, MessageSquareCheck } from 'lucide-react';

interface ReviewModalProps {
  contractId: string;
  contractTitle: string;
  recipientName: string;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  contractId,
  contractTitle,
  recipientName,
  isOpen,
  onClose,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim().length < 5) {
      setError('Please provide at least 5 characters in your feedback review.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await submitReviewApi({
        contractId,
        rating,
        comment: comment.trim(),
      });

      onReviewSubmitted();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'Failed to submit review. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Leave Performance Review</h3>
              <p className="text-xs text-slate-400">Reviewing {recipientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400">
              {error}
            </div>
          )}

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            <span className="text-slate-400">Contract: </span>
            <span className="text-white font-medium">{contractTitle}</span>
          </div>

          {/* Star Selector */}
          <div className="text-center space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Overall Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating !== null ? hoverRating : rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 rounded-xl hover:scale-110 active:scale-95 transition-all focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        isFilled
                          ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                          : 'text-slate-700'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-amber-400 font-bold">
              {rating === 5 && 'Outstanding / 5.0 Stars'}
              {rating === 4 && 'Very Good / 4.0 Stars'}
              {rating === 3 && 'Satisfactory / 3.0 Stars'}
              {rating === 2 && 'Needs Improvement / 2.0 Stars'}
              {rating === 1 && 'Unsatisfactory / 1.0 Stars'}
            </p>
          </div>

          {/* Comment Text Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Written Feedback & Experience
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe your working collaboration, communication, milestone deliverable quality, and technical expertise..."
              rows={4}
              required
              className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-2xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || comment.trim().length < 5}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-brand-400 hover:bg-brand-300 active:scale-95 transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <MessageSquareCheck className="w-4 h-4" /> Submit Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
