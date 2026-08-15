import { useState, useMemo } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useMarketOverview } from '@/hooks/queries'
import { Skeleton } from '@/components/ui/skeleton'
import AssetDrawer from '@/components/AssetDrawer'

const num = (v) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v ?? 0)
const pct = (v) => (v != null ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` : '—')
const pctCls = (v) => (v == null ? 'text-muted-foreground' : v >= 0 ? 'text-up' : 'text-down')

function StripCell({ q }) {
  return (
    <div className="min-w-[130px] border border-border bg-background/60 px-3 py-2">
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{q.name || q.symbol}</div>
      <div className="tabular mt-0.5 text-sm font-bold text-foreground">{num(q.price)}</div>
      {q.changePercent != null && <div className={`tabular text-[11px] ${pctCls(q.changePercent)}`}>{pct(q.changePercent)}</div>}
    </div>
  )
}

export default function Market() {
  const { t } = useLanguage()
  const { data, isLoading } = useMarketOverview()
  const [drawer, setDrawer] = useState(null)

  const stocks = data?.stocks ?? []
  const sorted = useMemo(() => [...stocks].sort((a, b) => a.symbol.localeCompare(b.symbol)), [stocks])
  const gainers = useMemo(
    () => [...stocks].filter((s) => s.changePercent != null).sort((a, b) => b.changePercent - a.changePercent).slice(0, 3),
    [stocks]
  )
  const losers = useMemo(
    () => [...stocks].filter((s) => s.changePercent != null).sort((a, b) => a.changePercent - b.changePercent).slice(0, 3),
    [stocks]
  )

  const openStock = (s) =>
    setDrawer({
      symbol: s.symbol,
      market: true,
      assetType: 'Stock',
      exchange: 'BIST',
      nativeCurrency: 'TRY',
      nativePrice: s.price,
      previousClose: s.previousClose,
      priceAvailable: true,
    })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('market.title')}</h1>

      {/* Endeks + döviz/altın şeridi */}
      <div className="flex gap-2 overflow-x-auto">
        {[...(data?.indices ?? []), ...(data?.strip ?? [])].map((q) => (
          <StripCell key={q.symbol} q={q} />
        ))}
      </div>

      {/* Yükselen / düşen */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[{ title: t('market.gainers'), rows: gainers }, { title: t('market.losers'), rows: losers }].map((col) => (
          <div key={col.title} className="border border-border bg-card p-4 shadow-ledger">
            <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{col.title}</div>
            {col.rows.map((s) => (
              <button key={s.symbol} onClick={() => openStock(s)} className="flex w-full items-center justify-between py-1 hover:bg-secondary">
                <span className="font-mono text-xs font-bold text-foreground">{s.symbol}</span>
                <span className="tabular font-mono text-xs text-muted-foreground">{num(s.price)}</span>
                <span className={`tabular font-mono text-xs font-bold ${pctCls(s.changePercent)}`}>{pct(s.changePercent)}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* BIST 30 tablosu */}
      <section className="margin-rule overflow-hidden border border-border bg-card p-6 shadow-ledger md:p-8">
        <div className="pl-4 md:pl-6">
          <div className="mb-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">BIST 30</div>
          <div className="overflow-x-auto">
            <table className="tabular w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b-2 border-foreground uppercase tracking-wider text-muted-foreground">
                  <th className="px-2 py-3 font-normal">{t('assets.symbol')}</th>
                  <th className="px-2 py-3 text-right font-normal">{t('assets.price')}</th>
                  <th className="px-2 py-3 text-right font-normal">{t('market.change')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sorted.map((s) => (
                  <tr key={s.symbol} onClick={() => openStock(s)} className="group cursor-pointer hover:bg-secondary">
                    <td className="px-2 py-3 font-bold text-foreground group-hover:underline">{s.symbol}</td>
                    <td className="px-2 py-3 text-right text-muted-foreground">{num(s.price)}</td>
                    <td className={`px-2 py-3 text-right font-bold ${pctCls(s.changePercent)}`}>{pct(s.changePercent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {drawer && <AssetDrawer holding={drawer} onClose={() => setDrawer(null)} onSell={() => {}} />}
    </div>
  )
}
