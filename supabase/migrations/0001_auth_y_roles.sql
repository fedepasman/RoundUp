-- =============================================================
-- 0001 — Auth y roles
-- Crea el enum de roles, la tabla profiles vinculada a auth.users,
-- el trigger de alta automática y las policies RLS base.
-- =============================================================

-- Schema para helpers internos (no expuesto por la API)
create schema if not exists private;
grant usage on schema private to authenticated;

create type public.rol_usuario as enum ('admin', 'profesor', 'alumno');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  rol public.rol_usuario not null default 'profesor',
  nombre text not null default '',
  apellido text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfil y rol de cada usuario autenticado (admin, profesor o alumno).';

-- updated_at genérico, reutilizable por las próximas tablas
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Alta automática del profile al crear un usuario en auth.users.
-- El rol/nombre/apellido viajan en raw_user_meta_data al crear el usuario.
create function private.handle_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, rol, nombre, apellido)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'rol')::public.rol_usuario, 'profesor'),
    coalesce(new.raw_user_meta_data ->> 'nombre', ''),
    coalesce(new.raw_user_meta_data ->> 'apellido', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_nuevo_usuario();

-- Rol del usuario autenticado, para usar en policies.
-- security definer: evita recursión de RLS sobre profiles.
create function private.get_rol()
returns public.rol_usuario
language sql
stable
security definer
set search_path = ''
as $$
  select rol from public.profiles where id = (select auth.uid());
$$;

-- RLS
alter table public.profiles enable row level security;

create policy "perfil propio: leer"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

create policy "admin: leer todos los perfiles"
  on public.profiles for select
  to authenticated
  using (private.get_rol() = 'admin');

create policy "admin: actualizar perfiles"
  on public.profiles for update
  to authenticated
  using (private.get_rol() = 'admin')
  with check (private.get_rol() = 'admin');
