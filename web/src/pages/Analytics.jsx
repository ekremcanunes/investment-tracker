import { useEffect, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { assetApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const formatTRY = (value) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value ?? 0)

const TYPE_COLORS = {
  Stock: '#c8a66a',   // pirinç
  Currency: '#8f867a', // nötr
}

const PIE_COLORS = ['#c8a66a', '#8f867a', '#5cbf95', '#e2867a']

const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#17140f',
  border: '1px solid #2c261c',
  borderRadius: '0.625rem',
  color: '#ece4d6',
}

export default function Analytics() {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pieData, setPieData] = useState([])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const assetsRes = await assetApi.getAll()

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
      } catch (err) {
        setError(err.response?.data?.error?.message ?? err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [t])

  if (loading) return <div className="text-muted-foreground">{t('common.loading')}</div>
  if (error) return <div className="text-down">{t('common.error')}: {error}</div>

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">{t('nav.analytics')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Varlık dağılımı */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('analytics.allocation')}</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t('assets.noAssets')}</p>
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
      </div>
    </div>
  )
}
