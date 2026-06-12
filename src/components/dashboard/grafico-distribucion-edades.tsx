"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function GraficoDistribucionEdades({
  datos,
}: {
  datos: { rango: string; cantidad: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={datos}
        layout="vertical"
        margin={{ top: 8, right: 16, bottom: 0, left: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          type="number"
          tick={{ fontSize: 11 }}
          stroke="var(--muted-foreground)"
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="rango"
          tick={{ fontSize: 12 }}
          stroke="var(--muted-foreground)"
          width={64}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            fontSize: 13,
          }}
          formatter={(v) => [Number(v), "Alumnos"]}
        />
        <Bar dataKey="cantidad" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
