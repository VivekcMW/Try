"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import type { SearchResult } from "@/lib/admin-platform";

export default function AdminGlobalSearch() {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results ?? []);
          setOpen(true);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 rounded-[6px] border border-gray-200 bg-gray-50 px-3 py-1.5">
        <Search size={13} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search users, societies…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
        />
        {loading && (
          <span className="h-3 w-3 animate-spin rounded-[6px] border-2 border-brand-500 border-t-transparent" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-[6px] border border-gray-200 bg-white shadow-lg">
          {results.map(r => (
            <Link
              key={r.id}
              href={r.href}
              onClick={() => { setOpen(false); setQuery(""); }}
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50"
            >
              <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-600">{r.kind}</span>
              <span className="font-medium text-gray-800">{r.label}</span>
              <span className="ml-auto text-xs text-gray-400">{r.sub}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
