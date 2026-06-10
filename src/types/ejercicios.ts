export type TipoMedicion = "tiempo" | "cantidad" | "numero";
export type DireccionRanking = "asc" | "desc";

export type Ejercicio = {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
};

export type EjercicioModulo = {
  id: string;
  ejercicio_id: string;
  nombre: string;
  tipo_medicion: TipoMedicion;
  direccion_ranking: DireccionRanking;
  unidad: string | null;
  orden: number;
};

export type EjercicioConModulos = Ejercicio & {
  ejercicio_modulos: EjercicioModulo[];
};
