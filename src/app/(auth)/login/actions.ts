"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { esquemaLogin } from "@/lib/validations/usuarios";

export type EstadoLogin = { error: string } | null;

export async function iniciarSesion(
  _estadoPrevio: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const datos = esquemaLogin.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!datos.success) {
    return { error: datos.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(datos.data);

  if (error) {
    return { error: "Email o contraseña incorrectos" };
  }

  redirect("/");
}

export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
