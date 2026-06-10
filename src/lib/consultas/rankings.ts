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

type FilaTotal = {
  valor: number;
  mediciones: {
    id: string;
    fecha: string;
    ejercicio_id: string;
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

/**
 * Ranking por total general: suma de todos los módulos de un ejercicio
 * por medición. Mejor total = mayor suma (desc siempre).
 */
export async function obtenerRankingTotal(
  supabase: SupabaseClient,
  ejercicioId: string,
): Promise<PuestoRanking[]> {
  const { data, error } = await supabase
    .from("medicion_valores")
    .select(
      "valor, mediciones!inner (id, fecha, ejercicio_id, alumnos!inner (id, nombre, apellido, activo))",
    )
    .eq("mediciones.ejercicio_id", ejercicioId)
    .eq("mediciones.alumnos.activo", true);

  if (error) throw error;

  const totalesPorMedicion = new Map<
    string,
    { total: number; fecha: string; alumno: { id: string; nombre: string; apellido: string } }
  >();

  for (const fila of (data ?? []) as unknown as FilaTotal[]) {
    const medicionId = fila.mediciones.id;
    const existing = totalesPorMedicion.get(medicionId);
    if (existing) {
      existing.total += Number(fila.valor);
    } else {
      totalesPorMedicion.set(medicionId, {
        total: Number(fila.valor),
        fecha: fila.mediciones.fecha,
        alumno: fila.mediciones.alumnos,
      });
    }
  }

  const mejores = new Map<string, PuestoRanking>();
  for (const { total, fecha, alumno } of totalesPorMedicion.values()) {
    const actual = mejores.get(alumno.id);
    if (!actual || total > actual.mejorValor) {
      mejores.set(alumno.id, {
        alumno_id: alumno.id,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        mejorValor: total,
        fecha,
      });
    }
  }

  return [...mejores.values()].sort((a, b) => b.mejorValor - a.mejorValor);
}
