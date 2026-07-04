import { useEffect, useState } from 'react'
import { dashboardApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Briefcase, Package } from 'lucide-react'

const formatTRY = (value) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value ?? 0)

const assetTypeColors = {
  Currency: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Stock: 'bg-green-500/10 text-green-400 border-green-500/20',
  Crypto: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    dashboardApi.get()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-gray-400">Loading...</div>
  if (error) return <div className="text-red-400">Error: {error}</div>

  const totalValue = data?.totalValueInTry ?? 0
  const portfolioCount = data?.portfolioCount ?? 0
  const assetCount = data?.assetCount ?? 0
  const recentAssets = data?.recentAssets ?? []

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatTRY(totalValue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Portfolios</CardTitle>
            <Briefcase className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{portfolioCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{assetCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Recent Assets</CardTitle>
        </CardHeader>
        <CardContent>
          {recentAssets.length === 0 ? (
            <p className="text-gray-400 text-sm">No assets found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-2 font-medium text-gray-400">Asset</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-400">Type</th>
                    <th className="text-right py-3 px-2 font-medium text-gray-400">Quantity</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-400">Portfolio</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAssets.map((asset, i) => (
                    <tr key={i} className="border-b border-gray-800/50 last:border-0">
                      <td className="py-3 px-2 font-medium text-white">{asset.symbol}</td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${assetTypeColors[asset.assetType] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                          {asset.assetType}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right text-gray-300">{asset.quantity}</td>
                      <td className="py-3 px-2 text-gray-400">{asset.portfolioName}</td>
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
