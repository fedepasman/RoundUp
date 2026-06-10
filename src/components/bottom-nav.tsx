"use client";

import {
  CalendarCheck,
  Home,
  Plus,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", etiqueta: "Inicio", Icono: Home },
  { href: "/alumnos", etiqueta: "Alumnos", Icono: Users },
  { href: "/mediciones/nueva", etiqueta: "Cargar", Icono: Plus, destacado: true },
  { href: "/asistencia", etiqueta: "Asistencia", Icono: CalendarCheck },
  { href: "/rankings", etiqueta: "Rankings", Icono: Trophy },
] as const;

export function BottomNav() {
  const rutaActual = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-card pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {ITEMS.map(({ href, etiqueta, Icono, ...item }) => {
          const activo =
            href === "/" ? rutaActual === "/" : rutaActual.startsWith(href);
          const destacado = "destacado" in item;

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={activo ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                  activo ? "text-primary" : "text-muted-foreground",
                )}
              >
                {destacado ? (
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Icono className="size-5" />
                  </span>
                ) : (
                  <Icono className="size-5" />
                )}
                <span className={cn(destacado && "sr-only")}>{etiqueta}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
