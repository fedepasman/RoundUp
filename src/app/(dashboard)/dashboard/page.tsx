import {
  CalendarCheck,
  CalendarRange,
  ClipboardList,
  Dumbbell,
  Users,
} from "lucide-react";
import type { Metadata } from "next";

import { ActividadReciente } from "@/components/dashboard/actividad-reciente";
import { GraficoAltasAlumnos } from "@/components/dashboard/grafico-altas-alumnos";
import { GraficoAsistenciaSemanal } from "@/components/dashboard/grafico-asistencia-semanal";
import { GraficoDistribucionEdades } from "@/components/dashboard/grafico-distribucion-edades";
import { GraficoDonutAsistencia } from "@/components/dashboard/grafico-donut-asistencia";
import { GraficoMedicionesMes } from "@/components/dashboard/grafico-mediciones-mes";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PodioRanking, type PuestoPodio } from "@/components/dashboard/podio-ranking";
import { Card, CardContent } from "@/components/ui/card";
import {
  obtenerActividadReciente,
  obtenerAltasPorMes,
  obtenerAsistenciaMesActual,
  obtenerAsistenciaPorSemana,
  obtenerDistribucionAlumnos,
  obtenerKpis,
  obtenerMedicionesPorMes,
} from "@/lib/consultas/dashboard";
import { obtenerEjerciciosConModulos } from "@/lib/consultas/ejercicios";
import type { EjercicioConModulos } from "@/types/ejercicios";
import {
  obtenerRanking,
  obtenerRankingTotal,
  type PuestoRanking,
} from "@/lib/consultas/rankings";
import { formatearEtapas } from "@/lib/etapas";
import { formatearValor } from "@/lib/evolucion";
import { fechaLocalISO, formatearFecha } from "@/lib/fechas";
import { createClient } from "@/lib/supabase/server";
import { formatearSegundos } from "@/lib/tiempo";

export const metadata: Metadata = { title: "Panel" };

function aPuestosPodio(
  ranking: PuestoRanking[],
  ejercicio: EjercicioConModulos,
  esTotal: boolean,
): PuestoPodio[] {
  const modulo = esTotal ? null : ejercicio.ejercicio_modulos[0];
  return ranking.slice(0, 3).map((puesto) => {
    let valorFormateado: string;
    let tiempoFormateado: string | null = null;

    if (esTotal || !modulo) {
      valorFormateado = String(puesto.mejorValor);
      if (puesto.tiempo_segundos) {
        tiempoFormateado = formatearSegundos(puesto.tiempo_segundos);
      }
    } else if (modulo.etapas) {
      valorFormateado = formatearEtapas(puesto.mejorValor, modulo.etapas);
      if (puesto.tiempo_segundos) {
        tiempoFormateado = formatearSegundos(puesto.tiempo_segundos);
      }
    } else {
      valorFormateado = formatearValor(puesto.mejorValor, modulo.tipo_medicion);
      if (modulo.unidad) valorFormateado += ` ${modulo.unidad}`;
      if (puesto.tiempo_segundos) {
        tiempoFormateado = formatearSegundos(puesto.tiempo_segundos);
      }
    }

    return {
      alumno_id: puesto.alumno_id,
      nombre: puesto.nombre,
      apellido: puesto.apellido,
      valorFormateado,
      tiempoFormateado,
      fecha: puesto.fecha,
    };
  });
}

