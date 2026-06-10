/** Fecha local en formato YYYY-MM-DD (para columnas `date` e inputs type=date). */
export function fechaLocalISO(fecha: Date = new Date()): string {
  const offset = fecha.getTimezoneOffset() * 60000;
  return new Date(fecha.getTime() - offset).toISOString().slice(0, 10);
}

/** Edad en años a partir de una fecha YYYY-MM-DD. */
export function calcularEdad(fechaNacimiento: string): number {
  const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const cumplio =
    hoy.getMonth() > nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() &&
      hoy.getDate() >= nacimiento.getDate());
  if (!cumplio) edad--;
  return edad;
}

/** "1990-04-23" → "23/04/1990" */
export function formatearFecha(fechaISO: string): string {
  const [anio, mes, dia] = fechaISO.slice(0, 10).split("-");
  return `${dia}/${mes}/${anio}`;
}
