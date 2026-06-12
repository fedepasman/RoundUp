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

import type { MesConteo } from "@/lib/consultas/dashboard";

export function GraficoMedicionesMes({ datos }: { datos: MesConteo[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={datos} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="etiqueta"
          tick={{ fontSize: 11 }}
          stroke="var(--muted-foreground)"
        />
        <YAxis
          tick={{ fontSize: 11 }}
          stroke="var(--muted-foreground)"
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            fontSize: 13,
          }}
          formatter={(v) => [Number(v), "Mediciones"]}
        />
        <Bar dataKey="cantidad" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
