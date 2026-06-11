import type { Metadata } from "next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { obtenerEjerciciosConModulos } from "@/lib/consultas/ejercicios";
import { obtenerFechasDisponibles, obtenerReporte } from "@/lib/consultas/reportes";
import { formatearValor, formatearValorConTiempo } from "@/lib/evolucion";
import { formatearEtapas } from "@/lib/etapas";
import { fechaLocalISO, formatearFecha } from "@/lib/fechas";
import { createClient } from "@/lib/supabase/server";

import { SelectorReporte } from "./selector-reporte";

export const metadata: Metadata = { title: "Reportes" };

export default async function PaginaReportes({
  searchParams,
}: {
  searchParams: Promise<{ ejercicio?: string; fecha?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const ejercicios = await obtenerEjerciciosConModulos(supabase);

  if (!ejercicios.length) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-3xl uppercase">Reportes</h1>
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            No hay ejercicios cargados todavía.
          </CardContent>
        </Card>
      </div>
    );
  }

  const ejercicio =
    ejercicios.find((e) => e.id === params.ejercicio) ?? ejercicios[0];
  const fecha = params.fecha ?? fechaLocalISO();
  const modulos = ejercicio.ejercicio_modulos
    .slice()
    .sort((a, b) => a.orden - b.orden);
  const conTotal = modulos.length > 1;
  const direccion = modulos[0]?.direccion_ranking ?? "desc";

  const fechasDisponibles = await obtenerFechasDisponibles(
    supabase,
    ejercicio.id,
  );
  const indiceFecha = fechasDisponibles.indexOf(fecha);
  const fechaAnterior = indiceFecha > 0 ? fechasDisponibles[indiceFecha - 1] : null;
  const fechaSiguiente =
    indiceFecha >= 0 && indiceFecha < fechasDisponibles.length - 1
      ? fechasDisponibles[indiceFecha + 1]
      : null;

  const filas = await obtenerReporte(supabase, ejercicio.id, fecha);
  filas.sort((a, b) =>
    direccion === "desc" ? b.total - a.total : a.total - b.total,
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-3xl uppercase">Reportes</h1>

      <div className="flex flex-col gap-3">
        <SelectorReporte
          ejercicios={ejercicios}
          ejercicioId={ejercicio.id}
          fecha={fecha}
        />

        {(fechaAnterior || fechaSiguiente) && (
          <div className="flex gap-2">
            {fechaAnterior ? (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                asChild
              >
                <Link href={`/reportes?ejercicio=${ejercicio.id}&fecha=${fechaAnterior}`}>
                  <ChevronLeft className="mr-1 size-4" />
                  Anterior
                </Link>
              </Button>
            ) : (
              <div className="flex-1" />
            )}

            {fechaSiguiente && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                asChild
              >
                <Link href={`/reportes?ejercicio=${ejercicio.id}&fecha=${fechaSiguiente}`}>
                  Siguiente
                  <ChevronRight className="ml-1 size-4" />
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {filas.length === 0
          ? `Sin mediciones el ${formatearFecha(fecha)}.`
          : `${filas.length} ${filas.length === 1 ? "alumno" : "alumnos"} el ${formatearFecha(fecha)}.`}
      </p>

      {filas.length === 0 ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Nadie tiene una medición de {ejercicio.nombre} para esta fecha.
            Probá con otra fecha u otro ejercicio.
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="sticky left-0 bg-card px-3 py-3 text-left font-semibold">
                    Alumno
                  </th>
                  {modulos.map((m) => (
                    <th
                      key={m.id}
                      className="px-3 py-3 text-right font-semibold whitespace-nowrap"
                    >
                      {m.nombre}
                    </th>
                  ))}
                  {conTotal && (
                    <th className="px-3 py-3 text-right font-semibold">
                      Total
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filas.map((fila) => (
                  <tr key={fila.alumno_id} className="border-b last:border-b-0">
                    <td className="sticky left-0 bg-card px-3 py-3">
                      <Link
                        href={`/alumnos/${fila.alumno_id}?ejercicio=${ejercicio.id}`}
                        className="font-medium whitespace-nowrap hover:underline"
                      >
                        {fila.apellido}, {fila.nombre}
                      </Link>
                    </td>
                    {modulos.map((m) => {
                      const valor = fila.valores[m.id];
                      const tiempo = fila.tiempos[m.id];
                      return (
                        <td
                          key={m.id}
                          className="numeros-marca px-3 py-3 text-right whitespace-nowrap"
                        >
                          {valor === undefined
                            ? "—"
                            : m.etapas
                              ? formatearEtapas(valor, m.etapas)
                              : tiempo !== null && tiempo !== undefined
                                ? formatearValorConTiempo(valor, m.tipo_medicion, tiempo)
                                : formatearValor(valor, m.tipo_medicion)}
                        </td>
                      );
                    })}
                    {conTotal && (
                      <td className="numeros-marca bg-accent px-3 py-3 text-right font-bold">
                        {formatearValor(fila.total, modulos[0].tipo_medicion)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
