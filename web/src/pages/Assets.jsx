import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import { useHoldings, useSellAsset, useUpdateAsset, useDeleteAsset } from '@/hooks/queries'
import { MoneyInput } from '@/components/ui/money-input'
import { Skeleton } from '@/components/ui/skeleton'
import { Modal } from '@/components/ui/modal'
import AssetDrawer from '@/components/AssetDrawer'
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
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ quantity: '', price: '' })
  const [drawer, setDrawer] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const saving = sellMutation.isPending || updateMutation.isPending

  const startEdit = (a) => {
    setEditing({ id: a.id, mode: 'edit' })
    setForm({ quantity: String(a.quantity), price: a.avgCostBasis != null ? String(a.avgCostBasis) : '' })
  }
  const startSell = (a) => {
    setEditing({ id: a.id, mode: 'sell' })
    setForm({ quantity: String(a.quantity), price: '' })
  }

  const handleConfirm = async () => {
    if (!editing) return
    setError(null)
    try {
      if (editing.mode === 'sell') {
        await sellMutation.mutateAsync({ id: editing.id, data: { quantity: parseFloat(form.quantity), unitPrice: parseFloat(form.price) } })
      } else {
        await updateMutation.mutateAsync({ id: editing.id, data: { quantity: parseFloat(form.quantity), purchasePrice: form.price ? parseFloat(form.price) : null } })
      }
      setEditing(null)
    } catch (err) {
      setError(err.response?.data?.error?.message ?? err.message)
    }
  }

  const doDelete = async () => {
    const id = confirmId
    setConfirmId(null)
    setError(null)
    try {
      await deleteMutation.mutateAsync(id)
    } catch (err) {
      setError(err.response?.data?.error?.message ?? err.message)
    }
  }

  const visible = holdings.filter((h) => h.assetType === tab)
  const tabTotal = visible.reduce((s, h) => s + (h.valueInTry ?? 0), 0)
  const grandTotal = holdings.reduce((s, h) => s + (h.valueInTry ?? 0), 0)
  const shownError = error ?? (queryError ? queryError.message : null)

  // Sütun etiketleri türe göre uyarlanır
  const qtyLabel = tab === 'Currency' ? t('assets.amount') : tab === 'Gold' ? t('assets.grams') : t('assets.quantity')
  const costLabel = tab === 'Currency' ? t('assets.buyRate') : t('assets.purchasePrice')
  const curLabel = tab === 'Currency' ? t('assets.currentRate') : t('assets.currentPrice')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('assets.title')}</h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {t('assets.grandTotal')}: <span className="tabular text-foreground">{formatMoney(grandTotal)}</span>
          </p>
        </div>
        <button
          onClick={() => navigate('/assets/buy')}
          className="inline-flex items-center gap-2 border border-brass bg-brass px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {t('assets.buy')}
        </button>
      </div>

      {/* Tab bar — ledger buton stili */}
      <div className="flex gap-2 font-mono text-xs">
        {TABS.map((key) => (
          <button
            key={key}
            onClick={() => { setTab(key); setEditing(null) }}
            className={`border px-3 py-1.5 font-bold uppercase tracking-wider ${
              tab === key
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground'
            }`}
          >
            {t(`assets.${key.toLowerCase()}`)}
          </button>
        ))}
      </div>

      {shownError && (
        <div className="border border-destructive/30 bg-destructive/5 px-3 py-2 font-mono text-xs text-destructive">
          {shownError}
        </div>
      )}

      <section className="margin-rule overflow-hidden border border-border bg-card p-6 shadow-ledger md:p-8">
        <div className="pl-4 md:pl-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : visible.length === 0 ? (
            <div className="py-14 text-center">
              <p className="mb-4 font-mono text-xs text-muted-foreground">{t('assets.noAssets')}</p>
              <button onClick={() => navigate('/assets/buy')} className="border border-foreground px-4 py-2 font-mono text-xs font-bold uppercase text-foreground hover:bg-foreground hover:text-background">
                {t('assets.buy')}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="tabular w-full whitespace-nowrap text-left font-mono text-xs">
                <thead>
                  <tr className="border-b-2 border-foreground uppercase tracking-wider text-muted-foreground">
                    <th className="px-2 py-3 font-normal">{t('assets.name')}</th>
                    <th className="px-2 py-3 text-right font-normal">{qtyLabel}</th>
                    <th className="px-2 py-3 text-right font-normal">{costLabel}</th>
                    <th className="px-2 py-3 text-right font-normal">{curLabel}</th>
                    <th className="px-2 py-3 text-right font-normal">{t('assets.currentValue')}</th>
                    <th className="px-2 py-3 text-right font-normal">{t('assets.profitLoss')}</th>
                    <th className="px-2 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visible.map((h) => {
                    const isActive = editing?.id === h.id
                    const isSell = isActive && editing.mode === 'sell'
                    const pl = h.unrealizedProfitLoss
                    const plColor = pl > 0 ? 'text-up' : pl < 0 ? 'text-down' : 'text-muted-foreground'
                    const currentUnit = h.currency === 'USD' ? h.priceInUsd : h.priceInTry
                    const currentTotal = h.priceAvailable && currentUnit != null ? h.quantity * currentUnit : null
                    const clickable = !isActive

                    return (
                      <tr
                        key={h.id}
                        className={`group hover:bg-secondary ${clickable ? 'cursor-pointer' : ''}`}
                        onClick={() => clickable && setDrawer(h)}
                      >
                        <td className="px-2 py-3.5 font-bold text-foreground group-hover:underline">{h.symbol}</td>
                        {isActive ? (
                          <td colSpan={6} className="px-2 py-3">
                            <div className="flex flex-wrap items-center justify-end gap-3">
                              <span className="text-muted-foreground">
                                {isSell ? t('assets.sellAsset') : t('assets.edit')} · {h.symbol} ({h.currency})
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground">{t('assets.quantity')}</span>
                                <MoneyInput value={form.quantity} onChange={(v) => setForm((f) => ({ ...f, quantity: v }))} className="h-7 w-24 text-xs" placeholder="0" />
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground">{isSell ? t('assets.unitPrice') : t('assets.purchasePrice')}</span>
                                <MoneyInput currency={h.currency} value={form.price} onChange={(v) => setForm((f) => ({ ...f, price: v }))} className="h-7 w-28 text-xs" placeholder="0,00" />
                              </div>
                              <button onClick={handleConfirm} disabled={saving || !form.quantity || (isSell && !form.price)} className="border border-up p-1 text-up hover:bg-up/10 disabled:opacity-40">
                                <Check className="h-4 w-4" />
                              </button>
                              <button onClick={() => setEditing(null)} className="border border-border p-1 text-muted-foreground hover:border-foreground">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        ) : (
                          <>
                            <td className="px-2 py-3.5 text-right text-muted-foreground">{h.quantity}</td>
                            <td className="px-2 py-3.5 text-right text-muted-foreground">{formatMoney(h.avgCostBasis, h.currency)}</td>
                            <td className="px-2 py-3.5 text-right">
                              {h.priceAvailable ? (
                                <span className="text-muted-foreground">{formatMoney(currentUnit, h.currency)}</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-down"><AlertTriangle className="h-3 w-3" />{t('assets.priceUnavailable')}</span>
                              )}
                            </td>
                            <td className="px-2 py-3.5 text-right font-bold text-foreground">{formatMoney(currentTotal, h.currency)}</td>
                            <td className={`px-2 py-3.5 text-right font-bold ${plColor}`}>
                              {pl != null ? <>{formatMoney(pl, h.currency)} <span className="text-[11px]">({formatPercent(h.unrealizedProfitLossPercent)})</span></> : '—'}
                            </td>
                            <td className="px-2 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => startSell(h)} className="border border-border px-2 py-1 text-down hover:border-down" title={t('assets.sell')}>
                                  <ArrowDownRight className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => startEdit(h)} className="border border-border p-1 text-muted-foreground hover:border-foreground hover:text-foreground" title={t('assets.edit')}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => setConfirmId(h.id)} className="border border-border p-1 text-muted-foreground hover:border-down hover:text-down" title={t('common.delete')}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-double-bottom bg-secondary/50 font-bold uppercase">
                    <td className="px-2 py-3.5" colSpan={4}>{t('common.total')}</td>
                    <td className="px-2 py-3.5 text-right text-foreground">{formatMoney(tabTotal)}</td>
                    <td className="px-2 py-3.5"></td>
                    <td className="px-2 py-3.5"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </section>

      {drawer && (
        <AssetDrawer
          holding={drawer}
          onClose={() => setDrawer(null)}
          onSell={(h) => { setDrawer(null); startSell(h) }}
        />
      )}

      <Modal
        open={confirmId != null}
        onClose={() => setConfirmId(null)}
        title={t('common.delete')}
        subtitle="Portföy Kaydı"
        actions={
          <>
            <button onClick={() => setConfirmId(null)} className="w-1/2 border border-foreground py-2.5 font-mono text-xs font-bold uppercase text-foreground hover:bg-secondary">
              {t('common.cancel')}
            </button>
            <button onClick={doDelete} className="w-1/2 border border-down bg-down py-2.5 font-mono text-xs font-bold uppercase text-white hover:opacity-90">
              {t('common.delete')}
            </button>
          </>
        }
      >
        <p className="text-center font-mono text-xs text-muted-foreground">{t('assets.confirmDelete')}</p>
      </Modal>
    </div>
  )
}
