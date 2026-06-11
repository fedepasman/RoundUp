import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { FormularioCrearUsuario } from "./formulario-crear-usuario";

export const metadata: Metadata = { title: "Usuarios" };

export default async function PaginaUsuarios() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: perfil } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user!.id)
    .single();
  if (perfil?.rol !== "admin") redirect("/");

  const { data: usuarios } = await supabase
    .from("profiles")
    .select("id, nombre, apellido, rol, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-4xl uppercase">Usuarios</h1>
        <p className="text-base text-muted-foreground">
          Creá cuentas para profesores y admins.
        </p>
      </div>

      <FormularioCrearUsuario />

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-semibold uppercase tracking-wide text-muted-foreground">
          Equipo ({usuarios?.length ?? 0})
        </h2>
        {usuarios?.map((u) => (
          <Card key={u.id}>
            <CardContent className="flex items-center justify-between p-4">
              <span className="font-medium">
                {u.nombre} {u.apellido}
              </span>
              <Badge variant={u.rol === "admin" ? "default" : "secondary"}>
                {u.rol}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
