"use server";

import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { esquemaAlumno } from "@/lib/validations/alumnos";

export type EstadoInscripcion =
  | { ok: true }
  | { ok: false; error: string }
  | null;

// Rate limit best-effort por IP (en serverless cada instancia tiene su mapa;
// la protección fuerte es la RPC con validación + constraints en la DB).
const intentos = new Map<string, { cantidad: number; desde: number }>();
const VENTANA_MS = 10 * 60 * 1000;
const MAX_INTENTOS = 5;

function superaLimite(ip: string): boolean {
  const ahora = Date.now();
  const registro = intentos.get(ip);
  if (!registro || ahora - registro.desde > VENTANA_MS) {
    intentos.set(ip, { cantidad: 1, desde: ahora });
    return false;
  }
  registro.cantidad++;
  return registro.cantidad > MAX_INTENTOS;
}

export async function inscribirse(
  _estadoPrevio: EstadoInscripcion,
  formData: FormData,
): Promise<EstadoInscripcion> {
  // Honeypot: los bots completan el campo oculto, las personas no.
  if (formData.get("sitio_web")) {
    return { ok: true };
  }

  const encabezados = await headers();
  const ip =
    encabezados.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (superaLimite(ip)) {
    return {
      ok: false,
      error: "Demasiados intentos. Esperá unos minutos y volvé a probar.",
    };
  }

  const datos = esquemaAlumno.safeParse({
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    fecha_nacimiento: formData.get("fecha_nacimiento"),
  });
  if (!datos.success) {
    return { ok: false, error: datos.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("inscribir_alumno", {
    p_nombre: datos.data.nombre,
    p_apellido: datos.data.apellido,
    p_fecha_nacimiento: datos.data.fecha_nacimiento,
  });

  if (error) {
    return {
      ok: false,
      error: "No pudimos registrar la inscripción. Probá de nuevo.",
    };
  }

  return { ok: true };
}
