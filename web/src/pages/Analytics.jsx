import { useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { assetApi, transactionApi } from '@/services/api'
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
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pieData, setPieData] = useState([])
  const [categoryData, setCategoryData] = useState([])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [assetsRes, summaryRes] = await Promise.all([
          assetApi.getAll(),
          transactionApi.getSummary({}),
        ])

        // Pie: varlık tipine göre dağılım
        const typeValueMap = {}
        for (const h of assetsRes.data ?? []) {
          typeValueMap[h.assetType] = (typeValueMap[h.assetType] ?? 0) + (h.valueInTry ?? 0)
        }
        const totalAll = Object.values(typeValueMap).reduce((a, b) => a + b, 0)
        setPieData(
          Object.entries(typeValueMap).map(([name, value]) => ({
            name: t(`assets.${name.toLowerCase()}`),
            typeKey: name,
            value: parseFloat(((value / (totalAll || 1)) * 100).toFixed(2)),
            absValue: value,
          }))
        )

        // Bar: kategori bazlı gider dökümü
        const byCategory = (summaryRes.data?.byCategory ?? [])
          .filter((c) => c.type === 'Expense')
          .slice(0, 8)
          .map((c) => ({ name: c.category, value: c.total }))
        setCategoryData(byCategory)
      } catch (err) {
        setError(err.response?.data?.error?.message ?? err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [t])

  if (loading) return <div className="text-gray-400">{t('common.loading')}</div>
  if (error) return <div className="text-red-400">{t('common.error')}: {error}</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">{t('nav.analytics')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Varlık dağılımı */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('analytics.allocation')}</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <p className="text-gray-400 text-sm py-8 text-center">{t('assets.noAssets')}</p>
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
                        key={entry.typeKey}
                        fill={TYPE_COLORS[entry.typeKey] ?? PIE_COLORS[index % PIE_COLORS.length]}
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

        {/* Kategori bazlı giderler */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('analytics.expenseByCategory')}</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <p className="text-gray-400 text-sm py-8 text-center">{t('transactions.noResults')}</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
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
                    formatter={(value) => [formatTRY(value), t('common.total')]}
                  />
                  <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
