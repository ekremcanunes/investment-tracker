import { useState, useMemo } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useMarketOverview } from '@/hooks/queries'
import { Skeleton } from '@/components/ui/skeleton'
import AssetDrawer from '@/components/AssetDrawer'
import { Page, PageTab } from '@/components/Page'
import { Section, StatCard } from '@/components/Section'
import { catOf } from '@/lib/assetColors'

const num = (v) => new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v ?? 0)
const pct = (v) => (v != null ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` : '—')
const pctCls = (v) => (v == null ? 'text-muted-foreground' : v >= 0 ? 'text-up' : 'text-down')

const TABS = [
  { key: 'stocks', label: 'market.tabStocks' },
  { key: 'goldfx', label: 'market.tabGoldFx' },
]

export default function Market() {
  const { t } = useLanguage()
  const { data, isLoading } = useMarketOverview()
  const [tab, setTab] = useState('stocks')
  const [drawer, setDrawer] = useState(null)

  const stocks = data?.stocks ?? []
  const indices = data?.indices ?? []
  const strip = data?.strip ?? []

  const sorted = useMemo(() => [...stocks].sort((a, b) => a.symbol.localeCompare(b.symbol)), [stocks])
  const gainers = useMemo(
    () => [...stocks].filter((s) => s.changePercent != null).sort((a, b) => b.changePercent - a.changePercent).slice(0, 3),
    [stocks]
  )
  const losers = useMemo(
    () => [...stocks].filter((s) => s.changePercent != null).sort((a, b) => a.changePercent - b.changePercent).slice(0, 3),
    [stocks]
  )

  // İzlenen sembol → drawer (piyasa modu)
  const open = (q, assetType) =>
    setDrawer({
      symbol: q.symbol,
      market: true,
      assetType,
      exchange: assetType === 'Stock' ? 'BIST' : undefined,
      nativeCurrency: 'TRY',
      nativePrice: q.price,
      previousClose: q.previousClose,
      priceAvailable: true,
    })

  if (isLoading) {
    return (
      <Page eyebrow={t('nav.sectionMarket')} title={t('market.title')}>
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </Page>
    )
  }

  return (
    <Page
      eyebrow={t('nav.sectionMarket')}
      title={t('market.title')}
      tabs={TABS.map(({ key, label }) => (
        <PageTab key={key} active={tab === key} onClick={() => setTab(key)}>
          {t(label)}
        </PageTab>
      ))}
    >
      {tab === 'stocks' ? (
        <div className="space-y-4">
          {/* Endeks şeridi */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {indices.map((q) => (
              <StatCard
                key={q.symbol}
                accent={catOf('Index').dot}
                tint={catOf('Index').tint}
                label={q.name || q.symbol}
                value={num(q.price)}
                chip={
                  q.changePercent != null && (
                    <span className={`tabular mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[9.5px] ${q.changePercent >= 0 ? 'bg-up/12 text-up' : 'bg-down/12 text-down'}`}>
                      {pct(q.changePercent)}
                    </span>
                  )
                }
              />
            ))}
          </div>

          {/* Yükselen / düşen */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[{ title: t('market.gainers'), rows: gainers }, { title: t('market.losers'), rows: losers }].map((col) => (
              <Section key={col.title} title={col.title}>
                <div className="p-2">
                  {col.rows.map((s) => (
                    <button key={s.symbol} onClick={() => open(s, 'Stock')} className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-[13px] hover:bg-secondary">
                      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md font-mono text-[8.5px] ${catOf('Stock').tint} ${catOf('Stock').text}`}>
                        {s.symbol.slice(0, 2)}
                      </span>
                      <span className="font-semibold text-foreground">{s.symbol}</span>
                      <span className="tabular ml-auto text-muted-foreground">{num(s.price)}</span>
                      <span className={`tabular w-16 text-right font-semibold ${pctCls(s.changePercent)}`}>{pct(s.changePercent)}</span>
                    </button>
                  ))}
                </div>
              </Section>
            ))}
          </div>

          {/* BIST 30 tablosu */}
          <Section title="BIST 30" meta={`${sorted.length} ${t('overview.assetCount')}`}>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="tabular w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b-2 border-foreground uppercase tracking-wider text-muted-foreground">
                      <th className="px-2 py-3 font-normal">{t('assets.symbol')}</th>
                      <th className="px-2 py-3 font-normal">{t('market.company')}</th>
                      <th className="px-2 py-3 text-right font-normal">{t('assets.price')}</th>
                      <th className="px-2 py-3 text-right font-normal">{t('market.change')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {sorted.map((s) => (
                      <tr key={s.symbol} onClick={() => open(s, 'Stock')} className="group cursor-pointer hover:bg-secondary">
                        <td className="px-2 py-3 font-bold text-foreground group-hover:underline">
                          <span className="inline-flex items-center gap-2">
                            <span className={`grid h-5 w-5 place-items-center rounded-md text-[8.5px] ${catOf('Stock').tint} ${catOf('Stock').text}`}>
                              {s.symbol.slice(0, 2)}
                            </span>
                            {s.symbol}
                          </span>
                        </td>
                        <td className="max-w-[220px] truncate px-2 py-3 text-muted-foreground">{s.name}</td>
                        <td className="px-2 py-3 text-right text-muted-foreground">{num(s.price)}</td>
                        <td className={`px-2 py-3 text-right font-bold ${pctCls(s.changePercent)}`}>{pct(s.changePercent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Section>
        </div>
      ) : (
        /* Altın & Döviz */
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {strip.map((q) => {
            const cat = catOf(q.symbol === 'XAU' ? 'Gold' : 'Currency')
            return (
              <button
                key={q.symbol}
                onClick={() => open(q, q.symbol === 'XAU' ? 'Gold' : 'Currency')}
                className="relative overflow-hidden rounded-xl border border-border bg-card p-5 text-left hover:border-foreground"
              >
                <span className={`absolute inset-y-0 left-0 w-[3px] ${cat.dot}`} />
                <div className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground">{q.name || q.symbol}</div>
                <div className="tabular mt-1.5 text-2xl font-semibold tracking-tight text-foreground">{num(q.price)} ₺</div>
                {q.changePercent != null && (
                  <span className={`tabular mt-2 inline-flex rounded-full px-2 py-0.5 text-[9.5px] ${q.changePercent >= 0 ? 'bg-up/12 text-up' : 'bg-down/12 text-down'}`}>
                    {pct(q.changePercent)}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {drawer && <AssetDrawer holding={drawer} onClose={() => setDrawer(null)} onSell={() => {}} />}
    </Page>
  )
}
