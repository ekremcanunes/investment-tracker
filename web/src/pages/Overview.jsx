import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import { useDashboard } from '@/hooks/queries'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowRight } from 'lucide-react'

const formatTry = (v) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(v ?? 0)

export default function Overview() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { data: dashboard, isLoading } = useDashboard()

  if (isLoading) {
    return (
      <div className="max-w-4xl">
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const total = dashboard?.totalValueInTry ?? 0
  const stock = dashboard?.stockValueInTry ?? 0
  const cash = dashboard?.cashValueInTry ?? 0
  const gold = Math.max(0, total - stock - cash) // dashboard altını ayrı vermiyor → kalan
  const count = dashboard?.assetCount ?? 0
  const pct = (v) => (total > 0 ? (v / total) * 100 : 0)

  const cats = [
    { key: 'investments', label: t('overview.investments'), value: stock, bar: 'bg-foreground' },
    { key: 'cash', label: t('overview.cash'), value: cash, bar: 'bg-muted-foreground/50' },
    { key: 'gold', label: t('assets.gold'), value: gold, bar: 'bg-brass' },
  ]

  return (
    <div className="max-w-4xl">
      <section className="margin-rule relative overflow-hidden border border-border bg-card p-6 shadow-ledger md:p-10">
        <div className="pl-4 md:pl-6">
          {/* Net Varlık */}
          <div className="flex flex-col justify-between gap-4 border-b border-border pb-8 md:flex-row md:items-end">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {t('overview.netWorth')}
              </span>
              <h1 className="tabular mt-2 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                {formatTry(total)}
              </h1>
            </div>
            <button
              onClick={() => navigate('/assets')}
              className="inline-flex items-center gap-1.5 self-start border border-foreground px-3 py-2 text-xs font-semibold uppercase tracking-wider text-foreground hover:bg-foreground hover:text-background"
            >
              {t('overview.allAssets')}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Dağılım */}
          <div className="pt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {t('overview.allocation')}
              </h2>
              <span className="font-mono text-[11px] text-muted-foreground">{count} {t('overview.assetCount')}</span>
            </div>

            {/* Stacked bar */}
            <div className="mb-6 flex h-4 w-full gap-0.5 border border-border bg-background p-0.5">
              {cats.map((c) => (
                <div key={c.key} className={`h-full ${c.bar}`} style={{ width: `${pct(c.value)}%` }} title={c.label} />
              ))}
            </div>

            {/* Kategori kutuları */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {cats.map((c) => (
                <div key={c.key} className="border border-border bg-background/60 p-3">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 ${c.bar}`} />
                    <span className="font-mono text-[11px] text-muted-foreground">{c.label}</span>
                    <span className="tabular ml-auto text-[11px] text-muted-foreground">{pct(c.value).toFixed(0)}%</span>
                  </div>
                  <p className="tabular mt-1.5 text-lg font-bold text-foreground">{formatTry(c.value)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
