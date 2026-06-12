import { ArrowLeft, LogOut } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { cerrarSesion } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("rol, nombre")
    .eq("id", user.id)
    .single();

  if (perfil?.rol === "alumno") redirect("/");

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b bg-card">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6">
          <div className="flex items-baseline gap-3">
            <Link href="/dashboard" className="font-display text-2xl uppercase">
              RoundUp
            </Link>
            <span className="label-caps text-muted-foreground">Panel</span>
          </div>
          <div className="flex items-center gap-2">
            {perfil?.nombre && (
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {perfil.nombre}
              </span>
            )}
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <ArrowLeft className="size-4" />
                Volver a la app
              </Link>
            </Button>
            <form action={cerrarSesion}>
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                aria-label="Cerrar sesión"
              >
                <LogOut className="size-5" />
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-6 py-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
