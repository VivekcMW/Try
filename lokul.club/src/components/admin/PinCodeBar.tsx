"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";

export default function PinCodeBar({
  data,
}: {
  data: { pincode: string; count: number }[];
}) {
  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-400">
        No data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 8, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-gray-100)" />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "var(--color-gray-400)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="pincode"
          width={56}
          tick={{ fontSize: 11, fill: "var(--color-gray-600)" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 12 }}
          formatter={(v) => [v, "signups"]}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={`color-mix(in srgb, var(--color-brand-600) ${100 - i * 8}%, var(--color-brand-300))`}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
