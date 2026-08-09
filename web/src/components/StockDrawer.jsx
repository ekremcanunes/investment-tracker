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
    <div className="rounded-md border border-gray-800 bg-gray-900/50 px-3 py-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-medium text-white mt-0.5">{value}</div>
    </div>
  )
}

export default function StockDrawer({ holding, onClose, onSell }) {
  const { t } = useLanguage()

  // ESC ile kapat
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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 flex h-full w-full max-w-lg flex-col bg-gray-950 border-l border-gray-800 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{holding.symbol}</h2>
              {holding.exchange && (
                <span className="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-gray-400">{holding.exchange}</span>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Fiyat + günlük değişim */}
          {holding.priceAvailable ? (
            <div>
              <div className="text-3xl font-bold text-white">{fmt(price, native)}</div>
              {change != null && (
                <div className={`mt-1 flex items-center gap-1 text-sm ${up ? 'text-green-400' : 'text-red-400'}`}>
                  {up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {fmt(change, native)} ({changePct >= 0 ? '+' : ''}{changePct?.toFixed(2)}%)
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-yellow-500">{t('assets.priceUnavailable')}</div>
          )}

          {/* Piyasa istatistikleri */}
          {holding.priceAvailable && (
            <div>
              <div className="text-xs font-medium text-gray-500 mb-2">{t('drawer.marketStats')}</div>
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
            <div className="text-xs font-medium text-gray-500 mb-2">{t('drawer.yourPosition')}</div>
            <div className="grid grid-cols-2 gap-2">
              <Stat label={t('assets.quantity')} value={fmtNum(holding.quantity)} />
              <Stat label={t('assets.avgCost')} value={fmt(holding.avgCostBasis, holding.currency)} />
              <Stat label={t('assets.currentValue')} value={fmt(holding.valueInTry, 'TRY')} />
              <Stat
                label={t('assets.profitLoss')}
                value={
                  pl != null ? (
                    <span className={plUp ? 'text-green-400' : 'text-red-400'}>
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
            <div className="text-xs font-medium text-gray-500 mb-2">{t('drawer.chart')}</div>
            <div className="h-80 overflow-hidden rounded-md border border-gray-800">
              <TradingViewChart symbol={holding.symbol} exchange={holding.exchange} />
            </div>
          </div>
        </div>

        {/* Aksiyonlar */}
        <div className="border-t border-gray-800 px-5 py-4">
          <Button
            variant="outline"
            className="w-full text-orange-400 hover:text-orange-300"
            onClick={() => onSell(holding)}
          >
            <ArrowDownRight className="h-4 w-4 mr-2" />
            {t('assets.sell')}
          </Button>
        </div>
      </div>
    </div>
  )
}
