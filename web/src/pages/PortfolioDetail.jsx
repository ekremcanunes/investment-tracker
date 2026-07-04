import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import { portfolioApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

const formatTRY = (value) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value ?? 0)

const formatUSD = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value ?? 0)

function CurrencyTable({ assets, onDelete }) {
  if (assets.length === 0) return null
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-base">Currency</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-2 font-medium text-gray-400">Symbol</th>
                <th className="text-right py-3 px-2 font-medium text-gray-400">Quantity</th>
                <th className="text-right py-3 px-2 font-medium text-gray-400">Price (TRY)</th>
                <th className="text-right py-3 px-2 font-medium text-gray-400">Total (TRY)</th>
                <th className="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id} className="border-b border-gray-800/50 last:border-0">
                  <td className="py-3 px-2 font-medium text-white">{asset.symbol}</td>
                  <td className="py-3 px-2 text-right text-gray-300">{asset.quantity}</td>
                  <td className="py-3 px-2 text-right text-gray-300">{formatTRY(asset.priceInTry)}</td>
                  <td className="py-3 px-2 text-right font-medium text-white">{formatTRY(asset.valueInTry)}</td>
                  <td className="py-3 px-2 text-right">
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => onDelete(asset.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function MarketTable({ title, assets, onDelete }) {
  if (assets.length === 0) return null
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-2 font-medium text-gray-400">Symbol</th>
                <th className="text-right py-3 px-2 font-medium text-gray-400">Quantity</th>
                <th className="text-right py-3 px-2 font-medium text-gray-400">Price (USD)</th>
                <th className="text-right py-3 px-2 font-medium text-gray-400">Price (TRY)</th>
                <th className="text-right py-3 px-2 font-medium text-gray-400">Total (USD)</th>
                <th className="text-right py-3 px-2 font-medium text-gray-400">Total (TRY)</th>
                <th className="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id} className="border-b border-gray-800/50 last:border-0">
                  <td className="py-3 px-2 font-medium text-white">{asset.symbol}</td>
                  <td className="py-3 px-2 text-right text-gray-300">{asset.quantity}</td>
                  <td className="py-3 px-2 text-right text-gray-300">{formatUSD(asset.priceInUsd)}</td>
                  <td className="py-3 px-2 text-right text-gray-300">{formatTRY(asset.priceInTry)}</td>
                  <td className="py-3 px-2 text-right text-gray-300">{formatUSD((asset.priceInUsd ?? 0) * asset.quantity)}</td>
                  <td className="py-3 px-2 text-right font-medium text-white">{formatTRY(asset.valueInTry)}</td>
                  <td className="py-3 px-2 text-right">
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => onDelete(asset.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PortfolioDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSummary = () => {
    setLoading(true)
    portfolioApi.getSummary(id)
      .then((res) => setSummary(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSummary() }, [id])

  const handleDeleteAsset = async (assetId) => {
    try {
      await portfolioApi.deleteAsset(id, assetId)
      fetchSummary()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className="text-gray-400">{t('common.loading')}</div>
  if (error) return <div className="text-red-400">{t('common.error')}: {error}</div>

  const assets = summary?.assets ?? []
  const totalValue = summary?.totalValueInTry ?? 0
  const portfolioName = summary?.name ?? 'Portfolio'

  const currencies = assets.filter(a => a.assetType === 'Currency')
  const stocks = assets.filter(a => a.assetType === 'Stock')
  const cryptos = assets.filter(a => a.assetType === 'Crypto')
  const hasAssets = assets.length > 0

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/assets')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{portfolioName}</h1>
          <p className="text-sm text-gray-400">{t('common.total')}: {formatTRY(totalValue)}</p>
        </div>
        <Button onClick={() => navigate(`/assets/${id}/add`)}>
          <Plus className="h-4 w-4" />
          {t('assets.addAsset')}
        </Button>
      </div>

      {!hasAssets ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-gray-400 text-sm text-center">{t('transactions.noResults')}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <CurrencyTable assets={currencies} onDelete={handleDeleteAsset} />
          <MarketTable title="Stocks" assets={stocks} onDelete={handleDeleteAsset} />
          <MarketTable title="Crypto" assets={cryptos} onDelete={handleDeleteAsset} />
        </>
      )}
    </div>
  )
}
