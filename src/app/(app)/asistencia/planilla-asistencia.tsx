"use client";

import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fechaLocalISO } from "@/lib/fechas";
import { cn } from "@/lib/utils";

import { guardarAsistencia } from "./actions";

type AlumnoItem = { id: string; nombre: string; apellido: string };
type Estado = "presente" | "ausente";

export function PlanillaAsistencia({
  fecha,
  alumnos,
  marcasGuardadas,
}: {
  fecha: string;
  alumnos: AlumnoItem[];
  marcasGuardadas: Record<string, Estado>;
}) {
  const router = useRouter();
  const [marcas, setMarcas] = useState<Record<string, Estado>>(marcasGuardadas);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  const presentes = Object.values(marcas).filter((e) => e === "presente").length;
  const ausentes = Object.values(marcas).filter((e) => e === "ausente").length;
  const hayCambios =
    Object.entries(marcas).some(([id, e]) => marcasGuardadas[id] !== e);

  function marcar(alumnoId: string, estado: Estado) {
    setMarcas((prev) => ({ ...prev, [alumnoId]: estado }));
  }

  function guardar() {
    setError(null);
    const lista = Object.entries(marcas).map(([alumno_id, estado]) => ({
      alumno_id,
      estado,
    }));
    startTransition(async () => {
      const resultado = await guardarAsistencia(fecha, lista);
      if (!resultado) return;
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      toast.success(`Asistencia guardada (${resultado.cantidad} alumnos).`);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="fecha">Fecha</Label>
        <Input
          id="fecha"
          type="date"
          value={fecha}
          max={fechaLocalISO()}
          onChange={(e) =>
            e.target.value &&
            router.push(`/asistencia?fecha=${e.target.value}`)
          }
          className="h-12"
        />
      </div>

      {/* Resumen del día */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="flex items-baseline justify-between p-4">
            <span className="text-sm text-muted-foreground">Presentes</span>
            <span className="numeros-marca text-2xl text-success">
              {presentes}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-baseline justify-between p-4">
            <span className="text-sm text-muted-foreground">Ausentes</span>
            <span className="numeros-marca text-2xl text-destructive">
              {ausentes}
            </span>
          </CardContent>
        </Card>
      </div>

      {!alumnos.length ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            No hay alumnos activos para tomar asistencia.
          </CardContent>
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {alumnos.map((alumno) => {
            const estado = marcas[alumno.id];
            return (
              <li key={alumno.id}>
                <Card>
                  <CardContent className="flex items-center justify-between gap-2 p-3">
                    <span className="min-w-0 truncate font-medium">
                      {alumno.apellido}, {alumno.nombre}
                    </span>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        aria-pressed={estado === "presente"}
                        aria-label={`Marcar presente a ${alumno.nombre} ${alumno.apellido}`}
                        onClick={() => marcar(alumno.id, "presente")}
                        className={cn(
                          "h-11 w-14",
                          estado === "presente" &&
                            "border-success bg-success text-success-foreground hover:bg-success hover:text-success-foreground",
                        )}
                      >
                        <Check className="size-5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        aria-pressed={estado === "ausente"}
                        aria-label={`Marcar ausente a ${alumno.nombre} ${alumno.apellido}`}
                        onClick={() => marcar(alumno.id, "ausente")}
                        className={cn(
                          "h-11 w-14",
                          estado === "ausente" &&
                            "border-destructive bg-destructive text-primary-foreground hover:bg-destructive hover:text-primary-foreground",
                        )}
                      >
                        <X className="size-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      {Object.keys(marcas).length > 0 && (
        <Button
          type="button"
          onClick={guardar}
          disabled={pendiente || !hayCambios}
          className="sticky bottom-20 h-12 text-base shadow-lg"
        >
          {pendiente
            ? "Guardando…"
            : hayCambios
              ? "Guardar asistencia"
              : "Asistencia al día"}
        </Button>
      )}
    </div>
  );
}
