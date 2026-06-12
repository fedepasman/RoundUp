-- =============================================================
-- Seed — Ejercicios precargados
-- Para agregar un ejercicio nuevo: copiar el bloque y ajustar
-- nombre, módulos, tipo_medicion y direccion_ranking.
-- direccion_ranking: 'desc' = gana el mayor valor (cantidad/reps),
--                    'asc'  = gana el menor valor (tiempos).
-- =============================================================

-- Rey Arturo: 4 módulos por cantidad de repeticiones (mayor es mejor)
with ejercicio as (
  insert into public.ejercicios (nombre, descripcion)
  values ('Rey Arturo', 'Circuito por intervalos: rondas de trabajo/descanso y burpees por minuto.')
  on conflict (nombre) do nothing
  returning id
)
insert into public.ejercicio_modulos
  (ejercicio_id, nombre, tipo_medicion, direccion_ranking, unidad, orden)
select id, m.nombre, m.tipo::public.tipo_medicion, m.dir::public.direccion_ranking, m.unidad, m.orden
from ejercicio,
  (values
    ('8 x 40" x 20"',    'cantidad', 'desc', 'reps', 1),
    ('8 x 30" x 15"',    'cantidad', 'desc', 'reps', 2),
    ('8 x 20" x 10"',    'cantidad', 'desc', 'reps', 3),
    ('Burpee x Minuto',  'cantidad', 'desc', 'reps', 4)
  ) as m (nombre, tipo, dir, unidad, orden);

-- 5 x 5: 5 módulos por cantidad de repeticiones (mayor es mejor)
with ejercicio as (
  insert into public.ejercicios (nombre, descripcion)
  values ('5 x 5', 'Circuito de 5 módulos por intervalos de trabajo/descanso.')
  on conflict (nombre) do nothing
  returning id
)
insert into public.ejercicio_modulos
  (ejercicio_id, nombre, tipo_medicion, direccion_ranking, unidad, orden)
select id, m.nombre, m.tipo::public.tipo_medicion, m.dir::public.direccion_ranking, m.unidad, m.orden
from ejercicio,
  (values
    ('Me Paro 15"x15"',  'cantidad', 'desc', 'reps', 1),
    ('Hanna 30"x30"',    'cantidad', 'desc', 'reps', 2),
    ('Willy 40"x20"',    'cantidad', 'desc', 'reps', 3),
    ('Me Paro 15"x15"',  'cantidad', 'desc', 'reps', 4),
    ('Burpees 50"x10"',  'cantidad', 'desc', 'reps', 5)
  ) as m (nombre, tipo, dir, unidad, orden);

-- Testeo: un módulo tipo "escalera" de 800 reps en 7 etapas, tiempo límite 30 min.
-- Se guarda el total de reps completadas; el % sale de la suma de objetivos.
with ejercicio as (
  insert into public.ejercicios (nombre, descripcion)
  values ('Testeo', 'Test de resistencia: escalera de 800 repeticiones en 7 etapas.')
  on conflict (nombre) do nothing
  returning id
)
insert into public.ejercicio_modulos
  (ejercicio_id, nombre, tipo_medicion, direccion_ranking, unidad, orden, etapas, tiempo_limite_segundos)
select
  id,
  'Completado',
  'cantidad'::public.tipo_medicion,
  'desc'::public.direccion_ranking,
  'reps',
  1,
  '[
    {"nombre": "Burpees",    "objetivo": 50},
    {"nombre": "Flexiones",  "objetivo": 100},
    {"nombre": "Estocadas",  "objetivo": 150},
    {"nombre": "Sentadillas","objetivo": 200},
    {"nombre": "Estocadas",  "objetivo": 150},
    {"nombre": "Flexiones",  "objetivo": 100},
    {"nombre": "Burpees",    "objetivo": 50}
  ]'::jsonb,
  1800
from ejercicio;

-- Mini test: escalera de 550 reps en 7 etapas, tiempo límite 20 min.
with ejercicio as (
  insert into public.ejercicios (nombre, descripcion)
  values ('Mini test', 'Test de resistencia: escalera de 550 repeticiones en 7 etapas (20 minutos).')
  on conflict (nombre) do nothing
  returning id
)
insert into public.ejercicio_modulos
  (ejercicio_id, nombre, tipo_medicion, direccion_ranking, unidad, orden, etapas, tiempo_limite_segundos)
select
  id,
  'Completado',
  'cantidad'::public.tipo_medicion,
  'desc'::public.direccion_ranking,
  'reps',
  1,
  '[
    {"nombre": "Burpees",     "objetivo": 50},
    {"nombre": "Flexiones",   "objetivo": 50},
    {"nombre": "Sentadillas", "objetivo": 100},
    {"nombre": "Estocadas",   "objetivo": 150},
    {"nombre": "Sentadillas", "objetivo": 100},
    {"nombre": "Flexiones",   "objetivo": 50},
    {"nombre": "Burpees",     "objetivo": 50}
  ]'::jsonb,
  1200
from ejercicio;

-- 12 x 3: 3 módulos (A, B, C) por cantidad de burpees (mayor es mejor).
-- Cada módulo tiene una descripción con los ejercicios del circuito.
with ejercicio as (
  insert into public.ejercicios (nombre, activo)
  values ('12 x 3', true)
  on conflict (nombre) do nothing
  returning id
)
insert into public.ejercicio_modulos
  (ejercicio_id, nombre, tipo_medicion, direccion_ranking, unidad, orden, descripcion)
select
  ejercicio.id,
  m.nombre,
  'cantidad'::public.tipo_medicion,
  'desc'::public.direccion_ranking,
  null,
  m.orden,
  m.descripcion
from ejercicio,
  (values
    ('Módulo A x 12', 1, E'40 Flexiones\n30 Sentadillas\n20 Estocadas\n10 Camino'),
    ('Módulo B x 12', 2, E'20 – 10 - 5\nMe Paro\nSentadilla PLIO\nHanna'),
    ('Módulo C x 12', 3, E'3 Vueltas\n10 Willys\n10 Me ato cordones\n10 Flexiones')
  ) as m(nombre, orden, descripcion)
where ejercicio.id is not null;
