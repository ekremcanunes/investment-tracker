import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import { portfolioApi } from '@/services/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Wallet, TrendingUp, Coins, Pencil, Trash2, X, Check } from 'lucide-react'

const TYPE_CONFIG = {
  Currency: { icon: Wallet, color: 'text-green-400', bg: 'bg-green-500/10' },
  Stock: { icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  Crypto: { icon: Coins, color: 'text-orange-400', bg: 'bg-orange-500/10' },
}

const formatTRY = (v) => v != null ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v) : '—'
const formatUSD = (v) => v != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v) : '—'
const formatPercent = (v) => v != null ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` : '—'

export default function Assets() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [portfolios, setPortfolios] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingAsset, setEditingAsset] = useState(null)
  const [editForm, setEditForm] = useState({ quantity: '', purchasePrice: '' })
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await portfolioApi.getAll()
      const portfoliosWithSummary = await Promise.all(
        res.data.map(async (p) => {
          try {
            const summaryRes = await portfolioApi.getSummary(p.id)
            return { ...p, summary: summaryRes.data }
          } catch {
            return { ...p, summary: null }
          }
        })
      )
      setPortfolios(portfoliosWithSummary)
    } catch { /* ignore */ }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleEdit = (portfolioId, asset) => {
    setEditingAsset({ portfolioId, assetId: asset.id })
    setEditForm({
      quantity: String(asset.quantity),
      purchasePrice: asset.avgCostBasis != null ? String(asset.avgCostBasis) : '',
    })
  }

  const handleSave = async () => {
    if (!editingAsset) return
    setSaving(true)
    try {
      await portfolioApi.updateAsset(editingAsset.portfolioId, editingAsset.assetId, {
        quantity: parseFloat(editForm.quantity),
        purchasePrice: editForm.purchasePrice ? parseFloat(editForm.purchasePrice) : null,
      })
      setEditingAsset(null)
      await fetchData()
    } catch { /* ignore */ }
    setSaving(false)
  }

  const handleDelete = async (portfolioId, assetId) => {
    try {
      await portfolioApi.deleteAsset(portfolioId, assetId)
      await fetchData()
    } catch { /* ignore */ }
  }

  if (loading) return <div className="text-gray-400 text-sm">{t('common.loading')}</div>

  const defaultPortfolio = portfolios[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{t('assets.title')}</h1>
        {defaultPortfolio && (
          <Button onClick={() => navigate(`/assets/${defaultPortfolio.id}/add`)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('assets.addAsset')}
          </Button>
        )}
      </div>

      {portfolios.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">{t('assets.noAssets')}</p>
            <Button onClick={async () => {
              const res = await portfolioApi.create({ name: 'Varlıklarım', description: 'Varsayılan portföy' })
              navigate(`/assets/${res.data.id}/add`)
            }}>
              {t('assets.addAsset')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        portfolios.map(p => {
          const assets = p.summary?.assets ?? []
          const totalValue = p.summary?.totalValueInTry ?? 0

          return (
            <Card key={p.id}>
              <CardContent className="p-0">
                <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-white">{p.name}</span>
                    <span className="ml-3 text-xs text-gray-400">{t('common.total')}: {formatTRY(totalValue)}</span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/assets/${p.id}/add`)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {assets.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-500 text-sm">{t('assets.noAssets')}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800/50 text-xs text-gray-400">
                          <th className="text-left px-4 py-2 font-medium">{t('common.type')}</th>
                          <th className="text-left px-4 py-2 font-medium">{t('assets.symbol')}</th>
                          <th className="text-right px-4 py-2 font-medium">{t('assets.quantity')}</th>
                          <th className="text-right px-4 py-2 font-medium">{t('assets.purchasePrice')}</th>
                          <th className="text-right px-4 py-2 font-medium">{t('assets.currentPrice')}</th>
                          <th className="text-right px-4 py-2 font-medium">{t('assets.value')}</th>
                          <th className="text-right px-4 py-2 font-medium">{t('assets.profitLoss')}</th>
                          <th className="px-4 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {assets.map(a => {
                          const cfg = TYPE_CONFIG[a.assetType] || TYPE_CONFIG.Currency
                          const Icon = cfg.icon
                          const isEditing = editingAsset?.assetId === a.id
                          const plColor = a.profitLossInTry > 0 ? 'text-green-400' : a.profitLossInTry < 0 ? 'text-red-400' : 'text-gray-400'

                          return (
                            <tr key={a.id} className="border-b border-gray-800/30 hover:bg-gray-800/20">
                              <td className="px-4 py-3 text-sm">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs ${cfg.bg} ${cfg.color}`}>
                                  <Icon className="h-3 w-3" />
                                  {t(`assets.${a.assetType.toLowerCase()}`) || a.assetType}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-white font-medium">{a.symbol}</td>

                              {isEditing ? (
                                <>
                                  <td className="px-4 py-3">
                                    <Input
                                      type="number" min="0" step="any"
                                      value={editForm.quantity}
                                      onChange={e => setEditForm(f => ({ ...f, quantity: e.target.value }))}
                                      className="w-24 h-7 text-xs text-right"
                                    />
                                  </td>
                                  <td className="px-4 py-3">
                                    <Input
                                      type="number" min="0" step="any"
                                      value={editForm.purchasePrice}
                                      onChange={e => setEditForm(f => ({ ...f, purchasePrice: e.target.value }))}
                                      className="w-28 h-7 text-xs text-right"
                                      placeholder="—"
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right text-gray-300">{formatTRY(a.priceInTry)}</td>
                                  <td className="px-4 py-3 text-sm text-right text-white font-medium">{formatTRY(a.valueInTry)}</td>
                                  <td className="px-4 py-3 text-sm text-right text-gray-400">—</td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <Button size="sm" variant="ghost" onClick={handleSave} disabled={saving}
                                        className="text-green-400 hover:text-green-300 hover:bg-green-500/10 h-7 w-7 p-0">
                                        <Check className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="ghost" onClick={() => setEditingAsset(null)}
                                        className="text-gray-400 hover:text-gray-300 h-7 w-7 p-0">
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-4 py-3 text-sm text-right text-gray-300">{a.quantity}</td>
                                  <td className="px-4 py-3 text-sm text-right text-gray-300">{formatTRY(a.avgCostBasis)}</td>
                                  <td className="px-4 py-3 text-sm text-right text-gray-300">{formatTRY(a.priceInTry)}</td>
                                  <td className="px-4 py-3 text-sm text-right text-white font-medium">{formatTRY(a.valueInTry)}</td>
                                  <td className="px-4 py-3 text-sm text-right">
                                    {a.profitLossInTry != null ? (
                                      <div>
                                        <span className={`font-medium ${plColor}`}>{formatTRY(a.profitLossInTry)}</span>
                                        <span className={`ml-1 text-xs ${plColor}`}>{formatPercent(a.profitLossPercent)}</span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-500">—</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <Button size="sm" variant="ghost" onClick={() => handleEdit(p.id, a)}
                                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-7 w-7 p-0">
                                        <Pencil className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id, a.id)}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 w-7 p-0">
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
          )
        })
      )}
    </div>
  )
}
