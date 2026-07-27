"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

interface PaginationProps {
  page: number; // 1-based
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
  siblingCount?: number;
}

function range(start: number, end: number) {
  const arr: number[] = [];
  for (let i = start; i <= end; i++) arr.push(i);
  return arr;
}

export function Pagination({ page, pageCount, onPageChange, className, siblingCount = 1 }: PaginationProps) {
  if (pageCount <= 1) return null;
  const first = 1;
  const last = pageCount;
  const start = Math.max(first, page - siblingCount);
  const end = Math.min(last, page + siblingCount);
  const pages: (number | "...")[] = [];
  if (start > first) {
    pages.push(first);
    if (start > first + 1) pages.push("...");
  }
  pages.push(...range(start, end));
  if (end < last) {
    if (end < last - 1) pages.push("...");
    pages.push(last);
  }

  return (
    <nav aria-label="Pagination" className={cn("inline-flex items-center gap-1", className)}>
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === first}
        className="inline-flex items-center justify-center size-8 rounded border border-border text-gray-600 hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Previous"
      >
        <ChevronLeft className="size-4" />
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}-${page}`} className="px-2 text-gray-400">…</span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "min-w-8 h-8 px-2 rounded border text-sm",
              p === page
                ? "border-brand-600 bg-brand-50 text-brand-700 font-semibold"
                : "border-border text-gray-700 hover:bg-surface-muted"
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === last}
        className="inline-flex items-center justify-center size-8 rounded border border-border text-gray-600 hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Next"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
