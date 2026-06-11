"use server";

import { z } from "zod";

import { aSegundos } from "@/lib/tiempo";
import { createClient } from "@/lib/supabase/server";

const esquemaBase = z.object({
  ejercicio_id: z.uuid(),
  alumno_id: z.uuid("Elegí un alumno"),
  fecha: z
    .string()
    .min(1, "Elegí una fecha")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Fecha inválida")
    .refine(
      (v) => new Date(v) <= new Date(),
      "La fecha no puede ser futura",
    ),
});

export type EstadoMedicion =
  | { ok: true; nombreAlumno: string }
  | { duplicado: true }
  | { ok: false; error: string }
  | null;

export async function guardarMedicion(
  _estadoPrevio: EstadoMedicion,
  formData: FormData,
): Promise<EstadoMedicion> {
  const base = esquemaBase.safeParse({
    ejercicio_id: formData.get("ejercicio_id"),
    alumno_id: formData.get("alumno_id"),
    fecha: formData.get("fecha"),
  });
  if (!base.success) {
    return { ok: false, error: base.error.issues[0].message };
  }
  const { ejercicio_id, alumno_id, fecha } = base.data;
  const sobrescribir = formData.get("sobrescribir") === "true";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada. Volvé a entrar." };

  // Los módulos válidos salen de la DB con sus etapas.
  const { data: modulos } = await supabase
    .from("ejercicio_modulos")
    .select("id, nombre, tipo_medicion, etapas")
    .eq("ejercicio_id", ejercicio_id);
  if (!modulos?.length) {
    return { ok: false, error: "El ejercicio no tiene módulos configurados." };
  }

  const valores: { modulo_id: string; valor: number; tiempo_segundos: number | null }[] = [];
  for (const modulo of modulos) {
    const crudo = String(formData.get(`valor_${modulo.id}`) ?? "").trim();
    if (!crudo) {
      return { ok: false, error: `Falta el valor de "${modulo.nombre}".` };
    }
    const valor =
      modulo.tipo_medicion === "tiempo" ? aSegundos(crudo) : Number(crudo);
    if (valor === null || !Number.isFinite(valor) || valor < 0) {
      return {
        ok: false,
        error:
          modulo.tipo_medicion === "tiempo"
            ? `"${modulo.nombre}": usá el formato mm:ss (ej. 1:35).`
            : `"${modulo.nombre}": ingresá un número válido.`,
      };
    }

    // Manejar tiempo_segundos: si tiene etapas, procesar el tiempo
    let tiempo_segundos: number | null = null;
    if (modulo.etapas && Array.isArray(modulo.etapas)) {
      const etapas = modulo.etapas as { nombre: string; objetivo: number }[];
      const objetivoTotal = etapas.reduce((s, e) => s + e.objetivo, 0);

      const tiempoString = String(formData.get(`tiempo_${modulo.id}`) ?? "").trim();
      if (valor === objetivoTotal) {
        // Completó: debe haber ingresado tiempo
        if (!tiempoString) {
          return { ok: false, error: `Ingresá el tiempo de "${modulo.nombre}".` };
        }
        const tiempoSeg = aSegundos(tiempoString);
        if (tiempoSeg === null || tiempoSeg <= 0) {
          return { ok: false, error: `Tiempo inválido en "${modulo.nombre}".` };
        }
        tiempo_segundos = tiempoSeg;
      } else {
        // No completó: asignar 30 minutos automáticamente
        tiempo_segundos = 1800;
      }
    }

    valores.push({ modulo_id: modulo.id, valor, tiempo_segundos });
  }

  // Un solo registro por alumno + ejercicio + fecha.
  const { data: existente } = await supabase
    .from("mediciones")
    .select("id")
    .eq("alumno_id", alumno_id)
    .eq("ejercicio_id", ejercicio_id)
    .eq("fecha", fecha)
    .maybeSingle();

  if (existente && !sobrescribir) {
    return { duplicado: true };
  }

  let medicionId = existente?.id;

  if (existente) {
    await supabase
      .from("mediciones")
      .update({ registrado_por: user.id })
      .eq("id", existente.id);
  } else {
    const { data: nueva, error } = await supabase
      .from("mediciones")
      .insert({ alumno_id, ejercicio_id, fecha, registrado_por: user.id })
      .select("id")
      .single();
    if (error || !nueva) {
      return { ok: false, error: "No se pudo guardar la medición." };
    }
    medicionId = nueva.id;
  }

  const { error: errorValores } = await supabase
    .from("medicion_valores")
    .upsert(
      valores.map((v) => ({ ...v, medicion_id: medicionId! })),
      { onConflict: "medicion_id,modulo_id" },
    );
  if (errorValores) {
    return { ok: false, error: "No se pudieron guardar los valores." };
  }

  const { data: alumno } = await supabase
    .from("alumnos")
    .select("nombre, apellido")
    .eq("id", alumno_id)
    .single();

  return {
    ok: true,
    nombreAlumno: alumno ? `${alumno.nombre} ${alumno.apellido}` : "el alumno",
  };
}
