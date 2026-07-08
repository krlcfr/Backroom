export default function Button({ children }: { children: React.ReactNode }) {
  return <button className="rounded bg-zinc-900 px-4 py-2 text-white">{children}</button>
}
