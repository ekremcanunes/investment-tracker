import { useMemo } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useHoldings } from '@/hooks/queries'
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
  Stock: '#1C1B18',    // ink
  Currency: '#6A675E', // nötr
  Gold: '#8C6A38',     // pirinç
}

const PIE_COLORS = ['#1C1B18', '#8C6A38', '#1B6E43', '#6A675E']

const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#F7F6F1',
  border: '1px solid #1C1B18',
  borderRadius: '2px',
  color: '#1C1B18',
}

export default function Analytics() {
  const { t } = useLanguage()
  const { data: holdings = [], isLoading, error } = useHoldings()

  // Pie: varlık tipine göre dağılım
  const pieData = useMemo(() => {
    const typeValueMap = {}
    for (const h of holdings) {
      typeValueMap[h.assetType] = (typeValueMap[h.assetType] ?? 0) + (h.valueInTry ?? 0)
    }
    const totalAll = Object.values(typeValueMap).reduce((a, b) => a + b, 0)
    return Object.entries(typeValueMap).map(([name, value]) => ({
      name: t(`assets.${name.toLowerCase()}`),
      typeKey: name,
      value: parseFloat(((value / (totalAll || 1)) * 100).toFixed(2)),
      absValue: value,
    }))
  }, [holdings, t])

  if (isLoading) return <div className="text-muted-foreground">{t('common.loading')}</div>
  if (error) return <div className="text-down">{t('common.error')}: {error.message}</div>

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
