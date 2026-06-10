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
