"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS: Record<string, string> = {
  resident: "var(--color-brand-600)",
  merchant: "var(--color-accent-500)",
  rwa:      "var(--color-success)",
};

const LABELS: Record<string, string> = {
  resident: "Residents",
  merchant: "Merchants",
  rwa:      "RWAs",
};

export default function RoleDonut({
  data,
}: {
  data: { role: string; count: number }[];
}) {
  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        No data yet.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name:  LABELS[d.role] ?? d.role,
    value: d.count,
    color: COLORS[d.role] ?? "#94a3b8",
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 12 }}
          formatter={(v) => [v, "signups"]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: "var(--color-gray-500)" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
