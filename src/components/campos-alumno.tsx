import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fechaLocalISO } from "@/lib/fechas";

/** Campos compartidos entre el alta interna y el formulario público. */
export function CamposAlumno() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input id="nombre" name="nombre" required maxLength={100} className="h-12" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="apellido">Apellido</Label>
        <Input id="apellido" name="apellido" required maxLength={100} className="h-12" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="fecha_nacimiento">Fecha de nacimiento</Label>
        <Input
          id="fecha_nacimiento"
          name="fecha_nacimiento"
          type="date"
          required
          min="1920-01-02"
          max={fechaLocalISO()}
          className="h-12"
        />
      </div>
    </>
  );
}
