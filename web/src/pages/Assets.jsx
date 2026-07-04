import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import { portfolioApi } from '@/services/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Wallet, TrendingUp, Coins } from 'lucide-react'

const TYPE_CONFIG = {
  Currency: { icon: Wallet, color: 'text-green-400', bg: 'bg-green-500/10' },
  Stock: { icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  Crypto: { icon: Coins, color: 'text-orange-400', bg: 'bg-orange-500/10' },
}

export default function Assets() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [portfolios, setPortfolios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    portfolioApi.getAll().then(res => {
      setPortfolios(res.data)
      setLoading(false)
    })
  }, [])

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
            <p className="text-gray-500 mb-4">{t('transactions.noResults')}</p>
            <Button onClick={async () => {
              const res = await portfolioApi.create({ name: 'Varlıklarım', description: 'Varsayılan portföy' })
              navigate(`/assets/${res.data.id}/add`)
            }}>
              {t('assets.addAsset')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        portfolios.map(p => (
          <Card key={p.id}>
            <CardContent className="p-0">
              <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                <span className="text-sm font-medium text-white">{p.name}</span>
                <Button size="sm" variant="ghost" onClick={() => navigate(`/assets/${p.id}/add`)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {(!p.assets || p.assets.length === 0) ? (
                <div className="px-4 py-6 text-center text-gray-500 text-sm">{t('transactions.noResults')}</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800/50 text-sm text-gray-400">
                      <th className="text-left px-4 py-2 font-medium">{t('common.type')}</th>
                      <th className="text-left px-4 py-2 font-medium">Symbol</th>
                      <th className="text-right px-4 py-2 font-medium">{t('common.amount')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.assets.map(a => {
                      const cfg = TYPE_CONFIG[a.assetType] || TYPE_CONFIG.Currency
                      const Icon = cfg.icon
                      return (
                        <tr key={a.id} className="border-b border-gray-800/30 hover:bg-gray-800/30">
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs ${cfg.bg} ${cfg.color}`}>
                              <Icon className="h-3 w-3" />
                              {t(`assets.${a.assetType.toLowerCase()}`) || a.assetType}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-white font-medium">{a.symbol}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-300">{a.quantity}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
