import type { Metadata } from "next";

import { FormularioLogin } from "./formulario-login";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function PaginaLogin() {
  return (
    <main className="flex flex-1 flex-col justify-center gap-8 p-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="font-display text-5xl uppercase">RoundUp</h1>
        <p className="text-muted-foreground">
          Entrá para seguir a tus alumnos
        </p>
      </div>
      <FormularioLogin />
    </main>
  );
}
