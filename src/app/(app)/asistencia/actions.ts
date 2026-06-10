"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const esquemaAsistencia = z.object({
  fecha: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), "Fecha inválida")
    .refine((v) => new Date(v) <= new Date(), "La fecha no puede ser futura"),
  marcas: z
    .array(
      z.object({
        alumno_id: z.uuid(),
        estado: z.enum(["presente", "ausente"]),
      }),
    )
    .min(1, "Marcá al menos un alumno"),
});

export type EstadoGuardarAsistencia =
  | { ok: true; cantidad: number }
  | { ok: false; error: string }
  | null;

export async function guardarAsistencia(
  fecha: string,
  marcas: { alumno_id: string; estado: "presente" | "ausente" }[],
): Promise<EstadoGuardarAsistencia> {
  const datos = esquemaAsistencia.safeParse({ fecha, marcas });
  if (!datos.success) {
    return { ok: false, error: datos.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada. Volvé a entrar." };

  const { error } = await supabase.from("asistencias").upsert(
    datos.data.marcas.map((m) => ({
      alumno_id: m.alumno_id,
      fecha: datos.data.fecha,
      estado: m.estado,
      registrado_por: user.id,
    })),
    { onConflict: "alumno_id,fecha" },
  );

  if (error) {
    return { ok: false, error: "No se pudo guardar la asistencia." };
  }

  revalidatePath("/asistencia");
  return { ok: true, cantidad: datos.data.marcas.length };
}
