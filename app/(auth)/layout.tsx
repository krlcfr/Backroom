export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-md border border-zinc-200 bg-white p-8">
        <h1 className="mb-6 text-center text-xl font-bold tracking-tight">BackRoom</h1>
        {children}
      </div>
    </div>
  )
}
