"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { aSegundos } from "@/lib/tiempo";
import { createClient } from "@/lib/supabase/server";

export type EstadoEdicion =
  | { ok: true }
  | { ok: false; error: string }
  | null;

export async function actualizarMedicion(
  medicionId: string,
  alumnoId: string,
  _prev: EstadoEdicion,
  formData: FormData,
): Promise<EstadoEdicion> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada." };

  const { data: perfil } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (!perfil || !["admin", "profesor"].includes(perfil.rol)) {
    return { ok: false, error: "Sin permiso para editar mediciones." };
  }

  const { data: modulos } = await supabase
    .from("medicion_valores")
    .select("id, modulo_id, ejercicio_modulos (id, nombre, tipo_medicion, etapas, tiempo_limite_segundos)")
    .eq("medicion_id", medicionId);

  if (!modulos?.length) return { ok: false, error: "Medición no encontrada." };

  for (const mv of modulos) {
    const mod = mv.ejercicio_modulos as unknown as {
      nombre: string;
      tipo_medicion: "tiempo" | "cantidad" | "numero";
      etapas: { objetivo: number }[] | null;
      tiempo_limite_segundos: number | null;
    };
    const crudo = String(formData.get(`valor_${mv.modulo_id}`) ?? "").trim();
    if (!crudo) return { ok: false, error: `Falta el valor de "${mod.nombre}".` };

    const valor =
      mod.tipo_medicion === "tiempo" ? aSegundos(crudo) : Number(crudo);
    if (valor === null || !Number.isFinite(valor) || valor < 0) {
      return {
        ok: false,
        error:
          mod.tipo_medicion === "tiempo"
            ? `"${mod.nombre}": usá el formato mm:ss.`
            : `"${mod.nombre}": valor inválido.`,
      };
    }

    let tiempo_segundos: number | null = null;
    if (mod.etapas && Array.isArray(mod.etapas)) {
      const objetivo = mod.etapas.reduce((s: number, e: { objetivo: number }) => s + e.objetivo, 0);
      const tiempoStr = String(formData.get(`tiempo_${mv.modulo_id}`) ?? "").trim();
      if (valor >= objetivo) {
        if (tiempoStr) {
          const t = aSegundos(tiempoStr);
          if (t && t > 0) tiempo_segundos = t;
        }
      } else {
        tiempo_segundos = mod.tiempo_limite_segundos ?? 1800;
      }
    }

    const updateData: Record<string, unknown> = { valor };
    if (mod.etapas) updateData.tiempo_segundos = tiempo_segundos;

    await supabase
      .from("medicion_valores")
      .update(updateData)
      .eq("id", mv.id);
  }

  revalidatePath(`/alumnos/${alumnoId}`);
  redirect(`/alumnos/${alumnoId}`);
}

export async function eliminarMedicion(
  medicionId: string,
  alumnoId: string,
): Promise<{ ok: false; error: string } | never> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada." };

  const { data: perfil } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "admin") {
    return { ok: false, error: "Solo un admin puede eliminar mediciones." };
  }

  await supabase.from("mediciones").delete().eq("id", medicionId);

  revalidatePath(`/alumnos/${alumnoId}`);
  redirect(`/alumnos/${alumnoId}`);
}
