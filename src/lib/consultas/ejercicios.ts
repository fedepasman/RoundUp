import type { SupabaseClient } from "@supabase/supabase-js";

import type { EjercicioConModulos } from "@/types/ejercicios";

/** Ejercicios activos con sus módulos ordenados, para selects y carga de mediciones. */
export async function obtenerEjerciciosConModulos(
  supabase: SupabaseClient,
): Promise<EjercicioConModulos[]> {
  const { data, error } = await supabase
    .from("ejercicios")
    .select(
      "id, nombre, descripcion, activo, ejercicio_modulos (id, ejercicio_id, nombre, tipo_medicion, direccion_ranking, unidad, orden, etapas, descripcion)",
    )
    .eq("activo", true)
    .order("nombre")
    .order("orden", { referencedTable: "ejercicio_modulos" });

  if (error) throw error;
  return (data ?? []) as EjercicioConModulos[];
}
