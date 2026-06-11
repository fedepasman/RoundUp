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
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EtapasVisualizacion } from "@/app/(app)/alumnos/etapas-visualizacion";
import { calcularMejora, formatearValor, formatearValorConTiempo } from "@/lib/evolucion";
import { formatearEtapas } from "@/lib/etapas";
import { formatearFecha } from "@/lib/fechas";
import { cn } from "@/lib/utils";
import type {
  DireccionRanking,
  Etapa,
  TipoMedicion,
} from "@/types/ejercicios";

export type ValorMedido = {
  modulo_id: string;
  modulo_nombre: string;
  tipo_medicion: TipoMedicion;
  direccion_ranking: DireccionRanking;
  unidad: string | null;
  orden: number;
  etapas: Etapa[] | null;
  valor: number;
  tiempo_segundos: number | null;
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
  posiciones = {},
  posicionesTotales = {},
  ejercicioIdInicial,
}: {
  mediciones: MedicionHistorial[];
  posiciones?: Record<string, { posicion: number; total: number }>;
  posicionesTotales?: Record<string, { posicion: number; total: number }>;
  ejercicioIdInicial?: string;
}) {
  const ejercicios = [
    ...new Map(
      mediciones.map((m) => [m.ejercicio_id, m.ejercicio_nombre]),
    ).entries(),
  ];
  const [ejercicioId, setEjercicioId] = useState(
    ejercicioIdInicial && ejercicios.some((e) => e[0] === ejercicioIdInicial)
      ? ejercicioIdInicial
      : ejercicios[0]?.[0] ?? "",
  );
  const [indiceMedicion, setIndiceMedicion] = useState(0);

  const handleChangeEjercicio = (v: string) => {
    setEjercicioId(v);
    setIndiceMedicion(0);
  };

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

  // Limitar índice si está fuera de rango
  const indiceValido = Math.min(indiceMedicion, delEjercicio.length - 1);
  const modulos = delEjercicio[indiceValido]?.valores ?? [];

  return (
    <div className="flex flex-col gap-4">
      {ejercicios.length > 1 && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="ejercicio-evolucion">Ejercicio</Label>
          <Select value={ejercicioId} onValueChange={handleChangeEjercicio}>
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

      {/* Navegación de mediciones cuando hay múltiples */}
      {delEjercicio.length > 1 && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={indiceMedicion === 0}
            onClick={() => setIndiceMedicion(indiceMedicion - 1)}
          >
            <ChevronLeft className="mr-1 size-4" />
            Anterior
          </Button>
          <div className="flex flex-1 items-center justify-center text-xs text-muted-foreground">
            {Math.min(indiceMedicion, delEjercicio.length - 1) + 1} de {delEjercicio.length}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            disabled={indiceMedicion >= delEjercicio.length - 1}
            onClick={() => setIndiceMedicion(indiceMedicion + 1)}
          >
            Siguiente
            <ChevronRight className="ml-1 size-4" />
          </Button>
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
                ? { fecha: m.fecha, valor: v.valor, tipo: v.tipo_medicion, tiempo_segundos: v.tiempo_segundos }
                : null;
            })
            .filter((p) => p !== null);

          const actual = serie[indiceValido] ?? serie.at(-1);
          const anterior = indiceValido > 0 ? serie[indiceValido - 1] : null;
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
                    {posiciones[modulo.modulo_id] &&
                      posiciones[modulo.modulo_id].total > 1 && (
                        <p className="pt-1 text-xs font-semibold text-primary">
                          #{posiciones[modulo.modulo_id].posicion} de{" "}
                          {posiciones[modulo.modulo_id].total} en el ranking
                        </p>
                      )}
                  </div>
                  <div className="text-right">
                    <p className="numeros-marca text-2xl">
                      {actual
                        ? modulo.etapas
                          ? formatearEtapas(actual.valor, modulo.etapas)
                          : actual.tiempo_segundos
                            ? formatearValorConTiempo(
                                actual.valor,
                                modulo.tipo_medicion,
                                actual.tiempo_segundos,
                              )
                            : formatearValor(actual.valor, modulo.tipo_medicion)
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

                {/* Desglose de etapas para módulos con etapas */}
                {modulo.etapas && actual && (
                  <EtapasVisualizacion valor={actual.valor} etapas={modulo.etapas} />
                )}

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

      {/* Tarjeta de total general (solo si hay más de un módulo) */}
      {modulos.length > 1 && (() => {
        const tipoTotal = modulos[0]?.tipo_medicion ?? "numero";
        const serieTotales = delEjercicio.map((m) => ({
          fecha: m.fecha,
          valor: m.valores.reduce((s, v) => s + v.valor, 0),
        }));
        const actual = serieTotales[indiceValido] ?? serieTotales.at(-1);
        const anterior = indiceValido > 0 ? serieTotales[indiceValido - 1] : null;
        const mejora =
          actual && anterior
            ? calcularMejora(anterior.valor, actual.valor, "desc")
            : null;
        const posTotal = posicionesTotales[ejercicioId];
        return (
          <Card>
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">Total general</p>
                  <p className="text-xs text-muted-foreground">
                    {serieTotales.length}{" "}
                    {serieTotales.length === 1 ? "medición" : "mediciones"}{" "}
                    · suma de {modulos.length} módulos
                  </p>
                  {posTotal && posTotal.total > 1 && (
                    <p className="pt-1 text-xs font-semibold text-primary">
                      #{posTotal.posicion} de {posTotal.total} en el ranking
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="numeros-marca text-2xl">
                    {actual ? formatearValor(actual.valor, tipoTotal) : "—"}
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
              {serieTotales.length >= 2 && (
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart
                    data={serieTotales}
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
                        formatearValor(v, tipoTotal)
                      }
                      width={48}
                      domain={["auto", "auto"]}
                    />
                    <Tooltip
                      formatter={(v) => [
                        formatearValor(Number(v), tipoTotal),
                        "Total",
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
      })()}

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
                  {(() => {
                    const sorted = m.valores
                      .slice()
                      .sort((a, b) => a.orden - b.orden);
                    const partes = sorted.map((v) =>
                      v.etapas
                        ? formatearEtapas(v.valor, v.etapas)
                        : v.tiempo_segundos
                          ? formatearValorConTiempo(
                              v.valor,
                              v.tipo_medicion,
                              v.tiempo_segundos,
                            )
                          : formatearValor(v.valor, v.tipo_medicion),
                    );
                    if (sorted.length <= 1) return partes.join(" · ");
                    const total = sorted.reduce((s, v) => s + v.valor, 0);
                    const tipo = sorted[0]?.tipo_medicion ?? "numero";
                    return `${partes.join(" · ")} = ${formatearValor(total, tipo)}`;
                  })()}
                </span>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
