import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import { useHoldings, useSellAsset, useUpdateAsset, useDeleteAsset } from '@/hooks/queries'
import { Button } from '@/components/ui/button'
import { MoneyInput } from '@/components/ui/money-input'
import { Skeleton } from '@/components/ui/skeleton'
import StockDrawer from '@/components/StockDrawer'
import { Plus, Pencil, Trash2, X, Check, ArrowDownRight, AlertTriangle } from 'lucide-react'

const TABS = ['Stock', 'Currency', 'Gold']

const formatMoney = (v, currency = 'TRY') =>
  v != null
    ? new Intl.NumberFormat(currency === 'TRY' ? 'tr-TR' : 'en-US', { style: 'currency', currency }).format(v)
    : '—'

const formatPercent = (v) => (v != null ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` : '')

export default function Assets() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { data: holdings = [], isLoading, error: queryError } = useHoldings()
  const sellMutation = useSellAsset()
  const updateMutation = useUpdateAsset()
  const deleteMutation = useDeleteAsset()

  const [searchParams] = useSearchParams()
  const initialTab = TABS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'Stock'
  const [tab, setTab] = useState(initialTab)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null) // { id, mode: 'edit' | 'sell' }
  const [form, setForm] = useState({ quantity: '', price: '' })
  const [drawer, setDrawer] = useState(null)

  const saving = sellMutation.isPending || updateMutation.isPending

  const startEdit = (asset) => {
    setEditing({ id: asset.id, mode: 'edit' })
    setForm({ quantity: String(asset.quantity), price: asset.avgCostBasis != null ? String(asset.avgCostBasis) : '' })
  }

  const startSell = (asset) => {
    setEditing({ id: asset.id, mode: 'sell' })
    setForm({ quantity: String(asset.quantity), price: '' })
  }

  const handleConfirm = async () => {
    if (!editing) return
    setError(null)
    try {
      if (editing.mode === 'sell') {
        await sellMutation.mutateAsync({
          id: editing.id,
          data: { quantity: parseFloat(form.quantity), unitPrice: parseFloat(form.price) },
        })
      } else {
        await updateMutation.mutateAsync({
          id: editing.id,
          data: { quantity: parseFloat(form.quantity), purchasePrice: form.price ? parseFloat(form.price) : null },
        })
      }
      setEditing(null)
    } catch (err) {
      setError(err.response?.data?.error?.message ?? err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('assets.confirmDelete'))) return
    setError(null)
    try {
      await deleteMutation.mutateAsync(id)
    } catch (err) {
      setError(err.response?.data?.error?.message ?? err.message)
    }
  }

  const visible = holdings.filter((h) => h.assetType === tab)
  const tabTotal = visible.reduce((s, h) => s + (h.valueInTry ?? 0), 0)
  const shownError = error ?? (queryError ? queryError.message : null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t('assets.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('common.total')}: <span className="tabular text-foreground">{formatMoney(tabTotal)}</span>
          </p>
        </div>
        <Button onClick={() => navigate('/assets/buy')}>
          <Plus className="mr-2 h-4 w-4" />
          {t('assets.buy')}
        </Button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-6 border-b border-border">
        {TABS.map((key) => (
          <button
            key={key}
            onClick={() => { setTab(key); setEditing(null) }}
            className={`relative -mb-px pb-2.5 text-sm font-medium transition-colors ${
              tab === key
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t(`assets.${key.toLowerCase()}`)}
            {tab === key && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      {shownError && (
        <div className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {shownError}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : visible.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="mb-4 text-muted-foreground">{t('assets.noAssets')}</p>
            <Button onClick={() => navigate('/assets/buy')}>{t('assets.buy')}</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 text-left font-medium">{t('assets.name')}</th>
                  <th className="px-4 py-2.5 text-right font-medium">{t('assets.quantity')}</th>
                  <th className="px-4 py-2.5 text-right font-medium">{t('assets.purchasePrice')}</th>
                  <th className="px-4 py-2.5 text-right font-medium">{t('assets.currentPrice')}</th>
                  <th className="px-4 py-2.5 text-right font-medium">{t('assets.cost')}</th>
                  <th className="px-4 py-2.5 text-right font-medium">{t('assets.currentValue')}</th>
                  <th className="px-4 py-2.5 text-right font-medium">{t('assets.profitLoss')}</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((h) => {
                  const isActive = editing?.id === h.id
                  const isSell = isActive && editing.mode === 'sell'
                  const pl = h.unrealizedProfitLoss
                  const plColor = pl > 0 ? 'text-up' : pl < 0 ? 'text-down' : 'text-muted-foreground'
                  const currentUnit = h.currency === 'USD' ? h.priceInUsd : h.priceInTry
                  const currentTotal = h.priceAvailable && currentUnit != null ? h.quantity * currentUnit : null
                  const clickable = h.assetType === 'Stock' && !isActive

                  return (
                    <tr
                      key={h.id}
                      className={`border-b border-border/60 last:border-0 hover:bg-secondary/40 ${clickable ? 'cursor-pointer' : ''}`}
                      onClick={() => clickable && setDrawer(h)}
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-foreground">{h.symbol}</td>

                      {isActive ? (
                        <td colSpan={7} className="px-4 py-3">
                          <div className="flex flex-wrap items-center justify-end gap-3">
                            <span className="text-xs text-muted-foreground">
                              {isSell ? t('assets.sellAsset') : t('assets.edit')} · {h.symbol} ({h.currency})
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">{t('assets.quantity')}</span>
                              <MoneyInput
                                value={form.quantity}
                                onChange={(v) => setForm((f) => ({ ...f, quantity: v }))}
                                className="h-7 w-24 text-xs"
                                placeholder="0"
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">
                                {isSell ? t('assets.unitPrice') : t('assets.purchasePrice')}
                              </span>
                              <MoneyInput
                                currency={h.currency}
                                value={form.price}
                                onChange={(v) => setForm((f) => ({ ...f, price: v }))}
                                className="h-7 w-28 text-xs"
                                placeholder="0,00"
                              />
                            </div>
                            <Button
                              size="sm" variant="ghost" onClick={handleConfirm}
                              disabled={saving || !form.quantity || (isSell && !form.price)}
                              className="h-7 w-7 p-0 text-up hover:bg-up/10 hover:text-up"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm" variant="ghost" onClick={() => setEditing(null)}
                              className="h-7 w-7 p-0 text-muted-foreground"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      ) : (
                        <>
                          <td className="tabular px-4 py-3 text-right text-sm text-muted-foreground">{h.quantity}</td>
                          <td className="tabular px-4 py-3 text-right text-sm text-muted-foreground">{formatMoney(h.avgCostBasis, h.currency)}</td>
                          <td className="px-4 py-3 text-right text-sm">
                            {h.priceAvailable ? (
                              <span className="tabular text-muted-foreground">{formatMoney(currentUnit, h.currency)}</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs text-down">
                                <AlertTriangle className="h-3 w-3" />
                                {t('assets.priceUnavailable')}
                              </span>
                            )}
                          </td>
                          <td className="tabular px-4 py-3 text-right text-sm text-muted-foreground">{formatMoney(h.totalCost, h.currency)}</td>
                          <td className="tabular px-4 py-3 text-right text-sm font-medium text-foreground">{formatMoney(currentTotal, h.currency)}</td>
                          <td className="px-4 py-3 text-right">
                            {pl != null ? (
                              <div className={`tabular text-sm font-medium ${plColor}`}>
                                {formatMoney(pl, h.currency)}
                                <span className="ml-1 text-xs">{formatPercent(h.unrealizedProfitLossPercent)}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button
                                size="sm" variant="ghost" onClick={() => startSell(h)}
                                className="h-7 px-2 text-xs text-down hover:bg-down/10 hover:text-down"
                              >
                                <ArrowDownRight className="mr-1 h-3.5 w-3.5" />
                                {t('assets.sell')}
                              </Button>
                              <Button
                                size="sm" variant="ghost" onClick={() => startEdit(h)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:bg-secondary hover:text-foreground"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm" variant="ghost" onClick={() => handleDelete(h.id)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:bg-down/10 hover:text-down"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {drawer && (
        <StockDrawer
          holding={drawer}
          onClose={() => setDrawer(null)}
          onSell={(h) => {
            setDrawer(null)
            startSell(h)
          }}
        />
      )}
    </div>
  )
}
