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

-- Testeo: un módulo tipo "escalera" de 800 reps en 7 etapas.
-- Se guarda el total de reps completadas; el % sale de la suma de objetivos.
with ejercicio as (
  insert into public.ejercicios (nombre, descripcion)
  values ('Testeo', 'Test de resistencia: escalera de 800 repeticiones en 7 etapas.')
  on conflict (nombre) do nothing
  returning id
)
insert into public.ejercicio_modulos
  (ejercicio_id, nombre, tipo_medicion, direccion_ranking, unidad, orden, etapas)
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
  ]'::jsonb
from ejercicio;
