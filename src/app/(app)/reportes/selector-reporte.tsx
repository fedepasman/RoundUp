"use client";

import { useRouter } from "next/navigation";

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

export function SelectorReporte({
  ejercicios,
  ejercicioId,
  fecha,
}: {
  ejercicios: EjercicioConModulos[];
  ejercicioId: string;
  fecha: string;
}) {
  const router = useRouter();

  function ir(nuevoEjercicio: string, nuevaFecha: string) {
    router.push(`/reportes?ejercicio=${nuevoEjercicio}&fecha=${nuevaFecha}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="ejercicio-reporte">Ejercicio</Label>
        <Select value={ejercicioId} onValueChange={(v) => ir(v, fecha)}>
          <SelectTrigger id="ejercicio-reporte" className="h-12 w-full">
            <SelectValue />
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

      <div className="flex flex-col gap-2">
        <Label htmlFor="fecha-reporte">Fecha</Label>
        <Input
          id="fecha-reporte"
          type="date"
          value={fecha}
          max={fechaLocalISO()}
          onChange={(e) => ir(ejercicioId, e.target.value)}
          className="h-12"
        />
      </div>
    </div>
  );
}
