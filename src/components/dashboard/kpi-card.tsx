import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function KpiCard({
  etiqueta,
  valor,
  detalle,
  Icono,
}: {
  etiqueta: string;
  valor: string;
  detalle?: string;
  Icono: LucideIcon;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="label-caps text-muted-foreground">{etiqueta}</span>
          <Icono className="size-5 shrink-0 text-muted-foreground" />
        </div>
        <span className="numeros-marca text-4xl">{valor}</span>
        {detalle && (
          <span className="text-sm text-muted-foreground">{detalle}</span>
        )}
      </CardContent>
    </Card>
  );
}
