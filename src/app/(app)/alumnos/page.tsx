import { Search, UserPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { calcularEdad } from "@/lib/fechas";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Alumnos" };

export default async function PaginaAlumnos({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let consulta = supabase
    .from("alumnos")
    .select("id, nombre, apellido, fecha_nacimiento, activo, origen")
    .order("apellido")
    .order("nombre");

  if (q?.trim()) {
    const termino = q.trim().replaceAll("%", "");
    consulta = consulta.or(
      `nombre.ilike.%${termino}%,apellido.ilike.%${termino}%`,
    );
  }

  const { data: alumnos } = await consulta;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl uppercase">Alumnos</h1>
        <Button asChild className="h-11">
          <Link href="/alumnos/nuevo">
            <UserPlus className="size-4" />
            Nuevo
          </Link>
        </Button>
      </div>

      <form action="/alumnos" className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nombre o apellido"
          className="h-12 pl-9"
        />
      </form>

      {!alumnos?.length ? (
        <Card>
          <CardContent className="p-6 text-center text-base text-muted-foreground">
            {q
              ? `No encontramos alumnos para “${q}”.`
              : "Todavía no hay alumnos. Cargá el primero con “Nuevo”."}
          </CardContent>
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {alumnos.map((alumno) => (
            <li key={alumno.id}>
              <Link href={`/alumnos/${alumno.id}`}>
                <Card>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-semibold">
                        {alumno.apellido}, {alumno.nombre}
                      </p>
                      <p className="text-base text-muted-foreground">
                        {calcularEdad(alumno.fecha_nacimiento)} años
                      </p>
                    </div>
                    {!alumno.activo && (
                      <Badge variant="secondary">Inactivo</Badge>
                    )}
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
