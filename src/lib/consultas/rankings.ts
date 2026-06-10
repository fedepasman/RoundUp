import type { SupabaseClient } from "@supabase/supabase-js";

import type { DireccionRanking } from "@/types/ejercicios";

export type PuestoRanking = {
  alumno_id: string;
  nombre: string;
  apellido: string;
  mejorValor: number;
  fecha: string;
};

type FilaValor = {
  valor: number;
  mediciones: {
    fecha: string;
    alumnos: {
      id: string;
      nombre: string;
      apellido: string;
      activo: boolean;
    };
  };
};

/**
 * Ranking de un módulo: la mejor marca de cada alumno activo, ordenada
 * según la dirección del módulo (asc = menor gana, desc = mayor gana).
 */
export async function obtenerRanking(
  supabase: SupabaseClient,
  moduloId: string,
  direccion: DireccionRanking,
): Promise<PuestoRanking[]> {
  const { data, error } = await supabase
    .from("medicion_valores")
    .select(
      "valor, mediciones!inner (fecha, alumnos!inner (id, nombre, apellido, activo))",
    )
    .eq("modulo_id", moduloId)
    .eq("mediciones.alumnos.activo", true);

  if (error) throw error;

  const mejores = new Map<string, PuestoRanking>();
  for (const fila of (data ?? []) as unknown as FilaValor[]) {
    const alumno = fila.mediciones.alumnos;
    const valor = Number(fila.valor);
    const actual = mejores.get(alumno.id);
    const esMejor =
      !actual ||
      (direccion === "desc"
        ? valor > actual.mejorValor
        : valor < actual.mejorValor);
    if (esMejor) {
      mejores.set(alumno.id, {
        alumno_id: alumno.id,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        mejorValor: valor,
        fecha: fila.mediciones.fecha,
      });
    }
  }

  return [...mejores.values()].sort((a, b) =>
    direccion === "desc"
      ? b.mejorValor - a.mejorValor
      : a.mejorValor - b.mejorValor,
  );
}
