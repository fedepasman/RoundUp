import type { Etapa } from "@/types/ejercicios";

/** Suma de los objetivos de todas las etapas (el 100% del test). */
export function objetivoEtapas(etapas: Etapa[] | null | undefined): number {
  return (etapas ?? []).reduce((s, e) => s + e.objetivo, 0);
}

/** % completado de un valor de reps respecto del objetivo total. */
export function porcentajeEtapas(
  valor: number,
  etapas: Etapa[] | null | undefined,
): number {
  const objetivo = objetivoEtapas(etapas);
  return objetivo > 0 ? Math.round((valor / objetivo) * 100) : 0;
}

/** "633/800 · 79%" para mostrar el resultado de un módulo por etapas. */
export function formatearEtapas(
  valor: number,
  etapas: Etapa[] | null | undefined,
): string {
  return `${valor}/${objetivoEtapas(etapas)} · ${porcentajeEtapas(valor, etapas)}%`;
}
