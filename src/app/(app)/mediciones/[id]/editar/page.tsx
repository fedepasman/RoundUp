import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { formatearFecha } from "@/lib/fechas";
import { createClient } from "@/lib/supabase/server";

import { FormularioEdicion } from "./formulario-edicion";

export const metadata: Metadata = { title: "Editar medición" };

export default async function PaginaEditarMedicion({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (!perfil || !["admin", "profesor"].includes(perfil.rol)) {
    notFound();
  }

  const { data: medicion } = await supabase
    .from("mediciones")
    .select(
      "id, fecha, alumno_id, ejercicio_id, alumnos (nombre, apellido), ejercicios (nombre), medicion_valores (id, valor, tiempo_segundos, modulo_id, ejercicio_modulos (id, nombre, tipo_medicion, unidad, orden, etapas, tiempo_limite_segundos))",
    )
    .eq("id", id)
    .single();

  if (!medicion) notFound();

  const alumno = medicion.alumnos as unknown as { nombre: string; apellido: string };
  const ejercicio = medicion.ejercicios as unknown as { nombre: string };

  const valores = (medicion.medicion_valores ?? []).map((mv) => {
    const mod = mv.ejercicio_modulos as unknown as {
      id: string;
      nombre: string;
      tipo_medicion: "tiempo" | "cantidad" | "numero";
      unidad: string | null;
      orden: number;
      etapas: { nombre: string; objetivo: number }[] | null;
      tiempo_limite_segundos: number | null;
    };
    return {
      modulo_id: mv.modulo_id,
      modulo_nombre: mod.nombre,
      tipo_medicion: mod.tipo_medicion,
      unidad: mod.unidad,
      orden: mod.orden,
      etapas: mod.etapas,
      tiempo_limite_segundos: mod.tiempo_limite_segundos ?? null,
      valor: Number(mv.valor),
      tiempo_segundos: mv.tiempo_segundos ? Number(mv.tiempo_segundos) : null,
    };
  }).sort((a, b) => a.orden - b.orden);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-4xl uppercase">Editar medición</h1>
        <p className="text-muted-foreground">
          {alumno.apellido}, {alumno.nombre} · {ejercicio.nombre} · {formatearFecha(medicion.fecha)}
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <FormularioEdicion
            medicionId={id}
            alumnoId={medicion.alumno_id}
            esAdmin={perfil.rol === "admin"}
            valores={valores}
          />
        </CardContent>
      </Card>
    </div>
  );
}
