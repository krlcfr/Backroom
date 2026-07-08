import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-8 py-32 px-16 text-center">
        <div className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
          BackRoom v0.1
        </div>
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          Espacios colaborativos
          <br />
          para organizar tu estudio
        </h1>
        <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Crea BackRooms, organiza salas temáticas, comparte recursos
          académicos y colabora sin distracciones.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/registro"
            className="flex h-12 w-48 items-center justify-center rounded-full bg-zinc-900 px-5 text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Crear cuenta gratis
          </Link>
          <Link
            href="/login"
            className="flex h-12 w-48 items-center justify-center rounded-full border border-zinc-300 px-5 text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Iniciar sesión
          </Link>
        </div>
      </main>
    </div>
  );
}
