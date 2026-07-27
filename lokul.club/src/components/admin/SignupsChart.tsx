"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

export default function SignupsChart({ data }: { data: { day: string; count: number }[] }) {
  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        No signup data yet.
      </div>
    );
  }

  const formatted = data.map((d) => ({
    date:  new Date(d.day).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    count: d.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={formatted} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-100)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "var(--color-gray-400)" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "var(--color-gray-400)" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 12 }}
          formatter={(v) => [v, "Signups"]}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="var(--color-brand-600)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "var(--color-brand-600)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
