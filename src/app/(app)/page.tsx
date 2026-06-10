import {
  CalendarCheck,
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
] as const;

export default async function PaginaInicio() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: perfil }, { count: totalAlumnos }, { data: ultimosAlumnos }] =
    await Promise.all([
      supabase.from("profiles").select("nombre").eq("id", user!.id).single(),
      supabase.from("alumnos").select("*", { count: "exact", head: true }),
      supabase
        .from("alumnos")
        .select("id, nombre, apellido, origen")
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-muted-foreground">Hola{perfil?.nombre ? `, ${perfil.nombre}` : ""} 👋</p>
        <h1 className="font-display text-3xl uppercase">Al ring</h1>
      </div>

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
                <span className="text-sm font-semibold leading-tight">
                  {etiqueta}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Resumen
        </h2>
        <Card>
          <CardContent className="flex items-baseline justify-between p-4">
            <span className="text-sm text-muted-foreground">
              Alumnos totales
            </span>
            <span className="numeros-marca text-3xl">{totalAlumnos ?? 0}</span>
          </CardContent>
        </Card>
        {!!ultimosAlumnos?.length && (
          <Card>
            <CardContent className="flex flex-col gap-2 p-4">
              <span className="text-sm text-muted-foreground">
                Últimos alumnos
              </span>
              <ul className="flex flex-col gap-1">
                {ultimosAlumnos.map((alumno) => (
                  <li key={alumno.id}>
                    <Link
                      href={`/alumnos/${alumno.id}`}
                      className="flex items-center justify-between text-sm font-medium"
                    >
                      {alumno.nombre} {alumno.apellido}
                      <span className="text-xs text-muted-foreground">
                        {alumno.origen === "formulario" ? "se inscribió" : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Mediciones y asistencias recientes llegan en las próximas etapas.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
