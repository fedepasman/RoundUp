"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MesConteo } from "@/lib/consultas/dashboard";

export function GraficoAltasAlumnos({ datos }: { datos: MesConteo[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={datos} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
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
          formatter={(v) => [Number(v), "Altas"]}
        />
        <Line
          type="monotone"
          dataKey="cantidad"
          stroke="var(--chart-2)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--chart-2)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
