import { Card, CardContent } from "@/components/ui/card";

export function Proximamente({
  titulo,
  etapa,
}: {
  titulo: string;
  etapa: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-4xl uppercase">{titulo}</h1>
      <Card>
        <CardContent className="p-4 text-base text-muted-foreground">
          Esta sección llega en la etapa {etapa}.
        </CardContent>
      </Card>
    </div>
  );
}
