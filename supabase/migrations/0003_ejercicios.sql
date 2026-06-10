-- =============================================================
-- 0003 — Ejercicios y módulos
-- Ejercicios precargados (sin CRUD de UI en el MVP) y sus módulos.
-- Cada módulo define qué mide y si en el ranking gana el menor
-- (asc, ej. tiempos de circuito) o el mayor (desc, ej. repeticiones).
-- =============================================================

create type public.tipo_medicion as enum ('tiempo', 'cantidad', 'numero');
create type public.direccion_ranking as enum ('asc', 'desc');

create table public.ejercicios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique check (char_length(nombre) between 1 and 120),
  descripcion text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger ejercicios_updated_at
  before update on public.ejercicios
  for each row execute function public.set_updated_at();

create table public.ejercicio_modulos (
  id uuid primary key default gen_random_uuid(),
  ejercicio_id uuid not null references public.ejercicios (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 120),
  tipo_medicion public.tipo_medicion not null,
  direccion_ranking public.direccion_ranking not null default 'desc',
  unidad text,
  orden int not null,
  created_at timestamptz not null default now(),
  unique (ejercicio_id, orden)
);

create index ejercicio_modulos_ejercicio_id_idx
  on public.ejercicio_modulos (ejercicio_id);

-- RLS: cualquier usuario autenticado puede leerlos (los alumnos también
-- los van a necesitar en el futuro). Solo admin escribe (vía SQL por ahora).
alter table public.ejercicios enable row level security;
alter table public.ejercicio_modulos enable row level security;

create policy "autenticados: leer ejercicios"
  on public.ejercicios for select
  to authenticated
  using (true);

create policy "admin: gestionar ejercicios"
  on public.ejercicios for all
  to authenticated
  using (private.get_rol() = 'admin')
  with check (private.get_rol() = 'admin');

create policy "autenticados: leer modulos"
  on public.ejercicio_modulos for select
  to authenticated
  using (true);

create policy "admin: gestionar modulos"
  on public.ejercicio_modulos for all
  to authenticated
  using (private.get_rol() = 'admin')
  with check (private.get_rol() = 'admin');
