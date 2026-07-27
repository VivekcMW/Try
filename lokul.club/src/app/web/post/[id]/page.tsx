"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Heart, MessageCircle, Send } from "lucide-react";

const API_BASE = "";

type ApiPost = {
  id: string;
  type: string;
  body: string;
  createdAt: string;
  reactionCount: number;
  commentCount: number;
  author: { id: string; name: string; avatarUrl: string | null; kycTier: string };
  media: { kind: string; url: string }[];
  tags: string[];
};

type ApiComment = {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string; avatarUrl: string | null; kycTier: string };
  replies: ApiComment[];
};

function relativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function Avatar({ name }: { readonly name: string }) {
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
      style={{ background: "var(--color-brand-600)" }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function WebPostDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<ApiPost | null>(null);
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState("");

  const loadPost = useCallback(async () => {
    if (!params?.id) return;
    setLoading(true);
    try {
      const [postRes, cmtRes] = await Promise.all([
        fetch(`${API_BASE}/api/mobile/posts/${params.id}`),
        fetch(`${API_BASE}/api/mobile/posts/${params.id}/comments`),
      ]);

      if (postRes.ok) {
        const postData = await postRes.json();
        setPost(postData);
      } else {
        setPost(null);
      }

      if (cmtRes.ok) {
        const cmtData = await cmtRes.json();
        setComments(Array.isArray(cmtData?.items) ? cmtData.items : []);
      }
    } catch {
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"
          style={{ color: "var(--color-brand-600)" }}
        />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <h2 className="mb-2 text-lg font-bold" style={{ color: "var(--color-heading)" }}>Post not found</h2>
        <p className="mb-6 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          This post may have been deleted or is not available.
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ background: "var(--color-brand-600)" }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[color:var(--color-gray-100)]"
        >
          <ArrowLeft size={20} style={{ color: "var(--color-heading)" }} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: "var(--color-heading)" }}>Post</h1>
      </div>

      {/* Post */}
      <article
        className="mb-6 rounded-xl border p-6"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        {/* Author */}
        <div className="mb-4 flex items-center gap-3">
          <Avatar name={post.author.name} />
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold" style={{ color: "var(--color-heading)" }}>
                {post.author.name}
              </span>
              {post.author.kycTier !== "bronze" && (
                <span
                  className="rounded px-1 py-0.5 text-[9px] font-bold uppercase"
                  style={{
                    background: post.author.kycTier === "gold" ? "#FEF3C7" : "var(--color-brand-50)",
                    color: post.author.kycTier === "gold" ? "#92400E" : "var(--color-brand-700)",
                  }}
                >
                  {post.author.kycTier}
                </span>
              )}
            </div>
            <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              {relativeTime(post.createdAt)}
            </div>
          </div>
        </div>

        {/* Type badge */}
        <span
          className="mb-3 inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
          style={{ background: "var(--color-brand-50)", color: "var(--color-brand-700)" }}
        >
          {post.type}
        </span>

        {/* Body */}
        <p className="mb-4 text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
          {post.body}
        </p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span key={t} className="text-xs font-medium" style={{ color: "var(--color-brand-600)" }}>
                #{t}
              </span>
            ))}
          </div>
        )}

        <hr className="mb-4" style={{ borderColor: "var(--color-border)" }} />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLiked((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[color:var(--color-gray-100)]"
            style={{ color: liked ? "var(--color-danger)" : "var(--color-text-secondary)" }}
          >
            <Heart size={18} fill={liked ? "var(--color-danger)" : "none"} />
            {post.reactionCount + (liked ? 1 : 0)}
          </button>
        </div>
      </article>

      {/* Comments section */}
      <div className="mb-4 flex items-center gap-2">
        <MessageCircle size={18} style={{ color: "var(--color-brand-600)" }} />
        <h2 className="text-base font-bold" style={{ color: "var(--color-heading)" }}>
          {comments.length} Comments
        </h2>
      </div>

      {/* Comment input */}
      <div className="mb-6 flex gap-3">
        <input
          type="text"
          placeholder="Write a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="flex-1 rounded-lg border px-4 py-2 text-sm"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        />
        <button
          type="button"
          disabled={!comment.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-lg transition-opacity disabled:opacity-40"
          style={{ background: "var(--color-brand-600)" }}
        >
          <Send size={18} color="white" />
        </button>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((cmt) => (
          <div key={cmt.id} className="flex gap-3">
            <Avatar name={cmt.author.name} />
            <div
              className="flex-1 rounded-lg p-3"
              style={{ background: "var(--color-gray-100)" }}
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-semibold" style={{ color: "var(--color-heading)" }}>
                  {cmt.author.name}
                </span>
                <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  {relativeTime(cmt.createdAt)}
                </span>
              </div>
              <p className="text-sm" style={{ color: "var(--color-text)" }}>
                {cmt.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <div className="py-8 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
          No comments yet. Be the first to comment!
        </div>
      )}
    </div>
  );
}
