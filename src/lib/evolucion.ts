import { formatearSegundos } from "@/lib/tiempo";
import type { DireccionRanking, TipoMedicion } from "@/types/ejercicios";

/**
 * % de mejora entre dos marcas, respetando la dirección del módulo:
 * desc (mayor es mejor): subir de 20 a 25 reps = +25%
 * asc  (menor es mejor): bajar de 100s a 90s   = +10%
 * Positivo = mejoró. null si no se puede calcular.
 */
export function calcularMejora(
  anterior: number,
  actual: number,
  direccion: DireccionRanking,
): number | null {
  if (anterior <= 0) return null;
  const delta =
    direccion === "desc" ? actual - anterior : anterior - actual;
  return Math.round((delta / anterior) * 1000) / 10;
}

/** Valor según el tipo del módulo: tiempo → "1:35", resto → número. */
export function formatearValor(valor: number, tipo: TipoMedicion): string {
  if (tipo === "tiempo") return formatearSegundos(valor);
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(2);
}

/** Valor + tiempo para módulos con cronometraje (Testeo). */
export function formatearValorConTiempo(
  valor: number,
  tipo: TipoMedicion,
  tiempo_segundos: number | null,
): string {
  const valor_str = formatearValor(valor, tipo);
  if (!tiempo_segundos) return valor_str;
  return `${valor_str} · ${formatearSegundos(tiempo_segundos)}`;
}
