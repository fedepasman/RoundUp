import type { SupabaseClient } from "@supabase/supabase-js";

import { calcularEdad, fechaLocalISO } from "@/lib/fechas";

export type KpisDashboard = {
  alumnosActivos: number;
  presentesHoy: number;
  registradosHoy: number;
  porcentajeSemana: number | null;
  medicionesMes: number;
  ejerciciosActivos: number;
};

export type SemanaAsistencia = {
  semana: string;
  etiqueta: string;
  presentes: number;
  ausentes: number;
};

export type ResumenAsistenciaMes = {
  presentes: number;
  ausentes: number;
  porcentaje: number | null;
};

export type MesConteo = {
  mes: string;
  etiqueta: string;
  cantidad: number;
};

export type DistribucionAlumnos = {
  porEdad: { rango: string; cantidad: number }[];
  porOrigen: { origen: "app" | "formulario"; cantidad: number }[];
};

export type ActividadReciente = {
  mediciones: {
    fecha: string;
    alumno_id: string;
    alumno: string;
    ejercicio: string;
  }[];
  asistencias: {
    fecha: string;
    alumno_id: string;
    alumno: string;
    estado: "presente" | "ausente";
  }[];
  alumnosNuevos: {
    id: string;
    nombre: string;
    apellido: string;
    origen: string;
    created_at: string;
  }[];
};

const MESES_CORTOS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

/** Suma días a una fecha local y devuelve YYYY-MM-DD. */
function sumarDias(fechaISO: string, dias: number): string {
  const fecha = new Date(`${fechaISO}T00:00:00`);
  fecha.setDate(fecha.getDate() + dias);
  return fechaLocalISO(fecha);
}

/** Lunes de la semana de la fecha dada (local). */
function inicioSemanaLunes(fechaISO: string): string {
  const fecha = new Date(`${fechaISO}T00:00:00`);
  const dia = fecha.getDay(); // 0 = domingo
  const retroceso = dia === 0 ? 6 : dia - 1;
  return sumarDias(fechaISO, -retroceso);
}

/** "2026-06" → "jun 26" */
function etiquetaMes(mes: string): string {
  const [anio, numMes] = mes.split("-");
  return `${MESES_CORTOS[Number(numMes) - 1]} ${anio.slice(2)}`;
}

/** Count exacto sin traer filas (evita el tope de 1000 filas de PostgREST). */
async function contar(
  consulta: PromiseLike<{ count: number | null; error: unknown }>,
): Promise<number> {
  const { count, error } = await consulta;
  if (error) throw error;
  return count ?? 0;
}

/** Builder de count para una tabla. */
function conteo(supabase: SupabaseClient, tabla: string) {
  return supabase.from(tabla).select("*", { count: "exact", head: true });
}

/** KPIs generales del panel. */
export async function obtenerKpis(
  supabase: SupabaseClient,
): Promise<KpisDashboard> {
  const hoy = fechaLocalISO();
  const hace7 = sumarDias(hoy, -6);
  const inicioMes = `${hoy.slice(0, 7)}-01`;

  const [
    alumnosActivos,
    registradosHoy,
    presentesHoy,
    registradosSemana,
    presentesSemana,
    medicionesMes,
    ejerciciosActivos,
  ] = await Promise.all([
    contar(conteo(supabase, "alumnos").eq("activo", true)),
    contar(conteo(supabase, "asistencias").eq("fecha", hoy)),
    contar(conteo(supabase, "asistencias").eq("fecha", hoy).eq("estado", "presente")),
    contar(conteo(supabase, "asistencias").gte("fecha", hace7)),
    contar(conteo(supabase, "asistencias").gte("fecha", hace7).eq("estado", "presente")),
    contar(conteo(supabase, "mediciones").gte("fecha", inicioMes)),
    contar(conteo(supabase, "ejercicios").eq("activo", true)),
  ]);

  return {
    alumnosActivos,
    presentesHoy,
    registradosHoy,
    porcentajeSemana:
      registradosSemana > 0
        ? Math.round((presentesSemana / registradosSemana) * 100)
        : null,
    medicionesMes,
    ejerciciosActivos,
  };
}

