"use client";

import { useRouter } from "next/navigation";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EjercicioConModulos } from "@/types/ejercicios";

export function SelectorRanking({
  ejercicios,
  ejercicioId,
  moduloId,
}: {
  ejercicios: EjercicioConModulos[];
  ejercicioId: string;
  moduloId: string;
}) {
  const router = useRouter();
  const ejercicio = ejercicios.find((e) => e.id === ejercicioId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="ejercicio-ranking">Ejercicio</Label>
        <Select
          value={ejercicioId}
          onValueChange={(v) => router.push(`/rankings?ejercicio=${v}`)}
        >
          <SelectTrigger id="ejercicio-ranking" className="h-12 w-full">
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

      {ejercicio && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="modulo-ranking">Módulo</Label>
          <Select
            value={moduloId}
            onValueChange={(v) =>
              router.push(`/rankings?ejercicio=${ejercicioId}&modulo=${v}`)
            }
          >
            <SelectTrigger id="modulo-ranking" className="h-12 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ejercicio.ejercicio_modulos.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
