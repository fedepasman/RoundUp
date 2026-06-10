export type Alumno = {
  id: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  activo: boolean;
  origen: "app" | "formulario";
  user_id: string | null;
  creado_por: string | null;
  created_at: string;
  updated_at: string;
};
