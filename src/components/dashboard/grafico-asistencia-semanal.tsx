"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { SemanaAsistencia } from "@/lib/consultas/dashboard";

export function GraficoAsistenciaSemanal({
  datos,
}: {
  datos: SemanaAsistencia[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
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
          labelFormatter={(etiqueta) => `Semana del ${etiqueta}`}
        />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Bar
          dataKey="presentes"
          name="Presentes"
          stackId="asistencia"
          fill="var(--chart-3)"
          radius={[0, 0, 4, 4]}
        />
        <Bar
          dataKey="ausentes"
          name="Ausentes"
          stackId="asistencia"
          fill="var(--destructive)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
