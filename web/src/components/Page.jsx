import { cn } from '@/lib/utils'

// Her sayfanın iskeleti: tuvale yapışık başlık çubuğu + padding'li gövde.
// Layout main'e padding vermez; onu buradan yönetiyoruz ki başlık kenara yapışabilsin.
export function Page({ eyebrow, title, meta, actions, tabs, children }) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border bg-card/95 px-6 pt-5 backdrop-blur md:px-8">
        <div className="flex flex-wrap items-end gap-3 pb-4">
          <div className="min-w-0">
            {eyebrow && (
              <div className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground">{eyebrow}</div>
            )}
            <h1 className="font-display text-xl font-bold tracking-tight text-foreground">{title}</h1>
            {meta && <div className="mt-1 text-xs text-muted-foreground">{meta}</div>}
          </div>
          {actions && <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
        {tabs && <div className="flex gap-5">{tabs}</div>}
      </header>
      <div className="px-6 py-6 md:px-8">{children}</div>
    </>
  )
}

// Başlık çubuğundaki sekme — altı çizgili, ink değil pirinç
export function PageTab({ active, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        '-mb-px border-b-2 pb-2.5 text-[13px]',
        active
          ? 'border-brass font-semibold text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground'
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// Birincil aksiyon — pirinç dolgu
export function PrimaryAction({ className, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg bg-brass px-3 py-1.5 text-[12px] font-semibold text-white hover:opacity-90',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// İkincil aksiyon — hairline
export function GhostAction({ className, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-[12px] text-foreground hover:border-foreground',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
