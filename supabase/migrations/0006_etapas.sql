-- =============================================================
-- 0006 — Etapas de módulo (tests tipo "escalera"/chipper)
-- Un módulo puede definir etapas secuenciales con un objetivo de
-- repeticiones cada una. El valor medido sigue siendo un número
-- (total de reps completadas); el % se calcula contra la suma de
-- los objetivos. Columna nullable: no afecta a los módulos existentes.
-- Formato: [{ "nombre": "Burpees", "objetivo": 50 }, ...]
-- =============================================================

alter table public.ejercicio_modulos
  add column etapas jsonb;
