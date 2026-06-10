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
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              El historial de asistencia llega en la etapa v0.6.0.
            </CardContent>
          </Card>
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
