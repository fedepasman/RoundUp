import type { Metadata } from "next";

import { obtenerEjerciciosConModulos } from "@/lib/consultas/ejercicios";
import { createClient } from "@/lib/supabase/server";

import { FormularioMedicion } from "./formulario-medicion";

export const metadata: Metadata = { title: "Cargar medición" };

export default async function PaginaNuevaMedicion() {
  const supabase = await createClient();

  const [ejercicios, { data: alumnos }] = await Promise.all([
    obtenerEjerciciosConModulos(supabase),
    supabase
      .from("alumnos")
      .select("id, nombre, apellido")
      .eq("activo", true)
      .order("apellido")
      .order("nombre"),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-3xl uppercase">Cargar medición</h1>
      <FormularioMedicion ejercicios={ejercicios} alumnos={alumnos ?? []} />
    </div>
  );
}
