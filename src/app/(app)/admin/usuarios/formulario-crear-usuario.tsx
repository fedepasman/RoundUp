"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { crearUsuario, type EstadoCrearUsuario } from "./actions";

export function FormularioCrearUsuario() {
  const [estado, accion, pendiente] = useActionState<
    EstadoCrearUsuario,
    FormData
  >(crearUsuario, null);

  return (
    <Card>
      <CardContent className="p-4">
        <form action={accion} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" name="nombre" required className="h-12" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input id="apellido" name="apellido" required className="h-12" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="off"
              required
              className="h-12"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              className="h-12"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="rol">Rol</Label>
            <Select name="rol" defaultValue="profesor">
              <SelectTrigger id="rol" className="h-12 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profesor">Profesor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {estado && !estado.ok && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {estado.error}
            </p>
          )}
          {estado?.ok && (
            <p role="status" className="text-sm font-medium text-success">
              {estado.mensaje}
            </p>
          )}

          <Button type="submit" disabled={pendiente} className="h-12 text-base">
            {pendiente ? "Creando…" : "Crear usuario"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
