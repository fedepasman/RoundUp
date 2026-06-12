export type TipoMedicion = "tiempo" | "cantidad" | "numero";
export type DireccionRanking = "asc" | "desc";

/** Etapa de un módulo tipo "escalera": un objetivo de reps a completar. */
export type Etapa = { nombre: string; objetivo: number };

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
  etapas: Etapa[] | null;
  descripcion: string | null;
};

export type EjercicioConModulos = Ejercicio & {
  ejercicio_modulos: EjercicioModulo[];
};
