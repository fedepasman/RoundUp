/**
 * Conversión entre el formato de carga "mm:ss" (o "ss") y los segundos
 * que se guardan en la base. Devuelve null si el texto no es válido.
 */
export function aSegundos(texto: string): number | null {
  const limpio = texto.trim();
  if (!limpio) return null;

  if (/^\d+$/.test(limpio)) {
    return Number(limpio);
  }

  const partes = limpio.match(/^(\d{1,3}):([0-5]?\d)$/);
  if (!partes) return null;
  return Number(partes[1]) * 60 + Number(partes[2]);
}

/** 95 → "1:35" */
export function formatearSegundos(segundos: number): string {
  const min = Math.floor(segundos / 60);
  const seg = Math.round(segundos % 60);
  return `${min}:${String(seg).padStart(2, "0")}`;
}
