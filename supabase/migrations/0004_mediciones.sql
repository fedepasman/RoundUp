-- =============================================================
-- 0004 — Mediciones
-- Una medición por alumno + ejercicio + fecha (sin reintentos),
-- con un valor numérico por módulo. El tiempo se guarda en segundos.
-- =============================================================

create table public.mediciones (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid not null references public.alumnos (id) on delete cascade,
  ejercicio_id uuid not null references public.ejercicios (id) on delete restrict,
  fecha date not null check (fecha <= now()::date),
  registrado_por uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (alumno_id, ejercicio_id, fecha)
);

create index mediciones_ejercicio_fecha_idx
  on public.mediciones (ejercicio_id, fecha desc);
create index mediciones_registrado_por_idx
  on public.mediciones (registrado_por);

create trigger mediciones_updated_at
  before update on public.mediciones
  for each row execute function public.set_updated_at();

create table public.medicion_valores (
  id uuid primary key default gen_random_uuid(),
  medicion_id uuid not null references public.mediciones (id) on delete cascade,
  modulo_id uuid not null references public.ejercicio_modulos (id) on delete restrict,
  valor numeric not null check (valor >= 0),
  unique (medicion_id, modulo_id)
);

create index medicion_valores_modulo_id_idx
  on public.medicion_valores (modulo_id);

-- RLS: staff lee, crea y actualiza; solo admin borra.
alter table public.mediciones enable row level security;
alter table public.medicion_valores enable row level security;

create policy "staff: leer mediciones"
  on public.mediciones for select
  to authenticated
  using (private.get_rol() in ('admin', 'profesor'));

create policy "staff: crear mediciones"
  on public.mediciones for insert
  to authenticated
  with check (private.get_rol() in ('admin', 'profesor'));

create policy "staff: actualizar mediciones"
  on public.mediciones for update
  to authenticated
  using (private.get_rol() in ('admin', 'profesor'))
  with check (private.get_rol() in ('admin', 'profesor'));

create policy "admin: borrar mediciones"
  on public.mediciones for delete
  to authenticated
  using (private.get_rol() = 'admin');

create policy "staff: leer valores"
  on public.medicion_valores for select
  to authenticated
  using (private.get_rol() in ('admin', 'profesor'));

create policy "staff: crear valores"
  on public.medicion_valores for insert
  to authenticated
  with check (private.get_rol() in ('admin', 'profesor'));

create policy "staff: actualizar valores"
  on public.medicion_valores for update
  to authenticated
  using (private.get_rol() in ('admin', 'profesor'))
  with check (private.get_rol() in ('admin', 'profesor'));

create policy "admin: borrar valores"
  on public.medicion_valores for delete
  to authenticated
  using (private.get_rol() = 'admin');
