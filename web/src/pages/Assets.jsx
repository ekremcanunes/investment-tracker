import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import { assetApi } from '@/services/api'
import { Button } from '@/components/ui/button'
import { MoneyInput } from '@/components/ui/money-input'
import StockDrawer from '@/components/StockDrawer'
import { Plus, Wallet, TrendingUp, Pencil, Trash2, X, Check, ArrowDownRight, AlertTriangle } from 'lucide-react'

const TYPE_CONFIG = {
  Currency: { icon: Wallet, cls: 'text-up' },
  Stock: { icon: TrendingUp, cls: 'text-primary' },
}

const formatMoney = (v, currency = 'TRY') =>
  v != null
    ? new Intl.NumberFormat(currency === 'TRY' ? 'tr-TR' : 'en-US', { style: 'currency', currency }).format(v)
    : '—'

const formatPercent = (v) => (v != null ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` : '')

export default function Assets() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [holdings, setHoldings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null) // { id, mode: 'edit' | 'sell' }
  const [form, setForm] = useState({ quantity: '', price: '' })
  const [saving, setSaving] = useState(false)
  const [drawer, setDrawer] = useState(null)

  const fetchData = async () => {
    try {
      const res = await assetApi.getAll()
      setHoldings(res.data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.error?.message ?? err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

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
    setSaving(true)
    try {
      if (editing.mode === 'sell') {
        await assetApi.sell(editing.id, {
          quantity: parseFloat(form.quantity),
          unitPrice: parseFloat(form.price),
        })
      } else {
        await assetApi.update(editing.id, {
          quantity: parseFloat(form.quantity),
          purchasePrice: form.price ? parseFloat(form.price) : null,
        })
      }
      setEditing(null)
      setError(null)
      await fetchData()
    } catch (err) {
      setError(err.response?.data?.error?.message ?? err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('assets.confirmDelete'))) return
    try {
      await assetApi.delete(id)
      await fetchData()
    } catch (err) {
      setError(err.response?.data?.error?.message ?? err.message)
    }
  }

  if (loading) return <div className="text-sm text-muted-foreground">{t('common.loading')}</div>

  const totalValue = holdings.reduce((s, h) => s + (h.valueInTry ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t('assets.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('common.total')}: <span className="tabular text-foreground">{formatMoney(totalValue)}</span>
          </p>
        </div>
        <Button onClick={() => navigate('/assets/buy')}>
          <Plus className="mr-2 h-4 w-4" />
          {t('assets.buy')}
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {holdings.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="mb-4 text-muted-foreground">{t('assets.noAssets')}</p>
            <Button onClick={() => navigate('/assets/buy')}>{t('assets.buy')}</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 text-left font-medium">{t('common.type')}</th>
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
                {holdings.map((h) => {
                  const cfg = TYPE_CONFIG[h.assetType] || TYPE_CONFIG.Currency
                  const Icon = cfg.icon
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
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs ${cfg.cls}`}>
                          <Icon className="h-3.5 w-3.5" />
                          {t(`assets.${h.assetType.toLowerCase()}`)}
                        </span>
                      </td>
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
