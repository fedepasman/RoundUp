"use client";

import { PartyPopper } from "lucide-react";
import { useActionState } from "react";

import { CamposAlumno } from "@/components/campos-alumno";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { inscribirse, type EstadoInscripcion } from "./actions";

export function FormularioInscripcion() {
  const [estado, accion, pendiente] = useActionState<
    EstadoInscripcion,
    FormData
  >(inscribirse, null);

  if (estado?.ok) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <PartyPopper className="size-10 text-primary" />
          <p className="text-lg font-semibold">¡Listo, ya estás anotado!</p>
          <p className="text-sm text-muted-foreground">
            Tu profe ya puede verte en la lista de alumnos. Nos vemos en el
            entrenamiento.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form action={accion} className="flex flex-col gap-4">
      <CamposAlumno />
      {/* Honeypot anti-bots: invisible para personas */}
      <input
        type="text"
        name="sitio_web"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      {estado && !estado.ok && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {estado.error}
        </p>
      )}
      <Button type="submit" disabled={pendiente} className="h-12 text-base">
        {pendiente ? "Enviando…" : "Inscribirme"}
      </Button>
    </form>
  );
}
