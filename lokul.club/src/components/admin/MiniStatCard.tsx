import type { LucideIcon } from "lucide-react";
import Link from "next/link";

const TONE_STYLES = {
  default: { bg: "bg-brand-50",   icon: "text-brand-600",   val: "text-gray-900" },
  success: { bg: "bg-green-50",   icon: "text-green-600",   val: "text-green-700" },
  warning: { bg: "bg-amber-50",   icon: "text-amber-600",   val: "text-amber-700" },
  danger:  { bg: "bg-red-50",     icon: "text-red-600",     val: "text-red-700"   },
  neutral: { bg: "bg-gray-100",   icon: "text-gray-500",    val: "text-gray-700"  },
  purple:  { bg: "bg-purple-50",  icon: "text-purple-600",  val: "text-purple-700"},
  teal:    { bg: "bg-teal-50",    icon: "text-teal-600",    val: "text-teal-700"  },
} as const;

type Tone = keyof typeof TONE_STYLES;

export default function MiniStatCard({
  label,
  value,
  sub,
  Icon,
  tone = "default",
  href,
}: {
  label: string;
  value: number | string;
  sub?: string;
  Icon: LucideIcon;
  tone?: Tone;
  href?: string;
}) {
  const s = TONE_STYLES[tone];

  const inner = (
    <div className={`group flex items-center gap-3 rounded-[6px] border border-border bg-surface p-3 transition-shadow hover:shadow-sm ${href ? "cursor-pointer" : ""}`}>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] ${s.bg} ${s.icon}`}>
        <Icon size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-gray-400 leading-tight">{label}</p>
        <p className={`text-xl font-bold leading-snug ${s.val}`}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {sub && <p className="truncate text-[10px] text-gray-400 leading-tight">{sub}</p>}
      </div>
    </div>
  );

  return href ? <Link href={href} className="block">{inner}</Link> : inner;
}
