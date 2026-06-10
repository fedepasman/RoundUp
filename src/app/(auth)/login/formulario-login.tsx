"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { iniciarSesion, type EstadoLogin } from "./actions";

export function FormularioLogin() {
  const [estado, accion, pendiente] = useActionState<EstadoLogin, FormData>(
    iniciarSesion,
    null,
  );

  return (
    <form action={accion} className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-12"
          placeholder="profe@ejemplo.com"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-12"
        />
      </div>
      {estado?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {estado.error}
        </p>
      )}
      <Button type="submit" disabled={pendiente} className="h-12 text-base">
        {pendiente ? "Entrando…" : "Iniciar sesión"}
      </Button>
    </form>
  );
}
