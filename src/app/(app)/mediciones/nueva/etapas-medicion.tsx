"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { aSegundos } from "@/lib/tiempo";
import { cn } from "@/lib/utils";
import type { Etapa } from "@/types/ejercicios";

/**
 * Carga de un test por etapas (escalera): se marcan las etapas completas
 * y, en la etapa donde se frenó, se cargan las reps parciales. Si completa todo,
 * pide el tiempo en mm:ss. Mantiene inputs ocultos con valor y tiempo para el form padre.
 */
export function EtapasMedicion({
  moduloId,
  etapas,
}: {
  moduloId: string;
  etapas: Etapa[];
}) {
  const [nivel, setNivel] = useState(0);
  const [parcial, setParcial] = useState(0);
  const [tiempo, setTiempo] = useState("");

  const objetivoTotal = etapas.reduce((s, e) => s + e.objetivo, 0);
  const completas = etapas
    .slice(0, nivel)
    .reduce((s, e) => s + e.objetivo, 0);
  const total = completas + (nivel < etapas.length ? parcial : 0);
  const completo = total === objetivoTotal;
  const porcentaje =
    objetivoTotal > 0 ? Math.round((total / objetivoTotal) * 100) : 0;

  const tiempoSegundos = tiempo ? aSegundos(tiempo) : null;

  function alternar(indice: number) {
    if (indice < nivel) {
      setNivel(indice);
      setParcial(0);
    } else {
      setNivel(indice + 1);
      setParcial(0);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name={`valor_${moduloId}`} value={total} />
      <input
        type="hidden"
        name={`tiempo_${moduloId}`}
        value={tiempoSegundos ?? ""}
      />

      <ul className="flex flex-col gap-2">
        {etapas.map((etapa, i) => {
          const marcada = i < nivel;
          const actual = i === nivel;
          return (
            <li
              key={i}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-2",
                marcada && "border-success/40 bg-success/5",
                actual && "border-primary",
              )}
            >
              <button
                type="button"
                onClick={() => alternar(i)}
                aria-pressed={marcada}
                aria-label={`${marcada ? "Desmarcar" : "Marcar"} ${etapa.nombre}`}
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-md border transition-colors",
                  marcada
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
                  {marcada ? etapa.objetivo : 0}/{etapa.objetivo}
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

      {completo && (
        <div className="flex flex-col gap-2 border-t pt-3">
          <Label htmlFor={`tiempo_${moduloId}_input`}>Tiempo (mm:ss)</Label>
          <Input
            id={`tiempo_${moduloId}_input`}
            type="text"
            inputMode="numeric"
            placeholder="mm:ss"
            pattern="\\d{1,3}(:[0-5]?\\d)?"
            title="Formato mm:ss, por ejemplo 15:45"
            value={tiempo}
            onChange={(e) => setTiempo(e.target.value)}
            required
            className="numeros-marca h-11"
          />
        </div>
      )}
    </div>
  );
}
