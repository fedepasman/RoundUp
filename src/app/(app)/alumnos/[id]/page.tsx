import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  EvolucionAlumno,
  type MedicionHistorial,
} from "@/components/evolucion-alumno";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { obtenerRanking, obtenerRankingTotal } from "@/lib/consultas/rankings";
import { calcularEdad, formatearFecha } from "@/lib/fechas";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Ficha de alumno" };

export default async function PaginaFichaAlumno({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ejercicio?: string }>;
}) {
  const { id } = await params;
  const { ejercicio: ejercicioIdParam } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: alumno }, { data: perfil }] = await Promise.all([
    supabase.from("alumnos").select("*").eq("id", id).single(),
    user
      ? supabase.from("profiles").select("rol").eq("id", user.id).single()
      : Promise.resolve({ data: null }),
  ]);

  if (!alumno) notFound();
  const rol = perfil?.rol ?? "profesor";

  const [{ data: asistencias }, { data: medicionesCrudas }] =
    await Promise.all([
      supabase
        .from("asistencias")
        .select("fecha, estado")
        .eq("alumno_id", id)
        .order("fecha", { ascending: false })
        .limit(30),
      supabase
        .from("mediciones")
        .select(
          "id, fecha, ejercicio_id, ejercicios (nombre), medicion_valores (valor, tiempo_segundos, ejercicio_modulos (id, nombre, tipo_medicion, direccion_ranking, unidad, orden, etapas, tiempo_limite_segundos))",
        )
        .eq("alumno_id", id)
        .order("fecha", { ascending: false }),
    ]);

  const mediciones: MedicionHistorial[] = (medicionesCrudas ?? []).map(
    (m) => ({
      id: m.id,
      fecha: m.fecha,
      ejercicio_id: m.ejercicio_id,
      ejercicio_nombre:
        (m.ejercicios as unknown as { nombre: string })?.nombre ?? "",
      valores: (m.medicion_valores ?? []).map((v) => {
        const mod = v.ejercicio_modulos as unknown as {
          id: string;
          nombre: string;
          tipo_medicion: "tiempo" | "cantidad" | "numero";
          direccion_ranking: "asc" | "desc";
          unidad: string | null;
          orden: number;
          etapas: { nombre: string; objetivo: number }[] | null;
          tiempo_limite_segundos: number | null;
        };
        return {
          modulo_id: mod.id,
          modulo_nombre: mod.nombre,
          tipo_medicion: mod.tipo_medicion,
          direccion_ranking: mod.direccion_ranking,
          unidad: mod.unidad,
          orden: mod.orden,
          etapas: mod.etapas,
          tiempo_limite_segundos: mod.tiempo_limite_segundos ?? null,
          valor: Number(v.valor),
          tiempo_segundos: v.tiempo_segundos ? Number(v.tiempo_segundos) : null,
        };
      }),
    }),
  );

  // Posición del alumno en el ranking de cada módulo que midió.
  const modulosMedidos = new Map(
    mediciones.flatMap((m) =>
      m.valores.map((v) => [v.modulo_id, v.direccion_ranking] as const),
    ),
  );
  const rankings = await Promise.all(
    [...modulosMedidos.entries()].map(async ([moduloId, direccion]) => {
      const ranking = await obtenerRanking(supabase, moduloId, direccion);
      const posicion = ranking.findIndex((p) => p.alumno_id === id);
      return [
        moduloId,
        { posicion: posicion + 1, total: ranking.length },
      ] as const;
    }),
  );
  const posiciones = Object.fromEntries(
    rankings.filter(([, r]) => r.posicion > 0),
  );

  // Total rankings: one per ejercicio that has > 1 module
  const ejerciciosConMultiplesModulos = [
    ...new Map(
      mediciones
        .filter((m) => m.valores.length > 1)
        .map((m) => [m.ejercicio_id, true] as const),
    ).keys(),
  ];
  const rankingsTotales = await Promise.all(
    ejerciciosConMultiplesModulos.map(async (ejercicioId) => {
      const ranking = await obtenerRankingTotal(supabase, ejercicioId);
      const posicion = ranking.findIndex((p) => p.alumno_id === id);
      return [
        ejercicioId,
        { posicion: posicion + 1, total: ranking.length },
      ] as const;
    }),
  );
  const posicionesTotales = Object.fromEntries(
    rankingsTotales.filter(([, r]) => r.posicion > 0),
  );

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

      <Tabs defaultValue="evolucion">
        <TabsList className="w-full">
          <TabsTrigger value="evolucion" className="flex-1">
            Evolución
          </TabsTrigger>
          <TabsTrigger value="asistencia" className="flex-1">
            Asistencia
          </TabsTrigger>
          <TabsTrigger value="datos" className="flex-1">
            Datos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="datos">
          <Card>
            <CardContent className="flex flex-col gap-3 p-4 text-base">
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
              <CardContent className="p-4 text-base text-muted-foreground">
                Todavía no hay asistencias registradas.
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              <Card>
                <CardContent className="flex items-baseline justify-between p-4">
                  <span className="text-base text-muted-foreground">
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
                      className="flex items-center justify-between border-b py-2 text-base last:border-b-0"
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
          <EvolucionAlumno
            mediciones={mediciones}
            posiciones={posiciones}
            posicionesTotales={posicionesTotales}
            ejercicioIdInicial={ejercicioIdParam}
            rol={rol}
          />
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
