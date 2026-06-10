import type { SupabaseClient } from "@supabase/supabase-js";

export type FilaReporte = {
  alumno_id: string;
  nombre: string;
  apellido: string;
  /** valor por modulo_id */
  valores: Record<string, number>;
  /** suma de todos los módulos de la medición */
  total: number;
};

type MedicionCruda = {
  alumnos: {
    id: string;
    nombre: string;
    apellido: string;
    activo: boolean;
  };
  medicion_valores: { valor: number; modulo_id: string }[];
};

/**
 * Resultados de un ejercicio en una fecha: una fila por alumno activo
 * con medición ese día, con sus valores por módulo y el total (suma).
 * El orden lo decide la página según la dirección del ejercicio.
 */
export async function obtenerReporte(
  supabase: SupabaseClient,
  ejercicioId: string,
  fecha: string,
): Promise<FilaReporte[]> {
  const { data, error } = await supabase
    .from("mediciones")
    .select(
      "id, alumnos!inner (id, nombre, apellido, activo), medicion_valores (valor, modulo_id)",
    )
    .eq("ejercicio_id", ejercicioId)
    .eq("fecha", fecha)
    .eq("alumnos.activo", true);

  if (error) throw error;

  return ((data ?? []) as unknown as MedicionCruda[]).map((m) => {
    const valores: Record<string, number> = {};
    let total = 0;
    for (const v of m.medicion_valores ?? []) {
      const valor = Number(v.valor);
      valores[v.modulo_id] = valor;
      total += valor;
    }
    return {
      alumno_id: m.alumnos.id,
      nombre: m.alumnos.nombre,
      apellido: m.alumnos.apellido,
      valores,
      total,
    };
  });
}
