import type { Metadata } from "next";

import { Proximamente } from "@/components/proximamente";

export const metadata: Metadata = { title: "Cargar medición" };

export default function PaginaNuevaMedicion() {
  return <Proximamente titulo="Cargar medición" etapa="v0.5.0" />;
}
