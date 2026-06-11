import type { Metadata } from "next";

import { FormularioNuevoAlumno } from "./formulario-nuevo-alumno";

export const metadata: Metadata = { title: "Nuevo alumno" };

export default function PaginaNuevoAlumno() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-3xl uppercase">Nuevo alumno</h1>
      <FormularioNuevoAlumno />
    </div>
  );
}
