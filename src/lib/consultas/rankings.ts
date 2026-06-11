import type { SupabaseClient } from "@supabase/supabase-js";

import type { DireccionRanking } from "@/types/ejercicios";

export type PuestoRanking = {
  alumno_id: string;
  nombre: string;
  apellido: string;
  mejorValor: number;
  tiempo_segundos: number | null;
  fecha: string;
};

type FilaValor = {
  valor: number;
  tiempo_segundos: number | null;
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
  tiempo_segundos: number | null;
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
 * Desempate por tiempo: si dos tienen el mismo valor, gana quien hizo menor tiempo.
 */
export async function obtenerRanking(
  supabase: SupabaseClient,
  moduloId: string,
  direccion: DireccionRanking,
): Promise<PuestoRanking[]> {
  const { data, error } = await supabase
    .from("medicion_valores")
    .select(
      "valor, tiempo_segundos, mediciones!inner (fecha, alumnos!inner (id, nombre, apellido, activo))",
    )
    .eq("modulo_id", moduloId)
    .eq("mediciones.alumnos.activo", true);

  if (error) throw error;

  const mejores = new Map<string, PuestoRanking>();
  for (const fila of (data ?? []) as unknown as FilaValor[]) {
    const alumno = fila.mediciones.alumnos;
    const valor = Number(fila.valor);
    const tiempo = fila.tiempo_segundos ? Number(fila.tiempo_segundos) : null;
    const actual = mejores.get(alumno.id);

    let esMejor = false;
    if (!actual) {
      esMejor = true;
    } else if (direccion === "desc") {
      if (valor > actual.mejorValor) {
        esMejor = true;
      } else if (valor === actual.mejorValor && tiempo && actual.tiempo_segundos) {
        // Desempate: menor tiempo gana
        esMejor = tiempo < actual.tiempo_segundos;
      }
    } else {
      if (valor < actual.mejorValor) {
        esMejor = true;
      } else if (valor === actual.mejorValor && tiempo && actual.tiempo_segundos) {
        // Desempate: menor tiempo gana
        esMejor = tiempo < actual.tiempo_segundos;
      }
    }

    if (esMejor) {
      mejores.set(alumno.id, {
        alumno_id: alumno.id,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        mejorValor: valor,
        tiempo_segundos: tiempo,
        fecha: fila.mediciones.fecha,
      });
    }
  }

  return [...mejores.values()].sort((a, b) => {
    if (direccion === "desc") {
      if (b.mejorValor !== a.mejorValor) return b.mejorValor - a.mejorValor;
    } else {
      if (a.mejorValor !== b.mejorValor) return a.mejorValor - b.mejorValor;
    }
    // Desempate por tiempo (menor es mejor)
    if (a.tiempo_segundos && b.tiempo_segundos) {
      return a.tiempo_segundos - b.tiempo_segundos;
    }
    return 0;
  });
}

/**
 * Ranking por total general: suma de todos los módulos de un ejercicio
 * por medición. Mejor total = mayor suma (desc siempre).
 * Desempate: si dos alumnos tienen el mismo total y ambos hicieron Testeo,
 * desempata por tiempo del Testeo (menor es mejor).
 */
export async function obtenerRankingTotal(
  supabase: SupabaseClient,
  ejercicioId: string,
): Promise<PuestoRanking[]> {
  const { data, error } = await supabase
    .from("medicion_valores")
    .select(
      "valor, tiempo_segundos, mediciones!inner (id, fecha, ejercicio_id, alumnos!inner (id, nombre, apellido, activo))",
    )
    .eq("mediciones.ejercicio_id", ejercicioId)
    .eq("mediciones.alumnos.activo", true);

  if (error) throw error;

  const totalesPorMedicion = new Map<
    string,
    {
      total: number;
      fecha: string;
      alumno: { id: string; nombre: string; apellido: string };
      tiempoTesteo: number | null;
    }
  >();

  for (const fila of (data ?? []) as unknown as FilaTotal[]) {
    const medicionId = fila.mediciones.id;
    const existing = totalesPorMedicion.get(medicionId);
    const tiempoTesteo = fila.tiempo_segundos ? Number(fila.tiempo_segundos) : null;
    if (existing) {
      existing.total += Number(fila.valor);
      // Guardar tiempo de Testeo si lo encuentra
      if (tiempoTesteo && !existing.tiempoTesteo) {
        existing.tiempoTesteo = tiempoTesteo;
      }
    } else {
      totalesPorMedicion.set(medicionId, {
        total: Number(fila.valor),
        fecha: fila.mediciones.fecha,
        alumno: fila.mediciones.alumnos,
        tiempoTesteo,
      });
    }
  }

  const mejores = new Map<string, PuestoRanking>();
  for (const { total, fecha, alumno, tiempoTesteo } of totalesPorMedicion.values()) {
    const actual = mejores.get(alumno.id);
    let esMejor = false;
    if (!actual) {
      esMejor = true;
    } else if (total > actual.mejorValor) {
      esMejor = true;
    } else if (total === actual.mejorValor && tiempoTesteo && actual.tiempo_segundos) {
      // Desempate: menor tiempo gana
      esMejor = tiempoTesteo < actual.tiempo_segundos;
    }

    if (esMejor) {
      mejores.set(alumno.id, {
        alumno_id: alumno.id,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        mejorValor: total,
        tiempo_segundos: tiempoTesteo,
        fecha,
      });
    }
  }

  return [...mejores.values()].sort((a, b) => {
    if (b.mejorValor !== a.mejorValor) return b.mejorValor - a.mejorValor;
    // Desempate por tiempo (menor es mejor)
    if (a.tiempo_segundos && b.tiempo_segundos) {
      return a.tiempo_segundos - b.tiempo_segundos;
    }
    return 0;
  });
}
