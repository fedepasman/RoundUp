import type { Metadata } from "next";

import { Proximamente } from "@/components/proximamente";

export const metadata: Metadata = { title: "Rankings" };

export default function PaginaRankings() {
  return <Proximamente titulo="Rankings" etapa="v0.8.0" />;
}
