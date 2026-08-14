import { useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAssetTransactions } from '@/hooks/queries'
import TradingViewChart from './TradingViewChart'
import { ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react'

const fmt = (v, currency) =>
  v != null
    ? new Intl.NumberFormat(currency === 'TRY' ? 'tr-TR' : 'en-US', { style: 'currency', currency }).format(v)
    : '—'
const fmtNum = (v) => (v != null ? new Intl.NumberFormat('tr-TR').format(v) : '—')

function Row({ label, value, valueClass = 'text-foreground' }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className={`tabular font-bold ${valueClass}`}>{value}</span>
    </div>
  )
}

// Varlık türüne göre etiket + TradingView sembolü
function typeConfig(holding, t) {
  switch (holding.assetType) {
    case 'Currency':
      return { qtyLabel: t('assets.amount'), avgLabel: t('assets.buyRate'), priceLabel: t('assets.currentRate'),
        tvSymbol: `FX_IDC:${holding.symbol}TRY` }
    case 'Gold':
      return { qtyLabel: t('assets.grams'), avgLabel: t('assets.avgCost'), priceLabel: t('assets.pricePerGram'),
        tvSymbol: 'TVC:GOLD' }
    default:
      return { qtyLabel: t('assets.quantity'), avgLabel: t('assets.avgCost'), priceLabel: t('assets.currentPrice'),
        tvSymbol: holding.exchange === 'BIST' ? `BIST:${holding.symbol}` : holding.symbol }
  }
}

export default function AssetDrawer({ holding, onClose, onSell }) {
  const { t } = useLanguage()
  const { data: lots = [], isLoading: lotsLoading } = useAssetTransactions(holding?.symbol)

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!holding) return null

  const cfg = typeConfig(holding, t)
  const native = holding.nativeCurrency || holding.currency
  const price = holding.nativePrice
  const prev = holding.previousClose
  const change = price != null && prev != null ? price - prev : null
  const changePct = change != null && prev ? (change / prev) * 100 : null
  const up = change != null && change >= 0
  const hasMarketStats = holding.dayHigh != null || holding.week52High != null
  const pl = holding.unrealizedProfitLoss
  const plUp = pl != null && pl >= 0

  return (
    <div className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-[1px]" onClick={onClose}>
      <div
        className="fixed bottom-0 right-0 top-0 flex w-full max-w-md flex-col justify-between overflow-y-auto border-l-2 border-foreground bg-card p-6 font-mono text-xs shadow-ledger-strong"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <span className="font-bold text-muted-foreground">
              DEFTER NO: <span className="text-foreground">{holding.exchange || holding.assetType}</span>
            </span>
            <button onClick={onClose} className="font-bold underline hover:text-margin">[X] {t('common.cancel')}</button>
          </div>

          {/* Sembol + fiyat */}
          <div className="mt-6 border-b border-border pb-6">
            <span className="block text-2xl font-bold text-foreground">{holding.symbol}</span>
            {holding.priceAvailable ? (
              <div className="mt-4 flex items-baseline justify-between">
                <span className="tabular text-3xl font-bold text-foreground">{fmt(price, native)}</span>
                {change != null && (
                  <span className={`inline-flex items-center gap-1 border px-2 py-1 font-bold ${up ? 'border-up/20 bg-up/10 text-up' : 'border-down/20 bg-down/10 text-down'}`}>
                    {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {fmt(change, native)} ({changePct >= 0 ? '+' : ''}{changePct?.toFixed(2)}%)
                  </span>
                )}
              </div>
            ) : (
              <div className="mt-3 text-down">{t('assets.priceUnavailable')}</div>
            )}
          </div>

          {/* Piyasa metrikleri (yalnızca veri varsa — hisse) */}
          {holding.priceAvailable && hasMarketStats && (
            <div className="border-b border-border py-6">
              <h3 className="mb-3 uppercase tracking-wider text-muted-foreground">{t('drawer.marketStats')}</h3>
              <Row label={t('drawer.previousClose')} value={fmt(prev, native)} />
              <Row label={t('drawer.dayRange')} value={`${fmt(holding.dayLow, native)} – ${fmt(holding.dayHigh, native)}`} />
              <Row label={t('drawer.week52Range')} value={`${fmt(holding.week52Low, native)} – ${fmt(holding.week52High, native)}`} />
              <Row label={t('drawer.volume')} value={fmtNum(holding.volume)} />
            </div>
          )}

          {/* Pozisyon */}
          <div className="border-b border-border py-6">
            <h3 className="mb-3 uppercase tracking-wider text-muted-foreground">{t('drawer.yourPosition')}</h3>
            <Row label={cfg.qtyLabel} value={fmtNum(holding.quantity)} />
            <Row label={cfg.avgLabel} value={fmt(holding.avgCostBasis, holding.currency)} />
            <Row label={t('assets.currentValue')} value={fmt(holding.valueInTry, 'TRY')} />
            <Row
              label={t('assets.profitLoss')}
              valueClass={pl == null ? 'text-muted-foreground' : plUp ? 'text-up' : 'text-down'}
              value={pl != null
                ? `${fmt(pl, holding.currency)}${holding.unrealizedProfitLossPercent != null ? ` (${holding.unrealizedProfitLossPercent >= 0 ? '+' : ''}${holding.unrealizedProfitLossPercent.toFixed(2)}%)` : ''}`
                : '—'}
            />
          </div>

          {/* Lot geçmişi */}
          <div className="border-b border-border py-6">
            <h3 className="mb-3 uppercase tracking-wider text-muted-foreground">{t('drawer.lotHistory')}</h3>
            {lotsLoading ? (
              <p className="text-muted-foreground">{t('common.loading')}</p>
            ) : lots.length === 0 ? (
              <p className="text-muted-foreground">{t('drawer.noHistory')}</p>
            ) : (
              <table className="tabular w-full text-left">
                <thead>
                  <tr className="border-b border-border uppercase text-[10px] tracking-wider text-muted-foreground">
                    <th className="py-1.5 font-normal">{t('drawer.date')}</th>
                    <th className="py-1.5 font-normal">{t('common.type')}</th>
                    <th className="py-1.5 text-right font-normal">{cfg.qtyLabel}</th>
                    <th className="py-1.5 text-right font-normal">{cfg.avgLabel}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {lots.map((lot) => (
                    <tr key={lot.id}>
                      <td className="py-1.5">{new Date(lot.date).toLocaleDateString('tr-TR')}</td>
                      <td className={`py-1.5 font-bold ${lot.type === 'AssetSell' ? 'text-down' : 'text-up'}`}>
                        {lot.type === 'AssetSell' ? t('assets.sell') : t('assets.buy')}
                      </td>
                      <td className="py-1.5 text-right">{fmtNum(lot.quantity)}</td>
                      <td className="py-1.5 text-right">{fmt(lot.unitPrice, lot.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Grafik */}
          <div className="pb-2 pt-6">
            <h3 className="mb-2 uppercase tracking-wider text-muted-foreground">{t('drawer.chart')}</h3>
            <div className="h-72 overflow-hidden border border-border">
              <TradingViewChart tvSymbol={cfg.tvSymbol} />
            </div>
          </div>
        </div>

        <div className="pt-6">
          <button
            onClick={() => onSell(holding)}
            className="flex w-full items-center justify-center gap-2 border border-foreground py-3 font-bold uppercase tracking-wider text-foreground hover:bg-foreground hover:text-background"
          >
            <ArrowDownRight className="h-4 w-4" />
            {t('assets.sell')}
          </button>
        </div>
      </div>
    </div>
  )
}