/** Presentes y ausentes por semana (lunes a domingo), de la más vieja a la actual. */
export async function obtenerAsistenciaPorSemana(
  supabase: SupabaseClient,
  semanas = 12,
): Promise<SemanaAsistencia[]> {
  const lunesActual = inicioSemanaLunes(fechaLocalISO());

  const rangos = Array.from({ length: semanas }, (_, i) => {
    const inicio = sumarDias(lunesActual, -7 * (semanas - 1 - i));
    return { inicio, fin: sumarDias(inicio, 6) };
  });

  const conteos = await Promise.all(
    rangos.flatMap(({ inicio, fin }) => [
      contar(
        conteo(supabase, "asistencias")
          .gte("fecha", inicio)
          .lte("fecha", fin)
          .eq("estado", "presente"),
      ),
      contar(
        conteo(supabase, "asistencias")
          .gte("fecha", inicio)
          .lte("fecha", fin)
          .eq("estado", "ausente"),
      ),
    ]),
  );

  return rangos.map(({ inicio }, i) => ({
    semana: inicio,
    etiqueta: `${inicio.slice(8, 10)}/${inicio.slice(5, 7)}`,
    presentes: conteos[i * 2],
    ausentes: conteos[i * 2 + 1],
  }));
}

/** Resumen presente/ausente del mes actual. */
export async function obtenerAsistenciaMesActual(
  supabase: SupabaseClient,
): Promise<ResumenAsistenciaMes> {
  const inicioMes = `${fechaLocalISO().slice(0, 7)}-01`;

  const [presentes, ausentes] = await Promise.all([
    contar(
      conteo(supabase, "asistencias").gte("fecha", inicioMes).eq("estado", "presente"),
    ),
    contar(
      conteo(supabase, "asistencias").gte("fecha", inicioMes).eq("estado", "ausente"),
    ),
  ]);

  const total = presentes + ausentes;
  return {
    presentes,
    ausentes,
    porcentaje: total > 0 ? Math.round((presentes / total) * 100) : null,
  };
}

/** Rangos de meses calendario hacia atrás, incluido el actual. */
function rangosMensuales(meses: number): { mes: string; inicio: string; fin: string }[] {
  const hoy = new Date();
  return Array.from({ length: meses }, (_, i) => {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - (meses - 1 - i), 1);
    const inicio = fechaLocalISO(d);
    const fin = fechaLocalISO(new Date(d.getFullYear(), d.getMonth() + 1, 0));
    return { mes: inicio.slice(0, 7), inicio, fin };
  });
}

/** Cantidad de mediciones cargadas por mes calendario. */
export async function obtenerMedicionesPorMes(
  supabase: SupabaseClient,
  meses = 12,
): Promise<MesConteo[]> {
  const rangos = rangosMensuales(meses);

  const conteos = await Promise.all(
    rangos.map(({ inicio, fin }) =>
      contar(conteo(supabase, "mediciones").gte("fecha", inicio).lte("fecha", fin)),
    ),
  );

  return rangos.map(({ mes }, i) => ({
    mes,
    etiqueta: etiquetaMes(mes),
    cantidad: conteos[i],
  }));
}

/** Altas de alumnos por mes calendario (tabla chica: se agrupa en memoria). */
export async function obtenerAltasPorMes(
  supabase: SupabaseClient,
  meses = 12,
): Promise<MesConteo[]> {
  const rangos = rangosMensuales(meses);
  const desde = rangos[0].inicio;

  const { data, error } = await supabase
    .from("alumnos")
    .select("created_at")
    .gte("created_at", `${desde}T00:00:00`);
  if (error) throw error;

  const porMes = new Map<string, number>();
  for (const fila of data ?? []) {
    const mes = String(fila.created_at).slice(0, 7);
    porMes.set(mes, (porMes.get(mes) ?? 0) + 1);
  }

  return rangos.map(({ mes }) => ({
    mes,
    etiqueta: etiquetaMes(mes),
    cantidad: porMes.get(mes) ?? 0,
  }));
}

