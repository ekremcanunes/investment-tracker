import { useEffect, useState } from 'react'
import { portfolioApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'

const formatTRY = (value) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value ?? 0)

const TYPE_COLORS = {
  Currency: '#3b82f6',
  Stock: '#22c55e',
  Crypto: '#f97316',
}

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ec4899']

const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#111827',
  border: '1px solid #374151',
  borderRadius: '0.5rem',
  color: '#f9fafb',
}

export default function Analytics() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pieData, setPieData] = useState([])
  const [barData, setBarData] = useState([])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const portfoliosRes = await portfolioApi.getAll()
        const portfolios = portfoliosRes.data ?? []

        const summaries = await Promise.all(
          portfolios.map((p) => portfolioApi.getSummary(p.id).then((r) => r.data))
        )

        // Pie chart: allocation by asset type
        const typeValueMap = {}
        for (const summary of summaries) {
          for (const asset of summary?.assets ?? []) {
            const t = asset.assetType
            typeValueMap[t] = (typeValueMap[t] ?? 0) + (asset.valueInTry ?? 0)
          }
        }
        const totalAllAssets = Object.values(typeValueMap).reduce((a, b) => a + b, 0)
        const pieChartData = Object.entries(typeValueMap).map(([name, value]) => ({
          name,
          value: parseFloat(((value / (totalAllAssets || 1)) * 100).toFixed(2)),
          absValue: value,
        }))
        setPieData(pieChartData)

        // Bar chart: portfolio distribution
        const barChartData = summaries.map((s, i) => ({
          name: s?.name ?? portfolios[i]?.name ?? `Portfolio ${i + 1}`,
          value: s?.totalValueInTry ?? 0,
        }))
        setBarData(barChartData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  if (loading) return <div className="text-gray-400">Loading...</div>
  if (error) return <div className="text-red-400">Error: {error}</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Asset Allocation by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <p className="text-gray-400 text-sm py-8 text-center">No data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={TYPE_COLORS[entry.name] ?? PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value, name, props) => [
                      `${value}% (${formatTRY(props.payload.absValue)})`,
                      name,
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Bar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Portfolio Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length === 0 ? (
              <p className="text-gray-400 text-sm py-8 text-center">No data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} stroke="#374151" />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    stroke="#374151"
                    tickFormatter={(v) =>
                      new Intl.NumberFormat('tr-TR', { notation: 'compact' }).format(v)
                    }
                  />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    cursor={{ fill: '#ffffff0d' }}
                    formatter={(value) => [formatTRY(value), 'Value']}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
