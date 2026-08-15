import { cn } from '@/lib/utils'

// Bir içerik bloğu: başlık + meta + sağda aksiyon, altında gövde.
export function Section({ title, meta, action, className, bodyClassName, children }) {
  return (
    <section className={cn('overflow-hidden rounded-xl border border-border bg-card', className)}>
      {(title || action) && (
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          {title && <h2 className="font-display text-[13px] font-semibold text-foreground">{title}</h2>}
          {meta && <span className="font-mono text-[9.5px] text-muted-foreground">{meta}</span>}
          {action && <div className="ml-auto">{action}</div>}
        </div>
      )}
      <div className={cn(bodyClassName)}>{children}</div>
    </section>
  )
}

// KPI kutusu — sol kenarda kategori şeridi, ikon rozeti, delta çipi.
export function StatCard({ accent = 'bg-cat-other', tint = 'bg-cat-other/15', icon: Icon, iconClass, label, value, chip }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card px-3.5 py-3">
      <span className={cn('absolute inset-y-0 left-0 w-[3px]', accent)} />
      {Icon && (
        <div className={cn('mb-2 grid h-6 w-6 place-items-center rounded-lg', tint, iconClass)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      )}
      <div className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-muted-foreground">{label}</div>
      <div className="tabular mt-1 text-lg font-semibold tracking-tight text-foreground">{value}</div>
      {chip}
    </div>
  )
}

// Delta çipi — YALNIZCA kâr/zarar için (yeşil/kırmızı semantiktir)
export function DeltaChip({ value, suffix = '%' }) {
  if (value == null) return null
  const up = value >= 0
  return (
    <span
      className={cn(
        'tabular mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px]',
        up ? 'bg-up/12 text-up' : 'bg-down/12 text-down'
      )}
    >
      {up ? '▲' : '▼'} {up ? '+' : ''}{value.toFixed(2)}{suffix}
    </span>
  )
}

// Nötr çip — sayısal olmayan bilgi (renk anlam taşımaz)
export function InfoChip({ tint = 'bg-cat-other/15', text = 'text-cat-other', children }) {
  return (
    <span className={cn('mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[9.5px]', tint, text)}>{children}</span>
  )
}
