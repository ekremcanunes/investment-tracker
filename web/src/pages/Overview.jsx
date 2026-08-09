import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import { dashboardApi } from '@/services/api'
import { ArrowRight } from 'lucide-react'

const formatTry = (v) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(v ?? 0)

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

  if (loading) return <div className="text-sm text-muted-foreground">{t('common.loading')}</div>

  const total = dashboard?.totalValueInTry ?? 0
  const cash = dashboard?.cashValueInTry ?? 0
  const stock = dashboard?.stockValueInTry ?? 0
  const count = dashboard?.assetCount ?? 0
  const pct = (v) => (total > 0 ? (v / total) * 100 : 0)

  return (
    <div className="max-w-3xl space-y-8">
      {/* Net Varlık */}
      <section className="rounded-xl border border-border bg-card px-7 py-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {t('overview.netWorth')}
        </p>
        <p className="tabular mt-2 text-4xl font-semibold text-foreground">{formatTry(total)}</p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {count} {t('overview.assetCount')}
        </p>
      </section>

      {/* Dağılım */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">{t('overview.allocation')}</h2>
          <button
            onClick={() => navigate('/assets')}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:opacity-80"
          >
            {t('overview.allAssets')}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Segment bar */}
        <div className="flex h-2.5 overflow-hidden rounded-full border border-border">
          <div className="bg-primary" style={{ width: `${pct(stock)}%` }} />
          <div className="bg-muted-foreground/45" style={{ width: `${pct(cash)}%` }} />
        </div>

        {/* Tiles */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card px-4 py-3.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-xs font-medium text-muted-foreground">{t('overview.investments')}</span>
              <span className="tabular ml-auto text-xs text-muted-foreground">{pct(stock).toFixed(0)}%</span>
            </div>
            <p className="tabular mt-1.5 text-xl font-semibold text-foreground">{formatTry(stock)}</p>
          </div>

          <div className="rounded-lg border border-border bg-card px-4 py-3.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/45" />
              <span className="text-xs font-medium text-muted-foreground">{t('overview.cash')}</span>
              <span className="tabular ml-auto text-xs text-muted-foreground">{pct(cash).toFixed(0)}%</span>
            </div>
            <p className="tabular mt-1.5 text-xl font-semibold text-foreground">{formatTry(cash)}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