const RANGOS_EDAD = [
  { rango: "Hasta 12", min: 0, max: 12 },
  { rango: "13–17", min: 13, max: 17 },
  { rango: "18–29", min: 18, max: 29 },
  { rango: "30–44", min: 30, max: 44 },
  { rango: "45+", min: 45, max: Infinity },
] as const;

/** Distribución de alumnos activos por rango de edad y por origen. */
export async function obtenerDistribucionAlumnos(
  supabase: SupabaseClient,
): Promise<DistribucionAlumnos> {
  const { data, error } = await supabase
    .from("alumnos")
    .select("fecha_nacimiento, origen")
    .eq("activo", true);
  if (error) throw error;

  const porEdad = RANGOS_EDAD.map(({ rango }) => ({ rango, cantidad: 0 }));
  const origenes = { app: 0, formulario: 0 };

  for (const alumno of data ?? []) {
    const edad = calcularEdad(alumno.fecha_nacimiento);
    const indice = RANGOS_EDAD.findIndex(
      ({ min, max }) => edad >= min && edad <= max,
    );
    if (indice >= 0) porEdad[indice].cantidad++;
    if (alumno.origen === "formulario") origenes.formulario++;
    else origenes.app++;
  }

  return {
    porEdad,
    porOrigen: [
      { origen: "app", cantidad: origenes.app },
      { origen: "formulario", cantidad: origenes.formulario },
    ],
  };
}

type FilaMedicionReciente = {
  fecha: string;
  alumno_id: string;
  alumnos: { nombre: string; apellido: string };
  ejercicios: { nombre: string };
};

type FilaAsistenciaReciente = {
  fecha: string;
  alumno_id: string;
  estado: "presente" | "ausente";
  alumnos: { nombre: string; apellido: string };
};

/** Últimas mediciones, asistencias y alumnos nuevos para el feed de actividad. */
export async function obtenerActividadReciente(
  supabase: SupabaseClient,
  limite = 8,
): Promise<ActividadReciente> {
  const [
    { data: mediciones, error: errorMediciones },
    { data: asistencias, error: errorAsistencias },
    { data: alumnosNuevos, error: errorAlumnos },
  ] = await Promise.all([
    supabase
      .from("mediciones")
      .select("fecha, alumno_id, alumnos (nombre, apellido), ejercicios (nombre)")
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limite),
    supabase
      .from("asistencias")
      .select("fecha, alumno_id, estado, alumnos (nombre, apellido)")
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limite),
    supabase
      .from("alumnos")
      .select("id, nombre, apellido, origen, created_at")
      .order("created_at", { ascending: false })
      .limit(limite),
  ]);

  if (errorMediciones) throw errorMediciones;
  if (errorAsistencias) throw errorAsistencias;
  if (errorAlumnos) throw errorAlumnos;

  return {
    mediciones: ((mediciones ?? []) as unknown as FilaMedicionReciente[]).map(
      (m) => ({
        fecha: m.fecha,
        alumno_id: m.alumno_id,
        alumno: `${m.alumnos.nombre} ${m.alumnos.apellido}`,
        ejercicio: m.ejercicios.nombre,
      }),
    ),
    asistencias: (
      (asistencias ?? []) as unknown as FilaAsistenciaReciente[]
    ).map((a) => ({
      fecha: a.fecha,
      alumno_id: a.alumno_id,
      alumno: `${a.alumnos.nombre} ${a.alumnos.apellido}`,
      estado: a.estado,
    })),
    alumnosNuevos: alumnosNuevos ?? [],
  };
}
