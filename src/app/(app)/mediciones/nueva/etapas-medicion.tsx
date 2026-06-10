"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Etapa } from "@/types/ejercicios";

/**
 * Carga de un test por etapas (escalera): se marcan las etapas completas
 * y, en la etapa donde se frenó, se cargan las reps parciales. Mantiene un
 * input oculto `valor_<moduloId>` con el total de reps para el form padre.
 */
export function EtapasMedicion({
  moduloId,
  etapas,
}: {
  moduloId: string;
  etapas: Etapa[];
}) {
  // nivel = cantidad de etapas completas; la etapa `nivel` es la parcial.
  const [nivel, setNivel] = useState(0);
  const [parcial, setParcial] = useState(0);

  const objetivoTotal = etapas.reduce((s, e) => s + e.objetivo, 0);
  const completas = etapas
    .slice(0, nivel)
    .reduce((s, e) => s + e.objetivo, 0);
  const total = completas + (nivel < etapas.length ? parcial : 0);
  const porcentaje =
    objetivoTotal > 0 ? Math.round((total / objetivoTotal) * 100) : 0;

  function alternar(indice: number) {
    if (indice < nivel) {
      // Destildar: frené en esta etapa.
      setNivel(indice);
      setParcial(0);
    } else {
      // Tildar: completé hasta esta etapa inclusive.
      setNivel(indice + 1);
      setParcial(0);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={`valor_${moduloId}`} value={total} />

      <ul className="flex flex-col gap-2">
        {etapas.map((etapa, i) => {
          const completa = i < nivel;
          const actual = i === nivel;
          return (
            <li
              key={i}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-2",
                completa && "border-success/40 bg-success/5",
                actual && "border-primary",
              )}
            >
              <button
                type="button"
                onClick={() => alternar(i)}
                aria-pressed={completa}
                aria-label={`${completa ? "Desmarcar" : "Marcar"} ${etapa.nombre}`}
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-md border transition-colors",
                  completa
                    ? "border-success bg-success text-success-foreground"
                    : "border-input bg-background text-transparent",
                )}
              >
                <Check className="size-5" />
              </button>

              <span className="flex-1 text-sm font-medium">
                {i + 1}. {etapa.nombre}
              </span>

              {actual ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={etapa.objetivo}
                    value={parcial === 0 ? "" : parcial}
                    placeholder="0"
                    onChange={(e) => {
                      const n = Math.max(
                        0,
                        Math.min(etapa.objetivo, Number(e.target.value) || 0),
                      );
                      setParcial(n);
                    }}
                    className="numeros-marca h-10 w-16 text-right"
                  />
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
            {total}/{objetivoTotal} · {porcentaje}%
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
