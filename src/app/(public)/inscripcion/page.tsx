import type { Metadata } from "next";

import { FormularioInscripcion } from "./formulario-inscripcion";

export const metadata: Metadata = {
  title: "Inscripción",
  description: "Completá tu ficha para empezar a entrenar.",
};

export default function PaginaInscripcion() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 p-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="rounded-full bg-primary px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary-foreground">
          Inscripción
        </span>
        <h1 className="font-display text-5xl uppercase">RoundUp</h1>
        <p className="text-balance text-muted-foreground">
          Completá tu ficha para empezar a entrenar.
        </p>
      </div>
      <FormularioInscripcion />
    </main>
  );
}
