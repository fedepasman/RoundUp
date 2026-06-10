"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calcularMejora, formatearValor } from "@/lib/evolucion";
import { formatearFecha } from "@/lib/fechas";
import { cn } from "@/lib/utils";
import type { DireccionRanking, TipoMedicion } from "@/types/ejercicios";

export type ValorMedido = {
  modulo_id: string;
  modulo_nombre: string;
  tipo_medicion: TipoMedicion;
  direccion_ranking: DireccionRanking;
  unidad: string | null;
  orden: number;
  valor: number;
};

export type MedicionHistorial = {
  id: string;
  fecha: string;
  ejercicio_id: string;
  ejercicio_nombre: string;
  valores: ValorMedido[];
};

export function EvolucionAlumno({
  mediciones,
}: {
  mediciones: MedicionHistorial[];
}) {
  const ejercicios = [
    ...new Map(
      mediciones.map((m) => [m.ejercicio_id, m.ejercicio_nombre]),
    ).entries(),
  ];
  const [ejercicioId, setEjercicioId] = useState(ejercicios[0]?.[0] ?? "");

  if (!mediciones.length) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          Todavía no hay mediciones registradas. Cargá la primera desde
          “Cargar medición”.
        </CardContent>
      </Card>
    );
  }

  // Mediciones del ejercicio elegido, de la más vieja a la más nueva.
  const delEjercicio = mediciones
    .filter((m) => m.ejercicio_id === ejercicioId)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const modulos = delEjercicio.at(-1)?.valores ?? [];

  return (
    <div className="flex flex-col gap-4">
      {ejercicios.length > 1 && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="ejercicio-evolucion">Ejercicio</Label>
          <Select value={ejercicioId} onValueChange={setEjercicioId}>
            <SelectTrigger id="ejercicio-evolucion" className="h-12 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ejercicios.map(([id, nombre]) => (
                <SelectItem key={id} value={id}>
                  {nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Una tarjeta por módulo: última marca, % de mejora y gráfico */}
      {modulos
        .slice()
        .sort((a, b) => a.orden - b.orden)
        .map((modulo) => {
          const serie = delEjercicio
            .map((m) => {
              const v = m.valores.find(
                (x) => x.modulo_id === modulo.modulo_id,
              );
              return v
                ? { fecha: m.fecha, valor: v.valor, tipo: v.tipo_medicion }
                : null;
            })
            .filter((p) => p !== null);

          const actual = serie.at(-1);
          const anterior = serie.at(-2);
          const mejora =
            actual && anterior
              ? calcularMejora(
                  anterior.valor,
                  actual.valor,
                  modulo.direccion_ranking,
                )
              : null;

          return (
            <Card key={modulo.modulo_id}>
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">
                      {modulo.modulo_nombre}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {serie.length}{" "}
                      {serie.length === 1 ? "medición" : "mediciones"}
                      {modulo.unidad ? ` · ${modulo.unidad}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="numeros-marca text-2xl">
                      {actual
                        ? formatearValor(actual.valor, modulo.tipo_medicion)
                        : "—"}
                    </p>
                    {mejora !== null && (
                      <p
                        className={cn(
                          "flex items-center justify-end gap-1 text-xs font-semibold",
                          mejora >= 0 ? "text-success" : "text-destructive",
                        )}
                      >
                        {mejora >= 0 ? (
                          <TrendingUp className="size-3" />
                        ) : (
                          <TrendingDown className="size-3" />
                        )}
                        {mejora > 0 ? "+" : ""}
                        {mejora}% vs anterior
                      </p>
                    )}
                  </div>
                </div>

                {serie.length >= 2 && (
                  <ResponsiveContainer width="100%" height={140}>
                    <LineChart
                      data={serie}
                      margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                      />
                      <XAxis
                        dataKey="fecha"
                        tickFormatter={(f: string) =>
                          formatearFecha(f).slice(0, 5)
                        }
                        tick={{ fontSize: 11 }}
                        stroke="var(--muted-foreground)"
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        stroke="var(--muted-foreground)"
                        tickFormatter={(v: number) =>
                          formatearValor(v, modulo.tipo_medicion)
                        }
                        width={48}
                        domain={["auto", "auto"]}
                      />
                      <Tooltip
                        formatter={(v) => [
                          formatearValor(Number(v), modulo.tipo_medicion),
                          modulo.modulo_nombre,
                        ]}
                        labelFormatter={(f) => formatearFecha(String(f))}
                      />
                      <Line
                        type="monotone"
                        dataKey="valor"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "var(--primary)" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          );
        })}

      {/* Historial completo del ejercicio */}
      <Card>
        <CardContent className="flex flex-col p-4">
          <p className="pb-2 text-sm font-semibold">Historial</p>
          {delEjercicio
            .slice()
            .reverse()
            .map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-2 border-b py-2 text-sm last:border-b-0"
              >
                <span className="shrink-0 text-muted-foreground">
                  {formatearFecha(m.fecha)}
                </span>
                <span className="numeros-marca text-right">
                  {m.valores
                    .slice()
                    .sort((a, b) => a.orden - b.orden)
                    .map((v) => formatearValor(v.valor, v.tipo_medicion))
                    .join(" · ")}
                </span>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
