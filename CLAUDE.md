@AGENTS.md

# RoundUp — Guía para Claude Code

App web mobile-first para seguimiento de alumnos que entrenan (origen boxeo, alcance: entrenamiento físico general). Uso interno de profesores y admins. Interfaz 100% en español.

## Stack

- Next.js (App Router) + TypeScript estricto. Deploy en Vercel.
- Supabase: Postgres + Auth (email/password) + RLS. Cliente `@supabase/ssr` con cookies.
- Tailwind CSS v4 + shadcn/ui (componentes en `src/components/ui/`). Gráficos: recharts.
- PWA (manifest + SW mínimo). Solo modo claro.

## Reglas del proyecto

- **Datos**: Server Components para lecturas; Server Actions para mutaciones, siempre validadas con zod (`src/lib/validations/`). Route handlers solo si es inevitable.
- **Supabase**: migraciones SQL numeradas en `supabase/migrations/`, seed en `supabase/seed.sql`. Nunca modificar el schema sin migración.
- **Seguridad**: `SUPABASE_SERVICE_ROLE_KEY` solo en `src/lib/supabase/admin.ts` (server-only, nunca importarlo desde código cliente). El form público inserta únicamente vía RPC `inscribir_alumno` (security definer). RLS activa en todas las tablas.
- **Roles**: admin (todo), profesor (lee todo el dominio; crea/edita alumnos, mediciones, asistencias; no borra), alumno (futuro: solo lo propio).
- **Idioma**: UI, mensajes de error, nombres de tablas/columnas en español (snake_case en DB).
- **Mobile-first**: targets táctiles ≥48px, formularios de una columna, bottom nav, uso con una mano.

## Modelo de datos (resumen)

`profiles` (rol) · `alumnos` · `ejercicios` → `ejercicio_modulos` (tipo_medicion: tiempo|cantidad|numero; direccion_ranking asc|desc) · `mediciones` UNIQUE(alumno, ejercicio, fecha) → `medicion_valores` · `asistencias` UNIQUE(alumno, fecha).
El tiempo se guarda en **segundos** (numeric); la UI captura/muestra mm:ss.

## Diseño

Tokens en `src/app/globals.css`: paleta "rincón rojo" (fondo lona claro, tinta carbón, primario rojo córner, verde éxito, azul córner para datos). Tipografía Archivo variable: utilidad `font-display` (expandida, peso 800, estilo cartel de pelea) para títulos y la utilidad `numeros-marca` (tabulares) para marcas/tiempos/rankings.

## Forma de trabajo

- Desarrollo por etapas/versiones (v0.1.0 → v1.0.0, ver README). Antes de cada etapa: explicar qué se construye, archivos, cambios en Supabase, resultado esperado y commit sugerido.
- Ramas: `main` / `develop` / `feature/x` / `fix/x`. Cada etapa termina con build limpio + commit claro.
- Aplicar las skills del proyecto (`.claude/skills/`): next-best-practices y supabase-postgres-best-practices siempre; frontend-design para UI; security-and-hardening en auth/RLS; code-review-and-quality antes de mergear a develop.
- No inventar funcionalidades fuera del MVP; dejar la arquitectura preparada para crecer (campos futuros de alumnos, estados de asistencia extensibles, login de alumnos).

## Alcance MVP

Login · dashboard · alumnos (alta interna + form público `/inscripcion`) · asistencia (presente/ausente) · carga manual de mediciones (sin cronómetro, un registro por alumno+ejercicio+fecha) · historial/evolución con gráficos · rankings por ejercicio y módulo · pantalla admin de usuarios · PWA instalable. Sin CRUD de ejercicios en UI, sin modo oscuro, sin offline completo.
