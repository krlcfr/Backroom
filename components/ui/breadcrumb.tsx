import Link from "next/link"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="text-[13px] text-[#ccc3d8] gap-2 mb-2 flex items-center">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && (
              <span className="material-symbols-outlined text-[14px] text-[#4a4455]">
                chevron_right
              </span>
            )}
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-[#d2bbff] transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-[#d2bbff]" : ""}>{item.label}</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
