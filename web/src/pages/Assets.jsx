import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import { assetApi } from '@/services/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MoneyInput } from '@/components/ui/money-input'
import StockDrawer from '@/components/StockDrawer'
import { Plus, Wallet, TrendingUp, Pencil, Trash2, X, Check, ArrowDownRight, AlertTriangle } from 'lucide-react'

const TYPE_CONFIG = {
  Currency: { icon: Wallet, color: 'text-green-400', bg: 'bg-green-500/10' },
  Stock: { icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
}

const formatMoney = (v, currency = 'TRY') =>
  v != null
    ? new Intl.NumberFormat(currency === 'TRY' ? 'tr-TR' : 'en-US', { style: 'currency', currency }).format(v)
    : '—'

const formatPercent = (v) => (v != null ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` : '')

export default function Assets() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const typeFilter = searchParams.get('type') // Overview kartından gelen tür filtresi
  const [holdings, setHoldings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null) // { id, mode: 'edit' | 'sell' }
  const [form, setForm] = useState({ quantity: '', price: '' })
  const [saving, setSaving] = useState(false)
  const [drawer, setDrawer] = useState(null) // açık detay drawer'ın holding'i

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

  if (loading) return <div className="text-gray-400 text-sm">{t('common.loading')}</div>

  const visible = typeFilter ? holdings.filter((h) => h.assetType === typeFilter) : holdings
  const totalValue = visible.reduce((s, h) => s + (h.valueInTry ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('assets.title')}</h1>
          <p className="text-gray-400 text-sm mt-1">{t('common.total')}: {formatMoney(totalValue)}</p>
        </div>
        <Button onClick={() => navigate('/assets/buy')}>
          <Plus className="h-4 w-4 mr-2" />
          {t('assets.buy')}
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {visible.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-gray-500 mb-4">{t('assets.noAssets')}</p>
              <Button onClick={() => navigate('/assets/buy')}>{t('assets.buy')}</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800/50 text-xs text-gray-400">
                    <th className="text-left px-4 py-2 font-medium">{t('common.type')}</th>
                    <th className="text-left px-4 py-2 font-medium">{t('assets.name')}</th>
                    <th className="text-right px-4 py-2 font-medium">{t('assets.quantity')}</th>
                    <th className="text-right px-4 py-2 font-medium">{t('assets.purchasePrice')}</th>
                    <th className="text-right px-4 py-2 font-medium">{t('assets.currentPrice')}</th>
                    <th className="text-right px-4 py-2 font-medium">{t('assets.cost')}</th>
                    <th className="text-right px-4 py-2 font-medium">{t('assets.currentValue')}</th>
                    <th className="text-right px-4 py-2 font-medium">{t('assets.profitLoss')}</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((h) => {
                    const cfg = TYPE_CONFIG[h.assetType] || TYPE_CONFIG.Currency
                    const Icon = cfg.icon
                    const isActive = editing?.id === h.id
                    const isSell = isActive && editing.mode === 'sell'
                    const pl = h.unrealizedProfitLoss
                    const plColor = pl > 0 ? 'text-green-400' : pl < 0 ? 'text-red-400' : 'text-gray-400'
                    const currentUnit = h.currency === 'USD' ? h.priceInUsd : h.priceInTry
                    const currentTotal = h.priceAvailable && currentUnit != null ? h.quantity * currentUnit : null
                    const clickable = h.assetType === 'Stock' && !isActive

                    return (
                      <tr
                        key={h.id}
                        className={`border-b border-gray-800/30 hover:bg-gray-800/20 ${clickable ? 'cursor-pointer' : ''}`}
                        onClick={() => clickable && setDrawer(h)}
                      >
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs ${cfg.bg} ${cfg.color}`}>
                            <Icon className="h-3 w-3" />
                            {t(`assets.${h.assetType.toLowerCase()}`)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-white font-medium">{h.symbol}</td>

                        {isActive ? (
                          <td colSpan={7} className="px-4 py-3">
                            <div className="flex items-center justify-end gap-3 flex-wrap">
                              <span className="text-xs text-gray-500">
                                {isSell ? t('assets.sellAsset') : t('assets.edit')} · {h.symbol} ({h.currency})
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-gray-400">{t('assets.quantity')}</span>
                                <MoneyInput
                                  value={form.quantity}
                                  onChange={(v) => setForm((f) => ({ ...f, quantity: v }))}
                                  className="h-7 w-24 text-xs"
                                  placeholder="0"
                                />
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-gray-400">
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
                                className="text-green-400 hover:text-green-300 hover:bg-green-500/10 h-7 w-7 p-0"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm" variant="ghost" onClick={() => setEditing(null)}
                                className="text-gray-400 hover:text-gray-300 h-7 w-7 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-sm text-right text-gray-300">{h.quantity}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-300">{formatMoney(h.avgCostBasis, h.currency)}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-300">
                              {h.priceAvailable ? (
                                formatMoney(currentUnit, h.currency)
                              ) : (
                                <span className="inline-flex items-center gap-1 text-yellow-500 text-xs">
                                  <AlertTriangle className="h-3 w-3" />
                                  {t('assets.priceUnavailable')}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-gray-300">{formatMoney(h.totalCost, h.currency)}</td>
                            <td className="px-4 py-3 text-sm text-right text-white font-medium">{formatMoney(currentTotal, h.currency)}</td>
                            <td className="px-4 py-3 text-sm text-right">
                              {pl != null ? (
                                <div>
                                  <span className={`font-medium ${plColor}`}>{formatMoney(pl, h.currency)}</span>
                                  <span className={`ml-1 text-xs ${plColor}`}>{formatPercent(h.unrealizedProfitLossPercent)}</span>
                                </div>
                              ) : (
                                <span className="text-gray-500">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  size="sm" variant="ghost" onClick={() => startSell(h)}
                                  className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 h-7 px-2 text-xs"
                                >
                                  <ArrowDownRight className="h-3.5 w-3.5 mr-1" />
                                  {t('assets.sell')}
                                </Button>
                                <Button
                                  size="sm" variant="ghost" onClick={() => startEdit(h)}
                                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-7 w-7 p-0"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm" variant="ghost" onClick={() => handleDelete(h.id)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 w-7 p-0"
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
        </CardContent>
      </Card>

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
