"use client";

import { Check, Timer } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatearSegundos } from "@/lib/tiempo";
import type { Etapa } from "@/types/ejercicios";

export function EtapasVisualizacion({
  valor,
  etapas,
  tiempo_segundos,
}: {
  valor: number;
  etapas: Etapa[];
  tiempo_segundos?: number | null;
}) {
  const objetivoTotal = etapas.reduce((s, e) => s + e.objetivo, 0);
  const completadoTodo = valor >= objetivoTotal;

  let repsAcumuladas = 0;
  let nivelAlcanzado = etapas.length;

  if (!completadoTodo) {
    nivelAlcanzado = etapas.findIndex((e) => {
      const proximoTotal = repsAcumuladas + e.objetivo;
      if (valor >= proximoTotal) {
        repsAcumuladas = proximoTotal;
        return false;
      }
      return true;
    });
    if (nivelAlcanzado === -1) nivelAlcanzado = etapas.length;
  } else {
    repsAcumuladas = objetivoTotal;
  }

  const repsEnEtapaActual = completadoTodo ? 0 : Math.max(0, valor - repsAcumuladas);
  const porcentaje = objetivoTotal > 0 ? Math.round((valor / objetivoTotal) * 100) : 0;

  // Tiempo a mostrar: el registrado, o 30 min para incompletos sin dato
  const tiempoMostrado = tiempo_segundos ?? (!completadoTodo ? 1800 : null);

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {etapas.map((etapa, i) => {
          const completa = i < nivelAlcanzado;
          const actual = !completadoTodo && i === nivelAlcanzado;
          return (
            <li
              key={i}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-2",
                completa && "border-success/40 bg-success/5",
                actual && "border-primary",
              )}
            >
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-md border",
                  completa
                    ? "border-success bg-success text-success-foreground"
                    : "border-input bg-background text-transparent",
                )}
              >
                <Check className="size-5" />
              </div>

              <span className="flex-1 text-sm font-medium">
                {i + 1}. {etapa.nombre}
              </span>

              {actual ? (
                <div className="flex items-center gap-1">
                  <span className="numeros-marca text-sm font-semibold">
                    {repsEnEtapaActual}
                  </span>
                  <span className="numeros-marca text-sm text-muted-foreground">
                    /{etapa.objetivo}
                  </span>
                </div>
              ) : (
                <span className="numeros-marca text-sm text-muted-foreground">
                  {completa ? etapa.objetivo : 0}/{etapa.objetivo}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold">Progreso</span>
          <span className="numeros-marca text-sm">
            {Math.min(valor, objetivoTotal)}/{objetivoTotal} · {porcentaje}%
          </span>
        </div>
        <div
          className="h-3 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={porcentaje}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </div>

      {tiempoMostrado !== null && (
        <div className="flex items-center justify-between rounded-lg border bg-accent px-3 py-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Timer className="size-4" />
            Tiempo
          </div>
          <span className="numeros-marca text-lg font-bold">
            {formatearSegundos(tiempoMostrado)}
          </span>
        </div>
      )}
    </div>
  );
}
