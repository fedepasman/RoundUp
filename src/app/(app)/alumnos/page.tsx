import type { Metadata } from "next";

import { Proximamente } from "@/components/proximamente";

export const metadata: Metadata = { title: "Alumnos" };

export default function PaginaAlumnos() {
  return <Proximamente titulo="Alumnos" etapa="v0.3.0" />;
}
