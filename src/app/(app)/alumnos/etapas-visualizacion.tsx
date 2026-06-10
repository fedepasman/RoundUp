"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Etapa } from "@/types/ejercicios";

/**
 * Visualización del progreso en un test por etapas: muestra cuáles etapas
 * se completaron (checks) y dónde se frenó, basado en el valor registrado.
 */
export function EtapasVisualizacion({
  valor,
  etapas,
}: {
  valor: number;
  etapas: Etapa[];
}) {
  let repsAcumuladas = 0;
  const nivelAlcanzado = etapas.findIndex((e) => {
    const proximoTotal = repsAcumuladas + e.objetivo;
    if (valor >= proximoTotal) {
      repsAcumuladas = proximoTotal;
      return false;
    }
    return true;
  });

  const repsEnEtapaActual = Math.max(
    0,
    valor - repsAcumuladas,
  );

  const objetivoTotal = etapas.reduce((s, e) => s + e.objetivo, 0);
  const porcentaje =
    objetivoTotal > 0 ? Math.round((valor / objetivoTotal) * 100) : 0;

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {etapas.map((etapa, i) => {
          const completa = i < nivelAlcanzado;
          const actual = i === nivelAlcanzado;
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
            {valor}/{objetivoTotal} · {porcentaje}%
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
    </div>
  );
}
