import Link from "next/link";

import type { ActividadReciente as Actividad } from "@/lib/consultas/dashboard";
import { formatearFecha } from "@/lib/fechas";
import { cn } from "@/lib/utils";

export function ActividadReciente({ actividad }: { actividad: Actividad }) {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      <div className="flex flex-col gap-2">
        <p className="label-caps text-muted-foreground">Últimas mediciones</p>
        {!actividad.mediciones.length ? (
          <p className="text-sm text-muted-foreground">Sin mediciones aún.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {actividad.mediciones.map((m, i) => (
              <li key={i} className="text-sm">
                <Link
                  href={`/alumnos/${m.alumno_id}`}
                  className="font-medium hover:underline"
                >
                  {m.alumno}
                </Link>
                <span className="text-muted-foreground">
                  {" "}
                  — {m.ejercicio} · {formatearFecha(m.fecha)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="label-caps text-muted-foreground">Últimas asistencias</p>
        {!actividad.asistencias.length ? (
          <p className="text-sm text-muted-foreground">Sin asistencias aún.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {actividad.asistencias.map((a, i) => (
              <li key={i} className="text-sm">
                <Link
                  href={`/alumnos/${a.alumno_id}`}
                  className="font-medium hover:underline"
                >
                  {a.alumno}
                </Link>{" "}
                <span
                  className={cn(
                    "font-semibold",
                    a.estado === "presente"
                      ? "text-success"
                      : "text-destructive",
                  )}
                >
                  {a.estado}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  · {formatearFecha(a.fecha)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="label-caps text-muted-foreground">Alumnos nuevos</p>
        {!actividad.alumnosNuevos.length ? (
          <p className="text-sm text-muted-foreground">Sin altas aún.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {actividad.alumnosNuevos.map((alumno) => (
              <li key={alumno.id} className="text-sm">
                <Link
                  href={`/alumnos/${alumno.id}`}
                  className="font-medium hover:underline"
                >
                  {alumno.nombre} {alumno.apellido}
                </Link>
                <span className="text-muted-foreground">
                  {" "}
                  · {formatearFecha(alumno.created_at.slice(0, 10))}
                  {alumno.origen === "formulario" ? " · se inscribió" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
