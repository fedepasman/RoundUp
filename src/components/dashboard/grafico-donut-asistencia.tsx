"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { ResumenAsistenciaMes } from "@/lib/consultas/dashboard";

export function GraficoDonutAsistencia({
  resumen,
}: {
  resumen: ResumenAsistenciaMes;
}) {
  const datos = [
    { nombre: "Presentes", valor: resumen.presentes },
    { nombre: "Ausentes", valor: resumen.ausentes },
  ];

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={datos}
            dataKey="valor"
            nameKey="nombre"
            innerRadius={70}
            outerRadius={95}
            paddingAngle={2}
            strokeWidth={0}
          >
            <Cell fill="var(--chart-3)" />
            <Cell fill="var(--destructive)" />
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              fontSize: 13,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="numeros-marca text-4xl">
          {resumen.porcentaje !== null ? `${resumen.porcentaje}%` : "—"}
        </span>
        <span className="text-sm text-muted-foreground">asistencia</span>
      </div>
    </div>
  );
}
