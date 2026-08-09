import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import { dashboardApi } from '@/services/api'
import { Card, CardContent } from '@/components/ui/card'
import { Wallet, TrendingUp } from 'lucide-react'

export default function Overview() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.get().catch(() => ({ data: null })).then((res) => {
      setDashboard(res.data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="text-gray-400 text-sm">{t('common.loading')}</div>
  }

  const totalValue = dashboard?.totalValueInTry ?? 0
  const cashValue = dashboard?.cashValueInTry ?? 0
  const stockValue = dashboard?.stockValueInTry ?? 0

  const formatCurrency = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">{t('overview.title')}</h1>

      {/* Net Worth */}
      <Card className="bg-gradient-to-r from-blue-950 to-gray-900 border-blue-900/50">
        <CardContent className="py-8 px-6">
          <p className="text-sm text-blue-300">{t('overview.netWorth')}</p>
          <p className="text-4xl font-bold text-white mt-1">{formatCurrency(totalValue)}</p>
        </CardContent>
      </Card>

      {/* Asset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:border-blue-700 transition-colors" onClick={() => navigate('/assets?type=Currency')}>
          <CardContent className="py-5 px-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/10">
              <Wallet className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">{t('overview.cash')}</p>
              <p className="text-xl font-semibold text-white">{formatCurrency(cashValue)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-blue-700 transition-colors" onClick={() => navigate('/assets?type=Stock')}>
          <CardContent className="py-5 px-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <TrendingUp className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">{t('overview.investments')}</p>
              <p className="text-xl font-semibold text-white">{formatCurrency(stockValue)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
