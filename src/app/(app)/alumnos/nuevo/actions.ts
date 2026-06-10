"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { esquemaAlumno } from "@/lib/validations/alumnos";

export type EstadoCrearAlumno = { error: string } | null;

export async function crearAlumno(
  _estadoPrevio: EstadoCrearAlumno,
  formData: FormData,
): Promise<EstadoCrearAlumno> {
  const datos = esquemaAlumno.safeParse({
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    fecha_nacimiento: formData.get("fecha_nacimiento"),
  });
  if (!datos.success) {
    return { error: datos.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesión expirada. Volvé a entrar." };

  const { error } = await supabase.from("alumnos").insert({
    ...datos.data,
    origen: "app",
    creado_por: user.id,
  });

  if (error) {
    return { error: "No se pudo guardar el alumno. Probá de nuevo." };
  }

  revalidatePath("/alumnos");
  redirect("/alumnos");
}
