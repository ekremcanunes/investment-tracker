import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { portfolioApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

const formatTRY = (value) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value ?? 0)

const assetTypeColors = {
  Currency: 'bg-blue-100 text-blue-700 border-blue-200',
  Stock: 'bg-green-100 text-green-700 border-green-200',
  Crypto: 'bg-orange-100 text-orange-700 border-orange-200',
}

export default function PortfolioDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
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

  useEffect(() => {
    fetchSummary()
  }, [id])

  const handleDeleteAsset = async (assetId) => {
    try {
      await portfolioApi.deleteAsset(id, assetId)
      fetchSummary()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className="text-gray-500">Loading...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>

  const assets = summary?.assets ?? []
  const totalValue = summary?.totalValueInTry ?? 0
  const portfolioName = summary?.name ?? 'Portfolio'

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/portfolios')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{portfolioName}</h1>
          <p className="text-sm text-gray-500">Total Value: {formatTRY(totalValue)}</p>
        </div>
        <Button onClick={() => navigate(`/portfolios/${id}/add-asset`)}>
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assets</CardTitle>
        </CardHeader>
        <CardContent>
          {assets.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">
              No assets yet. Add your first asset.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Symbol</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-500">Type</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-500">Quantity</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-500">Price (TRY)</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-500">Value (TRY)</th>
                    <th className="py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 px-2 font-medium text-gray-900">{asset.symbol}</td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${assetTypeColors[asset.assetType] ?? 'bg-gray-100 text-gray-700'}`}>
                          {asset.assetType}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right text-gray-700">{asset.quantity}</td>
                      <td className="py-3 px-2 text-right text-gray-700">{formatTRY(asset.priceInTry)}</td>
                      <td className="py-3 px-2 text-right font-medium text-gray-900">{formatTRY(asset.valueInTry)}</td>
                      <td className="py-3 px-2 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteAsset(asset.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
