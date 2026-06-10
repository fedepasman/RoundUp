import { LogOut, ShieldUser } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { cerrarSesion } from "@/app/(auth)/login/actions";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
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

  const esAdmin = perfil?.rol === "admin";

  return (
    <div className="flex min-h-dvh flex-1 flex-col pb-16">
      <header className="sticky top-0 z-40 border-b bg-card">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link href="/" className="font-display text-xl uppercase">
            RoundUp
          </Link>
          <div className="flex items-center gap-1">
            {esAdmin && (
              <Button asChild variant="ghost" size="icon" aria-label="Usuarios">
                <Link href="/admin/usuarios">
                  <ShieldUser className="size-5" />
                </Link>
              </Button>
            )}
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
      <main className="mx-auto w-full max-w-lg flex-1 p-4">{children}</main>
      <BottomNav />
      <Toaster position="top-center" />
    </div>
  );
}
