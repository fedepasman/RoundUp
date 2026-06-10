import type { Metadata } from "next";

import { Proximamente } from "@/components/proximamente";

export const metadata: Metadata = { title: "Asistencia" };

export default function PaginaAsistencia() {
  return <Proximamente titulo="Asistencia" etapa="v0.6.0" />;
}
