export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#18181B] p-4 md:p-8">
      <div className="w-full max-w-[420px] rounded-xl border border-[#4a4455] bg-[#282a2b] p-6 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.5)] md:p-8">
        {children}
      </div>
    </div>
  )
}
