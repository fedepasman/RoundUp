import { z } from "zod";

export const esquemaAlumno = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(100),
  apellido: z.string().trim().min(1, "El apellido es obligatorio").max(100),
  fecha_nacimiento: z
    .string()
    .min(1, "La fecha de nacimiento es obligatoria")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Ingresá una fecha válida")
    .refine((v) => {
      const fecha = new Date(v);
      return fecha > new Date("1920-01-01") && fecha <= new Date();
    }, "La fecha de nacimiento no es válida"),
});
