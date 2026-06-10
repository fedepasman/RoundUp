-- =============================================================
-- 0002 — Alumnos
-- Tabla de alumnos, RLS para admin/profesor y RPC pública de
-- inscripción (única vía de escritura para anon).
-- =============================================================

create table public.alumnos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 1 and 100),
  apellido text not null check (char_length(apellido) between 1 and 100),
  fecha_nacimiento date not null check (
    fecha_nacimiento > '1920-01-01' and fecha_nacimiento <= now()::date
  ),
  activo boolean not null default true,
  origen text not null default 'app' check (origen in ('app', 'formulario')),
  -- preparado para el futuro: link a auth.users cuando los alumnos tengan login
  user_id uuid references auth.users (id) on delete set null,
  creado_por uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.alumnos is 'Alumnos del centro. Campos futuros (email, dni, peso, etc.) se agregan como columnas nullable.';

create index alumnos_apellido_nombre_idx on public.alumnos (apellido, nombre);
create index alumnos_user_id_idx on public.alumnos (user_id);
create index alumnos_creado_por_idx on public.alumnos (creado_por);

create trigger alumnos_updated_at
  before update on public.alumnos
  for each row execute function public.set_updated_at();

-- RLS
alter table public.alumnos enable row level security;

create policy "staff: leer alumnos"
  on public.alumnos for select
  to authenticated
  using (private.get_rol() in ('admin', 'profesor'));

create policy "staff: crear alumnos"
  on public.alumnos for insert
  to authenticated
  with check (private.get_rol() in ('admin', 'profesor'));

create policy "staff: actualizar alumnos"
  on public.alumnos for update
  to authenticated
  using (private.get_rol() in ('admin', 'profesor'))
  with check (private.get_rol() in ('admin', 'profesor'));

create policy "admin: borrar alumnos"
  on public.alumnos for delete
  to authenticated
  using (private.get_rol() = 'admin');

-- Inscripción pública: anon NO tiene policy de insert sobre la tabla;
-- solo puede ejecutar esta función, que valida y fija el origen.
create function public.inscribir_alumno(
  p_nombre text,
  p_apellido text,
  p_fecha_nacimiento date
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_nombre is null or btrim(p_nombre) = '' or char_length(p_nombre) > 100 then
    raise exception 'nombre_invalido';
  end if;
  if p_apellido is null or btrim(p_apellido) = '' or char_length(p_apellido) > 100 then
    raise exception 'apellido_invalido';
  end if;
  if p_fecha_nacimiento is null
     or p_fecha_nacimiento <= '1920-01-01'
     or p_fecha_nacimiento > now()::date then
    raise exception 'fecha_invalida';
  end if;

  insert into public.alumnos (nombre, apellido, fecha_nacimiento, origen)
  values (btrim(p_nombre), btrim(p_apellido), p_fecha_nacimiento, 'formulario');
end;
$$;

revoke all on function public.inscribir_alumno(text, text, date) from public;
grant execute on function public.inscribir_alumno(text, text, date) to anon, authenticated;
