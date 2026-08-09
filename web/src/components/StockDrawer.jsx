import { useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import TradingViewChart from './TradingViewChart'
import { X, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react'

const fmt = (v, currency) =>
  v != null
    ? new Intl.NumberFormat(currency === 'TRY' ? 'tr-TR' : 'en-US', { style: 'currency', currency }).format(v)
    : '—'

const fmtNum = (v) => (v != null ? new Intl.NumberFormat('tr-TR').format(v) : '—')

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="tabular mt-0.5 text-sm font-medium text-foreground">{value}</div>
    </div>
  )
}

export default function StockDrawer({ holding, onClose, onSell }) {
  const { t } = useLanguage()

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!holding) return null

  const native = holding.nativeCurrency || holding.currency
  const price = holding.nativePrice
  const prev = holding.previousClose
  const change = price != null && prev != null ? price - prev : null
  const changePct = change != null && prev ? (change / prev) * 100 : null
  const up = change != null && change >= 0

  const pl = holding.unrealizedProfitLoss
  const plUp = pl != null && pl >= 0

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" onClick={onClose} />

      <div className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{holding.symbol}</h2>
            {holding.exchange && (
              <span className="rounded bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">{holding.exchange}</span>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {/* Fiyat + günlük değişim */}
          {holding.priceAvailable ? (
            <div>
              <div className="tabular text-3xl font-semibold text-foreground">{fmt(price, native)}</div>
              {change != null && (
                <div className={`mt-1 flex items-center gap-1 text-sm ${up ? 'text-up' : 'text-down'}`}>
                  {up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span className="tabular">
                    {fmt(change, native)} ({changePct >= 0 ? '+' : ''}{changePct?.toFixed(2)}%)
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-down">{t('assets.priceUnavailable')}</div>
          )}

          {/* Piyasa istatistikleri */}
          {holding.priceAvailable && (
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{t('drawer.marketStats')}</div>
              <div className="grid grid-cols-2 gap-2">
                <Stat label={t('drawer.previousClose')} value={fmt(prev, native)} />
                <Stat label={t('drawer.dayRange')} value={`${fmt(holding.dayLow, native)} – ${fmt(holding.dayHigh, native)}`} />
                <Stat label={t('drawer.week52Range')} value={`${fmt(holding.week52Low, native)} – ${fmt(holding.week52High, native)}`} />
                <Stat label={t('drawer.volume')} value={fmtNum(holding.volume)} />
              </div>
            </div>
          )}

          {/* Senin pozisyonun */}
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{t('drawer.yourPosition')}</div>
            <div className="grid grid-cols-2 gap-2">
              <Stat label={t('assets.quantity')} value={fmtNum(holding.quantity)} />
              <Stat label={t('assets.avgCost')} value={fmt(holding.avgCostBasis, holding.currency)} />
              <Stat label={t('assets.currentValue')} value={fmt(holding.valueInTry, 'TRY')} />
              <Stat
                label={t('assets.profitLoss')}
                value={
                  pl != null ? (
                    <span className={plUp ? 'text-up' : 'text-down'}>
                      {fmt(pl, holding.currency)}
                      {holding.unrealizedProfitLossPercent != null &&
                        ` (${holding.unrealizedProfitLossPercent >= 0 ? '+' : ''}${holding.unrealizedProfitLossPercent.toFixed(2)}%)`}
                    </span>
                  ) : (
                    '—'
                  )
                }
              />
            </div>
          </div>

          {/* TradingView grafik */}
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{t('drawer.chart')}</div>
            <div className="h-80 overflow-hidden rounded-lg border border-border">
              <TradingViewChart symbol={holding.symbol} exchange={holding.exchange} />
            </div>
          </div>
        </div>

        {/* Aksiyonlar */}
        <div className="border-t border-border px-5 py-4">
          <Button
            variant="outline"
            className="w-full text-down hover:bg-down/10 hover:text-down"
            onClick={() => onSell(holding)}
          >
            <ArrowDownRight className="mr-2 h-4 w-4" />
            {t('assets.sell')}
          </Button>
        </div>
      </div>
    </div>
  )
}
