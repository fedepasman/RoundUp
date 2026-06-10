export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="rounded-full bg-primary px-4 py-1 text-sm font-semibold uppercase tracking-widest text-primary-foreground">
          Round 1
        </span>
        <h1 className="font-display text-6xl uppercase text-foreground">
          RoundUp
        </h1>
        <p className="max-w-xs text-balance text-muted-foreground">
          Seguimiento de alumnos en entrenamiento. Asistencia, mediciones y
          evolución, desde el celular.
        </p>
      </div>
      <p className="numeros-marca text-sm text-muted-foreground">v0.1.0</p>
    </main>
  );
}