export default async function PaginaPanel() {
  const supabase = await createClient();
  const ejercicios = await obtenerEjerciciosConModulos(supabase);

  const [
    kpis,
    asistenciaSemanal,
    asistenciaMes,
    medicionesPorMes,
    altasPorMes,
    distribucion,
    actividad,
    rankings,
  ] = await Promise.all([
    obtenerKpis(supabase),
    obtenerAsistenciaPorSemana(supabase, 12),
    obtenerAsistenciaMesActual(supabase),
    obtenerMedicionesPorMes(supabase, 12),
    obtenerAltasPorMes(supabase, 12),
    obtenerDistribucionAlumnos(supabase),
    obtenerActividadReciente(supabase, 8),
    Promise.all(
      ejercicios.map((e) =>
        e.ejercicio_modulos.length > 1
          ? obtenerRankingTotal(supabase, e.id)
          : e.ejercicio_modulos[0]
            ? obtenerRanking(
                supabase,
                e.ejercicio_modulos[0].id,
                e.ejercicio_modulos[0].direccion_ranking,
              )
            : Promise.resolve([]),
      ),
    ),
  ]);

  const hayAsistenciaSemanal = asistenciaSemanal.some(
    (s) => s.presentes + s.ausentes > 0,
  );
  const hayMediciones = medicionesPorMes.some((m) => m.cantidad > 0);
  const hayAltas = altasPorMes.some((m) => m.cantidad > 0);
  const hayEdades = distribucion.porEdad.some((r) => r.cantidad > 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-4xl uppercase">Panel</h1>
        <p className="text-base text-muted-foreground">
          Resumen general al {formatearFecha(fechaLocalISO())}
        </p>
      </div>

      {/* KPIs */}
      <section
        aria-label="Indicadores generales"
        className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5"
      >
        <KpiCard
          etiqueta="Alumnos activos"
          valor={String(kpis.alumnosActivos)}
          Icono={Users}
        />
        <KpiCard
          etiqueta="Asistencia hoy"
          valor={
            kpis.registradosHoy > 0
              ? `${kpis.presentesHoy}/${kpis.registradosHoy}`
              : "—"
          }
          detalle={
            kpis.registradosHoy > 0
              ? "presentes / registrados"
              : "sin registros hoy"
          }
          Icono={CalendarCheck}
        />
        <KpiCard
          etiqueta="Asistencia 7 días"
          valor={
            kpis.porcentajeSemana !== null ? `${kpis.porcentajeSemana}%` : "—"
          }
          detalle="presentes sobre registrados"
          Icono={CalendarRange}
        />
        <KpiCard
          etiqueta="Mediciones este mes"
          valor={String(kpis.medicionesMes)}
          Icono={ClipboardList}
        />
        <KpiCard
          etiqueta="Ejercicios activos"
          valor={String(kpis.ejerciciosActivos)}
          Icono={Dumbbell}
        />
      </section>

      {/* Asistencia */}
      <section aria-label="Asistencia" className="flex flex-col gap-3">
        <h2 className="label-caps text-muted-foreground">Asistencia</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="flex flex-col gap-3 p-4">
              <p className="text-base font-semibold">
                Asistencia por semana (últimas 12)
              </p>
              {hayAsistenciaSemanal ? (
                <GraficoAsistenciaSemanal datos={asistenciaSemanal} />
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Todavía no hay asistencias registradas.
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-3 p-4">
              <p className="text-base font-semibold">Asistencia del mes</p>
              {asistenciaMes.porcentaje !== null ? (
                <>
                  <GraficoDonutAsistencia resumen={asistenciaMes} />
                  <div className="flex justify-around text-sm">
                    <span>
                      <span className="numeros-marca font-bold text-success">
                        {asistenciaMes.presentes}
                      </span>{" "}
                      <span className="text-muted-foreground">presentes</span>
                    </span>
                    <span>
                      <span className="numeros-marca font-bold text-destructive">
                        {asistenciaMes.ausentes}
                      </span>{" "}
                      <span className="text-muted-foreground">ausentes</span>
                    </span>
                  </div>
                </>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Todavía no hay asistencias este mes.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Entrenamiento */}
      <section aria-label="Entrenamiento" className="flex flex-col gap-3">
        <h2 className="label-caps text-muted-foreground">Entrenamiento</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardContent className="flex flex-col gap-3 p-4">
              <p className="text-base font-semibold">Mediciones por mes</p>
              {hayMediciones ? (
                <GraficoMedicionesMes datos={medicionesPorMes} />
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Todavía no hay mediciones cargadas.
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-3 p-4">
              <p className="text-base font-semibold">Altas de alumnos por mes</p>
              {hayAltas ? (
                <GraficoAltasAlumnos datos={altasPorMes} />
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Todavía no hay altas registradas en el último año.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Rankings */}
      {ejercicios.length > 0 && (
        <section aria-label="Rankings" className="flex flex-col gap-3">
          <h2 className="label-caps text-muted-foreground">Rankings</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ejercicios.map((ejercicio, i) => {
              const esTotal = ejercicio.ejercicio_modulos.length > 1;
              return (
                <PodioRanking
                  key={ejercicio.id}
                  titulo={ejercicio.nombre}
                  descripcion={
                    esTotal
                      ? "Top 3 · total general"
                      : `Top 3 · ${ejercicio.ejercicio_modulos[0]?.nombre ?? ""}`
                  }
                  puestos={aPuestosPodio(rankings[i] ?? [], ejercicio, esTotal)}
                  hrefRankingCompleto={`/rankings?ejercicio=${ejercicio.id}`}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Alumnos y actividad */}
      <section aria-label="Alumnos y actividad" className="flex flex-col gap-3">
        <h2 className="label-caps text-muted-foreground">Alumnos y actividad</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardContent className="flex flex-col gap-3 p-4">
              <p className="text-base font-semibold">Distribución por edad</p>
              {hayEdades ? (
                <>
                  <GraficoDistribucionEdades datos={distribucion.porEdad} />
                  <div className="flex gap-2">
                    {distribucion.porOrigen.map(({ origen, cantidad }) => (
                      <span
                        key={origen}
                        className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground"
                      >
                        {origen === "app" ? "Carga interna" : "Inscripción"}:{" "}
                        <span className="numeros-marca font-bold">
                          {cantidad}
                        </span>
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Todavía no hay alumnos activos.
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardContent className="flex flex-col gap-3 p-4">
              <p className="text-base font-semibold">Actividad reciente</p>
              <ActividadReciente actividad={actividad} />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
