"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  CloudRain,
  ExternalLink,
  Globe,
  HeartPulse,
  MapPin,
  Newspaper,
  ShieldAlert,
} from "lucide-react";
import { Badge, Card } from "@/components/ui";
import type { LocalityNews } from "@/generated/prisma/client";

// ── Category helpers ──────────────────────────────────────────────────────────

type NewsCategory = "civic" | "safety" | "weather" | "health" | "transport" | "local";

const CAT_META: Record<
  NewsCategory,
  {
    label: string;
    tone: "neutral" | "brand" | "success" | "warning" | "danger" | "info";
    Icon: React.ComponentType<{ size?: number; className?: string }>;
  }
> = {
  civic:     { label: "Civic",     tone: "brand",   Icon: Building2   },
  safety:    { label: "Safety",    tone: "danger",  Icon: ShieldAlert },
  weather:   { label: "Weather",   tone: "info",    Icon: CloudRain   },
  health:    { label: "Health",    tone: "success", Icon: HeartPulse  },
  transport: { label: "Traffic",   tone: "warning", Icon: MapPin      },
  local:     { label: "Local",     tone: "neutral", Icon: Globe       },
};

function relativeAge(date: Date): string {
  const diff = Math.max(0, Date.now() - date.getTime());
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export interface LocalityNewsWidgetProps {
  items: LocalityNews[];
}

export default function LocalityNewsWidget({ items }: LocalityNewsWidgetProps) {
  if (!items.length) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-gray-100">
              <Newspaper size={14} className="text-gray-500" />
            </div>
            <p className="text-sm font-semibold text-gray-700">Locality News Cache</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 py-8 text-center text-gray-400">
          <Newspaper size={32} className="opacity-30" />
          <p className="text-sm">No cached news yet. Cron runs every 30 minutes.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-blue-50">
            <Newspaper size={14} className="text-blue-600" />
          </div>
          <p className="text-sm font-semibold text-gray-700">Locality News Cache</p>
          <span className="ml-1 rounded-[6px] bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
            {items.length}
          </span>
        </div>
        <span className="text-xs text-gray-400">Auto-refreshed every 30 min</span>
      </div>

      {/* Item list */}
      <ul className="divide-y divide-gray-100">
        {items.map((item) => {
          const cat = (item.category as NewsCategory) ?? "local";
          const meta = CAT_META[cat] ?? CAT_META.local;
          const CatIcon = meta.Icon;

          return (
            <li key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              {/* Alert vs normal icon */}
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] ${
                  item.isAlert ? "bg-red-50" : "bg-gray-100"
                }`}
              >
                {item.isAlert ? (
                  <AlertTriangle size={13} className="text-red-500" />
                ) : (
                  <CatIcon size={13} className="text-gray-500" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                {/* Headline */}
                <p className="truncate text-sm font-medium text-gray-800">{item.headline}</p>

                {/* Meta row */}
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge tone={meta.tone} size="sm">{meta.label}</Badge>
                  <span className="text-xs text-gray-400">
                    {item.city} · {item.pinCode}
                  </span>
                  <span className="text-xs text-gray-400">{relativeAge(item.publishedAt)}</span>
                </div>
              </div>

              {/* Source link */}
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={item.sourceName}
                className="ml-1 mt-1 shrink-0 text-gray-400 hover:text-blue-600 transition-colors"
                aria-label={`Open source: ${item.sourceName}`}
              >
                <ExternalLink size={13} />
              </a>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
