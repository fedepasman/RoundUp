import type { Metadata } from "next";

import { fechaLocalISO } from "@/lib/fechas";
import { createClient } from "@/lib/supabase/server";

import { PlanillaAsistencia } from "./planilla-asistencia";

export const metadata: Metadata = { title: "Asistencia" };

export default async function PaginaAsistencia({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  const { fecha: fechaParam } = await searchParams;
  const fecha =
    fechaParam && !Number.isNaN(Date.parse(fechaParam))
      ? fechaParam
      : fechaLocalISO();

  const supabase = await createClient();
  const [{ data: alumnos }, { data: asistencias }] = await Promise.all([
    supabase
      .from("alumnos")
      .select("id, nombre, apellido")
      .eq("activo", true)
      .order("apellido")
      .order("nombre"),
    supabase
      .from("asistencias")
      .select("alumno_id, estado")
      .eq("fecha", fecha),
  ]);

  const marcasGuardadas = Object.fromEntries(
    (asistencias ?? []).map((a) => [a.alumno_id, a.estado]),
  ) as Record<string, "presente" | "ausente">;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-4xl uppercase">Asistencia</h1>
      <PlanillaAsistencia
        key={fecha}
        fecha={fecha}
        alumnos={alumnos ?? []}
        marcasGuardadas={marcasGuardadas}
      />
    </div>
  );
}
