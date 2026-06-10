import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { calcularEdad, formatearFecha } from "@/lib/fechas";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Ficha de alumno" };

export default async function PaginaFichaAlumno({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: alumno } = await supabase
    .from("alumnos")
    .select("*")
    .eq("id", id)
    .single();

  if (!alumno) notFound();

  const { data: asistencias } = await supabase
    .from("asistencias")
    .select("fecha, estado")
    .eq("alumno_id", id)
    .order("fecha", { ascending: false })
    .limit(30);

  const totalAsistencias = asistencias?.length ?? 0;
  const presentes =
    asistencias?.filter((a) => a.estado === "presente").length ?? 0;
  const porcentajePresente = totalAsistencias
    ? Math.round((presentes / totalAsistencias) * 100)
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="font-display text-3xl uppercase">
            {alumno.nombre} {alumno.apellido}
          </h1>
          <p className="text-muted-foreground">
            {calcularEdad(alumno.fecha_nacimiento)} años
          </p>
        </div>
        {!alumno.activo && <Badge variant="secondary">Inactivo</Badge>}
      </div>

      <Tabs defaultValue="datos">
        <TabsList className="w-full">
          <TabsTrigger value="datos" className="flex-1">
            Datos
          </TabsTrigger>
          <TabsTrigger value="asistencia" className="flex-1">
            Asistencia
          </TabsTrigger>
          <TabsTrigger value="evolucion" className="flex-1">
            Evolución
          </TabsTrigger>
        </TabsList>

        <TabsContent value="datos">
          <Card>
            <CardContent className="flex flex-col gap-3 p-4 text-sm">
              <Dato etiqueta="Fecha de nacimiento">
                {formatearFecha(alumno.fecha_nacimiento)}
              </Dato>
              <Dato etiqueta="Origen del alta">
                {alumno.origen === "formulario"
                  ? "Formulario de inscripción"
                  : "Cargado desde la app"}
              </Dato>
              <Dato etiqueta="Alta">{formatearFecha(alumno.created_at)}</Dato>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="asistencia">
          {totalAsistencias === 0 ? (
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">
                Todavía no hay asistencias registradas.
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              <Card>
                <CardContent className="flex items-baseline justify-between p-4">
                  <span className="text-sm text-muted-foreground">
                    Presentismo (últimas {totalAsistencias})
                  </span>
                  <span className="numeros-marca text-3xl">
                    {porcentajePresente}%
                  </span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col p-4">
                  {asistencias!.map((a) => (
                    <div
                      key={a.fecha}
                      className="flex items-center justify-between border-b py-2 text-sm last:border-b-0"
                    >
                      <span>{formatearFecha(a.fecha)}</span>
                      <Badge
                        variant={
                          a.estado === "presente" ? "default" : "secondary"
                        }
                        className={
                          a.estado === "presente"
                            ? "bg-success text-success-foreground"
                            : undefined
                        }
                      >
                        {a.estado === "presente" ? "Presente" : "Ausente"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="evolucion">
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              Mediciones, gráficos de evolución y rankings llegan en las
              etapas v0.7.0 y v0.8.0.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Dato({
  etiqueta,
  children,
}: {
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{etiqueta}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}
