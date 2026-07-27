import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui";

export default function StatCard({
  label,
  value,
  sub,
  Icon,
  trend,
}: {
  label: string;
  value: number | string;
  sub?: string;
  Icon: LucideIcon;
  trend?: "up" | "down" | "flat";
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-success" : trend === "down" ? "text-danger" : "text-gray-400";

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-1.5 text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-brand-50 text-brand-600">
          <Icon size={18} />
        </span>
      </div>
      {trend && (
        <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${trendColor}`}>
          <TrendIcon size={12} />
          {trend === "up" ? "Growing" : trend === "down" ? "Declining" : "Stable"}
        </div>
      )}
    </Card>
  );
}
