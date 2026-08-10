export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121414] p-4 md:p-8 relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Ambient Background Effect (Subtle) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
        <div className="w-[800px] h-[800px] bg-[#d2bbff] rounded-full blur-[150px] opacity-10"></div>
      </div>
      
      <div className="w-full max-w-[420px] rounded-xl border border-[#4a4455] bg-[#1e2020] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.7)] relative z-10 flex flex-col backdrop-blur-xl">
        {children}
      </div>
    </div>
  )
}
