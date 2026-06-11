"use client";

import { useActionState, useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatearSegundos } from "@/lib/tiempo";
import { formatearValor } from "@/lib/evolucion";
import { objetivoEtapas } from "@/lib/etapas";
import type { Etapa } from "@/types/ejercicios";

import { actualizarMedicion, eliminarMedicion, type EstadoEdicion } from "./actions";

type ValorEditable = {
  modulo_id: string;
  modulo_nombre: string;
  tipo_medicion: "tiempo" | "cantidad" | "numero";
  unidad: string | null;
  orden: number;
  etapas: Etapa[] | null;
  tiempo_limite_segundos: number | null;
  valor: number;
  tiempo_segundos: number | null;
};

export function FormularioEdicion({
  medicionId,
  alumnoId,
  esAdmin,
  valores,
}: {
  medicionId: string;
  alumnoId: string;
  esAdmin: boolean;
  valores: ValorEditable[];
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const accion = actualizarMedicion.bind(null, medicionId, alumnoId);
  const [estado, dispatch, pendiente] = useActionState<EstadoEdicion, FormData>(accion, null);

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    const result = await eliminarMedicion(medicionId, alumnoId);
    if (result && !result.ok) {
      setDeleteError(result.error);
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <form action={dispatch} className="flex flex-col gap-4">
      {valores.map((v) => {
        const objetivo = v.etapas ? objetivoEtapas(v.etapas) : null;
        const completo = objetivo !== null && v.valor >= objetivo;

        return (
          <div key={v.modulo_id} className="flex flex-col gap-2">
            <Label htmlFor={`valor_${v.modulo_id}`}>
              {v.modulo_nombre}
              {v.unidad ? ` (${v.unidad})` : ""}
            </Label>
            <Input
              id={`valor_${v.modulo_id}`}
              name={`valor_${v.modulo_id}`}
              required
              defaultValue={
                v.tipo_medicion === "tiempo"
                  ? formatearSegundos(v.valor)
                  : String(v.valor)
              }
              className="numeros-marca h-12 text-xl"
              {...(v.tipo_medicion === "tiempo"
                ? {
                    type: "text",
                    inputMode: "numeric" as const,
                    placeholder: "mm:ss",
                  }
                : {
                    type: "number",
                    inputMode: "numeric" as const,
                    min: 0,
                    step: v.tipo_medicion === "numero" ? "0.01" : "1",
                  })}
            />

            {v.etapas && (
              <div className="flex flex-col gap-2">
                <Label htmlFor={`tiempo_${v.modulo_id}`}>Tiempo (mm:ss)</Label>
                <Input
                  id={`tiempo_${v.modulo_id}`}
                  name={`tiempo_${v.modulo_id}`}
                  type="text"
                  inputMode="numeric"
                  placeholder={completo ? "mm:ss" : "solo si completó"}
                  defaultValue={
                    v.tiempo_segundos && v.tiempo_segundos !== 1800
                      ? formatearSegundos(v.tiempo_segundos)
                      : ""
                  }
                  className="numeros-marca h-12 text-xl"
                />
                <p className="text-sm text-muted-foreground">
                  {objetivo !== null
                    ? `Objetivo: ${objetivo} reps. Si no completó, se asigna ${formatearSegundos(v.tiempo_limite_segundos ?? 1800)} automáticamente.`
                    : ""}
                </p>
              </div>
            )}
          </div>
        );
      })}

      {estado && !estado.ok && (
        <p role="alert" className="text-base font-medium text-destructive">
          {estado.error}
        </p>
      )}

      <Button type="submit" disabled={pendiente} className="h-12 text-lg">
        {pendiente ? "Guardando…" : "Guardar cambios"}
      </Button>

      {esAdmin && (
        <div className="border-t pt-4">
          {deleteError && (
            <p className="mb-2 text-base text-destructive">{deleteError}</p>
          )}
          {confirmDelete ? (
            <div className="flex flex-col gap-2">
              <p className="text-base font-medium text-destructive">
                ¿Seguro que querés eliminar esta medición? No se puede deshacer.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  className="h-11 flex-1"
                  disabled={deleting}
                  onClick={handleDelete}
                >
                  {deleting ? "Eliminando…" : "Sí, eliminar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 flex-1"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 size-4" />
              Eliminar medición
            </Button>
          )}
        </div>
      )}
    </form>
  );
}
