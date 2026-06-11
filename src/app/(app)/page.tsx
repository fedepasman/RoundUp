import {
  CalendarCheck,
  ClipboardList,
  ClipboardPlus,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

const ACCESOS = [
  {
    href: "/mediciones/nueva",
    etiqueta: "Cargar medición",
    Icono: ClipboardPlus,
    destacado: true,
  },
  { href: "/asistencia", etiqueta: "Tomar asistencia", Icono: CalendarCheck },
  { href: "/alumnos", etiqueta: "Ver alumnos", Icono: Users },
  { href: "/rankings", etiqueta: "Ver rankings", Icono: Trophy },
  { href: "/reportes", etiqueta: "Ver reportes", Icono: ClipboardList },
] as const;

export default async function PaginaInicio() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { count: totalAlumnos },
    { data: ultimosAlumnos },
    { data: medicionesRecientes },
    { data: asistenciasRecientes },
  ] = await Promise.all([
    supabase.from("alumnos").select("*", { count: "exact", head: true }),
    supabase
      .from("alumnos")
      .select("id, nombre, apellido, origen")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("mediciones")
      .select(
        "fecha, alumnos (nombre, apellido), ejercicios (nombre), medicion_valores (valor)",
      )
      .order("fecha", { ascending: false })
      .limit(5),
    supabase
      .from("asistencias")
      .select("fecha, estado, alumnos (nombre, apellido)")
      .order("fecha", { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <section aria-label="Accesos rápidos" className="grid grid-cols-2 gap-3">
        {ACCESOS.map(({ href, etiqueta, Icono, ...acceso }) => (
          <Link key={href} href={href}>
            <Card
              className={
                "destacado" in acceso
                  ? "border-primary bg-primary text-primary-foreground"
                  : undefined
              }
            >
              <CardContent className="flex min-h-24 flex-col justify-between gap-2 p-4">
                <Icono className="size-6" />
                <span className="text-base font-semibold leading-tight">
                  {etiqueta}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold uppercase tracking-wide text-muted-foreground">
          Resumen
        </h2>
        <Card>
          <CardContent className="flex items-baseline justify-between p-4">
            <span className="text-base text-muted-foreground">
              Alumnos totales
            </span>
            <span className="numeros-marca text-4xl">{totalAlumnos ?? 0}</span>
          </CardContent>
        </Card>
        {!!ultimosAlumnos?.length && (
          <Card>
            <CardContent className="flex flex-col gap-2 p-4">
              <span className="text-base text-muted-foreground">
                Últimos alumnos
              </span>
              <ul className="flex flex-col gap-1">
                {ultimosAlumnos.map((alumno) => (
                  <li key={alumno.id}>
                    <Link
                      href={`/alumnos/${alumno.id}`}
                      className="flex items-center justify-between text-base font-medium"
                    >
                      {alumno.nombre} {alumno.apellido}
                      <span className="text-sm text-muted-foreground">
                        {alumno.origen === "formulario" ? "se inscribió" : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        {medicionesRecientes && medicionesRecientes.length > 0 && (
          <Card>
            <CardContent className="flex flex-col gap-2 p-4">
              <span className="text-base text-muted-foreground">
                Mediciones recientes
              </span>
              <ul className="flex flex-col gap-1">
                {medicionesRecientes.slice(0, 3).map((m, i) => {
                  const alumno = m.alumnos as unknown as {
                    nombre: string;
                    apellido: string;
                  };
                  const ej = m.ejercicios as unknown as { nombre: string };
                  return (
                    <li key={i} className="text-sm text-muted-foreground">
                      {alumno.nombre} {alumno.apellido} —{" "}
                      <span className="font-medium text-foreground">
                        {ej.nombre}
                      </span>{" "}
                      ({m.fecha})
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}

        {asistenciasRecientes && asistenciasRecientes.length > 0 && (
          <Card>
            <CardContent className="flex flex-col gap-2 p-4">
              <span className="text-base text-muted-foreground">
                Asistencias recientes
              </span>
              <ul className="flex flex-col gap-1">
                {asistenciasRecientes.slice(0, 3).map((a, i) => {
                  const alumno = a.alumnos as unknown as {
                    nombre: string;
                    apellido: string;
                  };
                  return (
                    <li key={i} className="text-sm">
                      <span className="text-muted-foreground">
                        {alumno.nombre} {alumno.apellido}
                      </span>{" "}
                      —{" "}
                      <span
                        className={
                          a.estado === "presente"
                            ? "font-medium text-green-600"
                            : "font-medium text-red-600"
                        }
                      >
                        {a.estado}
                      </span>{" "}
                      ({a.fecha})
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
