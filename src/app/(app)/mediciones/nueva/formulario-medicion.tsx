"use client";

import { Search, X } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fechaLocalISO } from "@/lib/fechas";
import type { EjercicioConModulos } from "@/types/ejercicios";

import { guardarMedicion } from "./actions";

type AlumnoItem = { id: string; nombre: string; apellido: string };

export function FormularioMedicion({
  ejercicios,
  alumnos,
}: {
  ejercicios: EjercicioConModulos[];
  alumnos: AlumnoItem[];
}) {
  const [ejercicioId, setEjercicioId] = useState(ejercicios[0]?.id ?? "");
  const [fecha, setFecha] = useState(fechaLocalISO());
  const [alumno, setAlumno] = useState<AlumnoItem | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [duplicado, setDuplicado] = useState(false);
  // Cambiar la key reinicia los inputs de valores para el próximo alumno.
  const [rondaCarga, setRondaCarga] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const [pendiente, startTransition] = useTransition();

  const ejercicio = ejercicios.find((e) => e.id === ejercicioId);

  const alumnosFiltrados = busqueda.trim()
    ? alumnos.filter((a) =>
        `${a.nombre} ${a.apellido}`
          .toLowerCase()
          .includes(busqueda.trim().toLowerCase()),
      )
    : alumnos;

  function enviar(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const resultado = await guardarMedicion(null, formData);
      if (!resultado) return;
      if ("duplicado" in resultado) {
        setDuplicado(true);
        return;
      }
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      // Guardado: queda el ejercicio y la fecha para el próximo alumno.
      toast.success(`Medición guardada para ${resultado.nombreAlumno}.`);
      setAlumno(null);
      setBusqueda("");
      setDuplicado(false);
      setRondaCarga((n) => n + 1);
    });
  }

  function reemplazarExistente() {
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    formData.set("sobrescribir", "true");
    setDuplicado(false);
    enviar(formData);
  }

  function limpiarSeleccion() {
    setAlumno(null);
    setDuplicado(false);
    setError(null);
    setRondaCarga((n) => n + 1);
  }

  if (!ejercicios.length) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          No hay ejercicios cargados todavía.
        </CardContent>
      </Card>
    );
  }

  return (
    <form ref={formRef} action={enviar} className="flex flex-col gap-4">
      <input type="hidden" name="ejercicio_id" value={ejercicioId} />
      <input type="hidden" name="sobrescribir" value="false" />

      {/* 1. Ejercicio */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="ejercicio">Ejercicio</Label>
        <Select
          value={ejercicioId}
          onValueChange={(v) => {
            setEjercicioId(v);
            setDuplicado(false);
          }}
        >
          <SelectTrigger id="ejercicio" className="h-12 w-full">
            <SelectValue placeholder="Elegí un ejercicio" />
          </SelectTrigger>
          <SelectContent>
            {ejercicios.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 2. Fecha */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="fecha">Fecha</Label>
        <Input
          id="fecha"
          name="fecha"
          type="date"
          value={fecha}
          max={fechaLocalISO()}
          onChange={(e) => {
            setFecha(e.target.value);
            setDuplicado(false);
          }}
          required
          className="h-12"
        />
      </div>

      {/* 3. Alumno */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="buscar-alumno">Alumno</Label>
        {alumno ? (
          <div className="flex h-12 items-center justify-between rounded-lg border bg-accent px-4">
            <span className="font-semibold text-accent-foreground">
              {alumno.apellido}, {alumno.nombre}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Quitar alumno"
              onClick={limpiarSeleccion}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="buscar-alumno"
                type="search"
                placeholder="Buscar alumno"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="h-12 pl-9"
              />
            </div>
            <ul className="max-h-56 overflow-y-auto rounded-lg border">
              {alumnosFiltrados.length === 0 && (
                <li className="p-3 text-sm text-muted-foreground">
                  No hay alumnos para esa búsqueda.
                </li>
              )}
              {alumnosFiltrados.map((a) => (
                <li key={a.id} className="border-b last:border-b-0">
                  <button
                    type="button"
                    onClick={() => setAlumno(a)}
                    className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-muted"
                  >
                    {a.apellido}, {a.nombre}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
        <input type="hidden" name="alumno_id" value={alumno?.id ?? ""} />
      </div>

      {/* 4. Valores de los módulos: se habilitan al elegir alumno */}
      {alumno && ejercicio && (
        <Card key={`${ejercicio.id}-${rondaCarga}`}>
          <CardContent className="flex flex-col gap-4 p-4">
            {ejercicio.ejercicio_modulos.map((modulo) => (
              <div key={modulo.id} className="flex flex-col gap-2">
                <Label htmlFor={`valor_${modulo.id}`}>
                  {modulo.nombre}
                  {modulo.unidad ? ` (${modulo.unidad})` : ""}
                </Label>
                <Input
                  id={`valor_${modulo.id}`}
                  name={`valor_${modulo.id}`}
                  required
                  className="numeros-marca h-12 text-lg"
                  {...(modulo.tipo_medicion === "tiempo"
                    ? {
                        type: "text",
                        inputMode: "numeric" as const,
                        placeholder: "mm:ss",
                        pattern: "\\d{1,3}(:[0-5]?\\d)?",
                        title: "Formato mm:ss, por ejemplo 1:35",
                      }
                    : {
                        type: "number",
                        inputMode: "numeric" as const,
                        min: 0,
                        step: modulo.tipo_medicion === "numero" ? "0.01" : "1",
                        placeholder: "0",
                      })}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {duplicado && (
        <Card className="border-primary">
          <CardContent className="flex flex-col gap-3 p-4">
            <p className="text-sm font-medium">
              Ya hay una medición de {ejercicio?.nombre} para este alumno en
              esta fecha. ¿Querés reemplazar los valores?
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="destructive"
                className="h-11 flex-1"
                disabled={pendiente}
                onClick={reemplazarExistente}
              >
                Sí, reemplazar
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1"
                onClick={limpiarSeleccion}
              >
                No, cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      {alumno && !duplicado && (
        <Button type="submit" disabled={pendiente} className="h-12 text-base">
          {pendiente ? "Guardando…" : "Guardar medición"}
        </Button>
      )}
    </form>
  );
}
