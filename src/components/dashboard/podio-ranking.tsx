import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { formatearFecha } from "@/lib/fechas";
import { cn } from "@/lib/utils";

const ESTILO_NUMERO = [
  "text-yellow-600",
  "text-gray-500",
  "text-orange-700",
] as const;

export type PuestoPodio = {
  alumno_id: string;
  nombre: string;
  apellido: string;
  valorFormateado: string;
  tiempoFormateado: string | null;
  fecha: string;
};

export function PodioRanking({
  titulo,
  descripcion,
  puestos,
  hrefRankingCompleto,
}: {
  titulo: string;
  descripcion: string;
  puestos: PuestoPodio[];
  hrefRankingCompleto: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div>
          <p className="text-base font-semibold">{titulo}</p>
          <p className="text-sm text-muted-foreground">{descripcion}</p>
        </div>

        {!puestos.length ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay mediciones de este ejercicio.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {puestos.slice(0, 3).map((puesto, indice) => (
              <li key={puesto.alumno_id}>
                <Link
                  href={`/alumnos/${puesto.alumno_id}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-accent"
                >
                  <span
                    className={cn(
                      "numeros-marca w-6 shrink-0 text-center text-xl font-bold",
                      ESTILO_NUMERO[indice],
                    )}
                  >
                    {indice + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {puesto.apellido}, {puesto.nombre}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatearFecha(puesto.fecha)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="numeros-marca text-base">
                      {puesto.valorFormateado}
                    </p>
                    {puesto.tiempoFormateado && (
                      <p className="numeros-marca text-xs text-muted-foreground">
                        {puesto.tiempoFormateado}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Link
          href={hrefRankingCompleto}
          className="text-sm font-semibold text-accent-foreground"
        >
          Ver ranking completo →
        </Link>
      </CardContent>
    </Card>
  );
}
