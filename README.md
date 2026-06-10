# RoundUp 🥊

**RoundUp Training Tracker** — app web mobile-first para el seguimiento de alumnos que entrenan: asistencia, mediciones de ejercicios, evolución y rankings. Pensada para uso interno de profesores y administradores, con arquitectura preparada para escalar.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Supabase](https://supabase.com) — Postgres, Auth y Row Level Security
- Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com)
- PWA instalable (mobile-first, interfaz en español)
- Deploy en [Vercel](https://vercel.com)

## Funcionalidades del MVP

- 🔐 Login para profesores y admins (Supabase Auth + roles)
- 👥 Gestión de alumnos: alta desde la app o por formulario público de inscripción
- ✅ Toma de asistencia por fecha (presente/ausente)
- ⏱️ Carga manual de mediciones por ejercicio y módulos (tiempo, cantidad, número)
- 📈 Ficha del alumno: historial, evolución, gráficos y % de mejora
- 🏆 Rankings por ejercicio y módulo
- 🛠️ Pantalla de admin para alta de usuarios

## Instalación local

```bash
git clone <repo-url> && cd ROUNDUP
npm install
cp .env.example .env.local   # completar con tus credenciales
npm run dev
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase (Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — **solo server, nunca en el cliente** |

## Configuración de Supabase

1. Crear (o usar) un proyecto en [supabase.com](https://supabase.com).
2. Ejecutar en orden las migraciones de `supabase/migrations/` (SQL Editor o `supabase db push`).
3. Ejecutar `supabase/seed.sql` para los ejercicios precargados.
4. Crear el primer usuario admin desde Authentication → Users y asignarle rol `admin` en `profiles`.

## Deploy en Vercel

1. Importar el repo en Vercel.
2. Cargar las tres variables de entorno (la service role solo server, nunca con prefijo `NEXT_PUBLIC_`).
3. Deploy automático desde `main`.

## Roadmap

| Versión | Alcance |
|---|---|
| v0.1.0 | Setup inicial ✅ |
| v0.2.0 | Auth, roles y alta de usuarios |
| v0.3.0 | Alumnos + formulario público |
| v0.4.0 | Ejercicios precargados |
| v0.5.0 | Carga de mediciones |
| v0.6.0 | Asistencia |
| v0.7.0 | Historial y evolución |
| v0.8.0 | Rankings |
| v0.9.0 | PWA y ajustes |
| v1.0.0 | MVP estable |

**Post-MVP:** login de alumnos con vista de sus métricas, más estados de asistencia (justificado, tarde, lesionado), campos extra de alumno (email, DNI, peso, altura), CRUD de ejercicios, modo offline.

## Estructura

```
src/app/(public)/inscripcion   formulario público de alumnos
src/app/(auth)/login           autenticación
src/app/(app)/                 app protegida (dashboard, alumnos, mediciones, asistencia, rankings)
src/lib/supabase/              clientes de Supabase (browser, server, admin)
supabase/migrations/           migraciones SQL versionadas
```
