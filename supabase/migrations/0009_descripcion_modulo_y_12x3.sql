-- Columna descripción por módulo (contexto del circuito, mostrado en formularios)
alter table public.ejercicio_modulos
  add column if not exists descripcion text;

-- Ejercicio "12 x 3"
with nuevo_ejercicio as (
  insert into public.ejercicios (nombre, activo)
  values ('12 x 3', true)
  returning id
)
insert into public.ejercicio_modulos
  (ejercicio_id, nombre, tipo_medicion, direccion_ranking, unidad, orden, descripcion)
select
  nuevo_ejercicio.id,
  m.nombre,
  'cantidad',
  'desc',
  null,
  m.orden,
  m.descripcion
from nuevo_ejercicio,
  (values
    ('Módulo A x 12', 1, E'40 Flexiones\n30 Sentadillas\n20 Estocadas\n10 Camino'),
    ('Módulo B x 12', 2, E'20 – 10 - 5\nMe Paro\nSentadilla PLIO\nHanna'),
    ('Módulo C x 12', 3, E'3 Vueltas\n10 Willys\n10 Me ato cordones\n10 Flexiones')
  ) as m(nombre, orden, descripcion);
