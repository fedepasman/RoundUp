-- =============================================================
-- 0005 — Asistencias
-- Un registro por alumno + fecha. El enum arranca con presente y
-- ausente; se extiende con ALTER TYPE ... ADD VALUE (justificado,
-- tarde, lesionado) sin tocar la tabla.
-- =============================================================

create type public.estado_asistencia as enum ('presente', 'ausente');

create table public.asistencias (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid not null references public.alumnos (id) on delete cascade,
  fecha date not null check (fecha <= now()::date),
  estado public.estado_asistencia not null,
  registrado_por uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (alumno_id, fecha)
);

create index asistencias_fecha_idx on public.asistencias (fecha desc);
create index asistencias_registrado_por_idx on public.asistencias (registrado_por);

create trigger asistencias_updated_at
  before update on public.asistencias
  for each row execute function public.set_updated_at();

-- RLS: staff lee, crea y actualiza; solo admin borra.
alter table public.asistencias enable row level security;

create policy "staff: leer asistencias"
  on public.asistencias for select
  to authenticated
  using (private.get_rol() in ('admin', 'profesor'));

create policy "staff: crear asistencias"
  on public.asistencias for insert
  to authenticated
  with check (private.get_rol() in ('admin', 'profesor'));

create policy "staff: actualizar asistencias"
  on public.asistencias for update
  to authenticated
  using (private.get_rol() in ('admin', 'profesor'))
  with check (private.get_rol() in ('admin', 'profesor'));

create policy "admin: borrar asistencias"
  on public.asistencias for delete
  to authenticated
  using (private.get_rol() = 'admin');
