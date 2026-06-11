-- =============================================================
-- 0007 — Tiempo en mediciones (Testeo)
-- Agrega campo tiempo_segundos a medicion_valores para Testeo.
-- Si no se completa (valor < objetivo), se asigna automáticamente 30 min.
-- =============================================================

alter table public.medicion_valores
  add column tiempo_segundos integer check (tiempo_segundos > 0);
