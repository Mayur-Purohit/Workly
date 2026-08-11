import React, { useState, useEffect } from 'react';
import { X, Star, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { reviewsAPI } from '../lib/api';

/**
 * Modal for writing or editing a review.
 * - Create mode: initialReview is null
 * - Edit mode: initialReview has existing data
 */
export default function WriteReviewModal({ isOpen, onClose, onSuccess, initialReview = null, userTypeFilter = null }) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialReview) {
      setRating(initialReview.rating || 5);
      setContent(initialReview.content || '');
      setRoleTitle(initialReview.role_title || '');
      setTitle(initialReview.title || '');
    } else {
      setRating(5);
      setContent('');
      setRoleTitle('');
      setTitle('');
    }
  }, [initialReview, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return toast.error('Please write your review.');
    setSubmitting(true);
    try {
      const body = { rating, content, role_title: roleTitle, title };
      if (userTypeFilter) {
        body.user_type = userTypeFilter;
      }
      if (initialReview?.id) {
        await reviewsAPI.update(initialReview.id, body);
        toast.success('Review updated!');
      } else {
        await reviewsAPI.create(body);
        toast.success('Review submitted!');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="relative w-full max-w-lg rounded-2xl border bg-card p-6 shadow-xl"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={18} />
        </button>

        <h3 className="font-display text-lg font-semibold mb-5">
          {initialReview ? 'Edit Your Review' : 'Write a Review'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-0.5 hover:scale-110 transition-transform"
                >
                  <Star size={22} fill={s <= rating ? '#f59e0b' : 'transparent'} color="#f59e0b" />
                </button>
              ))}
              <span className="ml-2 text-xs font-semibold text-muted-foreground">{rating}/5</span>
            </div>
          </div>

          {/* Role / Headline */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Your Role (optional)</label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g. Senior Engineer, Acme"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--google-blue)]"
            />
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Game changer for hiring"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--google-blue)]"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Your Review *</label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your experience with Workly..."
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--google-blue)]"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-[var(--google-blue)] text-white text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {initialReview ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
