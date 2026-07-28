"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Quote, Pen, Trash2, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { reviewsAPI } from '../lib/api';
import VerifiedBadge from './VerifiedBadge';
import WriteReviewModal from './WriteReviewModal';
import toast from 'react-hot-toast';

/* ─── Accent colour cycle matching the screenshot (blue → green → red) ───── */
const ACCENT_CYCLE = [
  'var(--google-blue)',   // #4285f4
  'var(--google-green)',  // #34a853
  'var(--google-red)',    // #ea4335
  'var(--google-yellow)', // #fbbc05
  '#8b5cf6',             // purple
  '#ec4899',             // pink
];

/* ─── Role-Isolated Fallback Seed Data ─── */
const JOB_SEEKER_FALLBACKS = [
  {
    id: "fallback-js-1",
    user_type: "job_seeker",
    rating: 5,
    title: "Game changer for job hunting",
    content: "Workly turned weeks of search into days. The match score was uncannily accurate.",
    role_title: "Product Designer, Vela",
    author_name: "Maya R.",
    initials: "M",
    is_verified: true,
    is_own: false,
  },
  {
    id: "fallback-js-2",
    user_type: "job_seeker",
    rating: 5,
    title: "Calm application view",
    content: "Loved the calm pipeline view. I always knew where every application stood.",
    role_title: "Staff Engineer, Northwind",
    author_name: "Daniel O.",
    initials: "D",
    is_verified: true,
    is_own: false,
  },
  {
    id: "fallback-js-3",
    user_type: "job_seeker",
    rating: 5,
    title: "Fair salary transparency",
    content: "Salary transparency made negotiation actually fair. Got 22% above my last role.",
    role_title: "PM, Atlas Pay",
    author_name: "Priya K.",
    initials: "P",
    is_verified: true,
    is_own: false,
  },
];

const DEVELOPER_FALLBACKS = [
  {
    id: "fallback-dev-1",
    user_type: "developer",
    rating: 5,
    title: "API integration was painless",
    content: "Integrated candidate ranking endpoints into our portal in less than half a day. Stellar docs.",
    role_title: "Lead Architect, Stripe",
    author_name: "Alex R.",
    initials: "A",
    is_verified: true,
    is_own: false,
  },
  {
    id: "fallback-dev-2",
    user_type: "developer",
    rating: 5,
    title: "Lightning fast latency",
    content: "Sub-200ms response times on resume parsing REST calls. Webhooks never miss an event.",
    role_title: "Backend Engineer, Supabase",
    author_name: "Marcus T.",
    initials: "M",
    is_verified: true,
    is_own: false,
  },
  {
    id: "fallback-dev-3",
    user_type: "developer",
    rating: 5,
    title: "Robust webhook engine",
    content: "Webhooks handle high concurrency smoothly. Event retry policies gave our team total confidence.",
    role_title: "CTO, CloudPulse",
    author_name: "Elena P.",
    initials: "E",
    is_verified: true,
    is_own: false,
  },
];

const RECRUITER_FALLBACKS = [
  {
    id: "fallback-rec-1",
    user_type: "recruiter",
    rating: 5,
    title: "Reduced time-to-hire by 60%",
    content: "Workly transformed our screening pipeline. Screening 500+ resumes takes minutes instead of days.",
    role_title: "Head of Talent @ TechFlow",
    author_name: "Sarah J.",
    initials: "S",
    is_verified: true,
    is_own: false,
  },
  {
    id: "fallback-rec-2",
    user_type: "recruiter",
    rating: 5,
    title: "Accurate candidate scoring",
    content: "The skill match scoring rubric is remarkably accurate. Our engineering leads love the shortlisted candidates.",
    role_title: "Recruitment Lead @ Acme Global",
    author_name: "David K.",
    initials: "D",
    is_verified: true,
    is_own: false,
  },
  {
    id: "fallback-rec-3",
    user_type: "recruiter",
    rating: 5,
    title: "Streamlined interview rounds",
    content: "Managing multi-stage technical and behavioural assessment rounds in one unified dashboard is effortless.",
    role_title: "Talent Partner @ Solv",
    author_name: "Rachel M.",
    initials: "R",
    is_verified: true,
    is_own: false,
  },
];

function getRoleFallbacks(roleFilter) {
  if (roleFilter === 'job_seeker') return JOB_SEEKER_FALLBACKS;
  if (roleFilter === 'developer') return DEVELOPER_FALLBACKS;
  if (roleFilter === 'recruiter') return RECRUITER_FALLBACKS;
  return JOB_SEEKER_FALLBACKS;
}

