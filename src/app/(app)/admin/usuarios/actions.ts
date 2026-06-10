"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { esquemaCrearUsuario } from "@/lib/validations/usuarios";

export type EstadoCrearUsuario =
  | { ok: true; mensaje: string }
  | { ok: false; error: string }
  | null;

export async function crearUsuario(
  _estadoPrevio: EstadoCrearUsuario,
  formData: FormData,
): Promise<EstadoCrearUsuario> {
  // Verificación de rol en el server: solo un admin puede crear usuarios.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada. Volvé a entrar." };

  const { data: perfil } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();
  if (perfil?.rol !== "admin") {
    return { ok: false, error: "Solo un admin puede crear usuarios." };
  }

  const datos = esquemaCrearUsuario.safeParse({
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    email: formData.get("email"),
    password: formData.get("password"),
    rol: formData.get("rol"),
  });
  if (!datos.success) {
    return { ok: false, error: datos.error.issues[0].message };
  }

  const { nombre, apellido, email, password, rol } = datos.data;

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nombre, apellido, rol },
  });

  if (error) {
    if (error.code === "email_exists") {
      return { ok: false, error: "Ya existe un usuario con ese email." };
    }
    return { ok: false, error: "No se pudo crear el usuario. Probá de nuevo." };
  }

  revalidatePath("/admin/usuarios");
  return { ok: true, mensaje: `Usuario ${nombre} ${apellido} creado.` };
}
