import { z } from "zod";

export const esquemaLogin = z.object({
  email: z.email("Ingresá un email válido"),
  password: z.string().min(1, "Ingresá tu contraseña"),
});

export const esquemaCrearUsuario = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(100),
  apellido: z.string().trim().min(1, "El apellido es obligatorio").max(100),
  email: z.email("Ingresá un email válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(72),
  rol: z.enum(["admin", "profesor"], {
    error: "Elegí un rol válido",
  }),
});
