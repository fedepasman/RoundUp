import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { obtenerEjerciciosConModulos } from "@/lib/consultas/ejercicios";
import { obtenerRanking, obtenerRankingTotal } from "@/lib/consultas/rankings";
import { formatearValor } from "@/lib/evolucion";
import { formatearFecha } from "@/lib/fechas";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

import { SelectorRanking } from "./selector-ranking";

export const metadata: Metadata = { title: "Rankings" };

export default async function PaginaRankings({
  searchParams,
}: {
  searchParams: Promise<{ ejercicio?: string; modulo?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const ejercicios = await obtenerEjerciciosConModulos(supabase);

  if (!ejercicios.length) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-3xl uppercase">Rankings</h1>
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
  const esTotal = params.modulo === "__total__";
  const modulo = esTotal
    ? null
    : (ejercicio.ejercicio_modulos.find((m) => m.id === params.modulo) ??
      ejercicio.ejercicio_modulos[0]);

  const ranking = esTotal
    ? await obtenerRankingTotal(supabase, ejercicio.id)
    : modulo
      ? await obtenerRanking(supabase, modulo.id, modulo.direccion_ranking)
      : [];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-3xl uppercase">Rankings</h1>

      <SelectorRanking
        ejercicios={ejercicios}
        ejercicioId={ejercicio.id}
        moduloId={esTotal ? "__total__" : (modulo?.id ?? "")}
      />

      {esTotal ? (
        <p className="text-xs text-muted-foreground">
          Suma de todos los módulos. Mayor total gana.
        </p>
      ) : modulo && (
        <p className="text-xs text-muted-foreground">
          {modulo.direccion_ranking === "desc"
            ? "Gana la marca más alta."
            : "Gana la marca más baja."}
        </p>
      )}

      {!ranking.length ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Todavía no hay mediciones de este módulo. Las marcas aparecen acá
            apenas cargues la primera.
          </CardContent>
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {ranking.map((puesto, indice) => (
            <li key={puesto.alumno_id}>
              <Link href={`/alumnos/${puesto.alumno_id}`}>
                <Card
                  className={cn(
                    indice === 0 && "border-yellow-400 bg-yellow-100",
                    indice === 1 && "border-gray-400 bg-gray-200",
                    indice === 2 && "border-orange-400 bg-orange-100",
                  )}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <span
                      className={cn(
                        "numeros-marca w-8 shrink-0 text-center text-xl font-bold",
                        indice === 0 && "text-yellow-600",
                        indice === 1 && "text-gray-500",
                        indice === 2 && "text-orange-700",
                        indice > 2 && "text-muted-foreground",
                      )}
                    >
                      {indice + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {puesto.apellido}, {puesto.nombre}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatearFecha(puesto.fecha)}
                      </p>
                    </div>
                    <span className="numeros-marca shrink-0 text-2xl">
                      {esTotal
                        ? puesto.mejorValor
                        : modulo && formatearValor(puesto.mejorValor, modulo.tipo_medicion)}
                      {!esTotal && modulo?.unidad && (
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          {modulo.unidad}
                        </span>
                      )}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