/* ─── Single testimonial card (matches screenshot layout exactly) ────────── */
const TestimonialCard = ({ t, accent, onEdit, onDelete }) => (
  <div className="rounded-2xl border border-border bg-card p-5 relative group shadow-sm hover:shadow-md transition-all">
    {/* Coloured quote icon */}
    <Quote className="h-5 w-5 shrink-0" style={{ color: accent }} />

    {/* Quote body */}
    <blockquote className="mt-2 text-sm leading-relaxed text-foreground font-normal">
      &ldquo;{t.content}&rdquo;
    </blockquote>

    {/* Author row */}
    <figcaption className="mt-4 flex items-center gap-3">
      {t.author_avatar ? (
        <img
          src={t.author_avatar}
          alt={t.author_name}
          className="h-9 w-9 rounded-full object-cover border border-border shrink-0"
        />
      ) : (
        <div
          className="grid h-9 w-9 place-items-center rounded-full text-xs font-semibold text-white shrink-0"
          style={{ background: accent }}
        >
          {t.initials || 'W'}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-0.5">
          <span className="text-xs font-semibold truncate text-foreground">{t.author_name}</span>
          {t.is_verified && <VerifiedBadge size={12} />}
        </div>
        <div className="text-[11px] text-muted-foreground truncate">{t.role_title}</div>
      </div>

      {/* Own-review controls */}
      {t.is_own && (
        <div className="flex items-center gap-1 shrink-0 opacity-80 hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(t)} title="Edit" className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <Pen size={13} />
          </button>
          <button onClick={() => onDelete(t.id)} title="Delete" className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </figcaption>
  </div>
);

/* ─── Main Testimonials component ────────────────────────────────────────── */
const Testimonials = ({ userTypeFilter = null, title = 'Loved by professionals', label = 'Stories' }) => {
  const fallbacks = getRoleFallbacks(userTypeFilter);
  const [reviews, setReviews] = useState(fallbacks);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [avgRating, setAvgRating] = useState(4.8);
  const [totalCount, setTotalCount] = useState(fallbacks.length);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchReviews = useCallback(async (p = 1) => {
    try {
      const params = { page: p, limit: 6 };
      if (userTypeFilter) params.user_type = userTypeFilter;
      const data = await reviewsAPI.list(params);
      if (data && Array.isArray(data.reviews) && data.reviews.length > 0) {
        setReviews(data.reviews);
        setTotalPages(Math.ceil((data.total_count || 0) / 6) || 1);
        setAvgRating(data.average_rating ?? 4.8);
        setTotalCount(data.total_count || data.reviews.length);
      }
    } catch (err) {
      console.warn('Could not fetch live reviews, using default testimonials:', err);
    }
  }, [userTypeFilter]);

  useEffect(() => {
    fetchReviews(page);
  }, [fetchReviews, page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await reviewsAPI.remove(id);
      toast.success('Review deleted');
      fetchReviews(page);
    } catch (err) {
      toast.error(err.message || 'Failed to delete review.');
    }
  };

  const handleEdit = (r) => {
    setEditing(r);
    setModalOpen(true);
  };

  const handleWriteReview = () => {
    const token = localStorage.getItem('vish_seeker_token')
      || localStorage.getItem('vish_jwt')
      || localStorage.getItem('portal_jwt');
    if (!token) {
      toast.error('Please log in to write a review.');
      return;
    }
    setEditing(null);
    setModalOpen(true);
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--google-yellow)]">{label}</div>
          <h2 className="mt-1.5 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
            {avgRating !== null && totalCount > 0 && (
              <span className="ml-2 text-base font-normal text-muted-foreground">
                ({avgRating} avg · {totalCount} reviews)
              </span>
            )}
          </h2>
        </div>
        <button
          onClick={handleWriteReview}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-xs font-medium hover:bg-muted transition-colors shrink-0"
        >
          <MessageSquare size={14} />
          Write a Review
        </button>
      </div>

      {/* Grid */}
      <div className="grid gap-3 md:grid-cols-3">
        {reviews.map((t, idx) => (
          <TestimonialCard
            key={t.id || idx}
            t={t}
            accent={ACCENT_CYCLE[idx % ACCENT_CYCLE.length]}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-medium text-muted-foreground">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <WriteReviewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => fetchReviews(page)}
        initialReview={editing}
        userTypeFilter={userTypeFilter}
      />
    </section>
  );
};

export default Testimonials;
