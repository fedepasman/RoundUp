"use client";

import { useActionState } from "react";

import { CamposAlumno } from "@/components/campos-alumno";
import { Button } from "@/components/ui/button";

import { crearAlumno, type EstadoCrearAlumno } from "./actions";

export function FormularioNuevoAlumno() {
  const [estado, accion, pendiente] = useActionState<
    EstadoCrearAlumno,
    FormData
  >(crearAlumno, null);

  return (
    <form action={accion} className="flex flex-col gap-4">
      <CamposAlumno />
      {estado?.error && (
        <p role="alert" className="text-base font-medium text-destructive">
          {estado.error}
        </p>
      )}
      <Button type="submit" disabled={pendiente} className="h-12 text-lg">
        {pendiente ? "Guardando…" : "Guardar alumno"}
      </Button>
    </form>
  );
}
