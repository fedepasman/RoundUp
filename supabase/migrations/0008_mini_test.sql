-- =============================================================
-- 0008 — Mini test + tiempo límite configurable por módulo
-- Agrega tiempo_limite_segundos a ejercicio_modulos para parametrizar
-- el tiempo asignado automáticamente cuando no se completa el test.
-- Actualiza Testeo (1800 seg) e inserta Mini test (1200 seg / 20 min).
-- =============================================================

alter table public.ejercicio_modulos
  add column tiempo_limite_segundos integer check (tiempo_limite_segundos > 0);

-- Retroactivo: asignar límite al módulo de Testeo existente
update public.ejercicio_modulos
set tiempo_limite_segundos = 1800
where etapas is not null
  and ejercicio_id = (select id from public.ejercicios where nombre = 'Testeo');

-- Mini test: escalera de 550 reps en 7 etapas, tiempo límite 20 minutos
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
