import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { LineChart } from 'lucide-react'

export default function Login() {
  const [flow, setFlow] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const { t } = useLanguage()

  useEffect(() => {
    const flowId = searchParams.get('flow')
    if (flowId) {
      fetch(`http://localhost:4433/self-service/login/flows?id=${flowId}`, {
        credentials: 'include',
        headers: { Accept: 'application/json' }
      })
        .then(res => res.json())
        .then(setFlow)
    } else {
      window.location.href = 'http://localhost:4433/self-service/login/browser'
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const csrfToken = flow?.ui?.nodes?.find(n => n.attributes?.name === 'csrf_token')?.attributes?.value

    try {
      const res = await fetch(`http://localhost:4433/self-service/login?flow=${flow.id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ method: 'password', identifier: email, password, csrf_token: csrfToken })
      })

      const body = await res.json()

      if (res.ok) {
        setSession(body)
        navigate('/')
      } else {
        setError(body.ui?.messages?.[0]?.text ?? 'Login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!flow) return (
    <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
      {t('auth.redirecting')}
    </div>
  )

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left panel */}
      <div className="hidden w-1/2 flex-col justify-between border-r border-border bg-gradient-to-br from-primary/8 via-card to-background p-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15">
            <LineChart className="h-4.5 w-4.5 text-primary" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">{t('auth.appName')}</span>
        </div>
        <div>
          <p className="text-2xl font-semibold leading-snug text-foreground text-balance">
            {t('auth.loginTagline1')}<br />{t('auth.loginTagline2')}<br />{t('auth.loginTagline3')}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">{t('auth.loginSubtagline')}</p>
        </div>
        <p className="text-xs text-muted-foreground/70">{t('auth.copyright')}</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15">
              <LineChart className="h-4.5 w-4.5 text-primary" />
            </div>
            <span className="font-semibold tracking-tight text-foreground">{t('auth.appName')}</span>
          </div>

          <h1 className="mb-1 text-2xl font-semibold tracking-tight text-foreground">{t('auth.welcomeBack')}</h1>
          <p className="mb-8 text-sm text-muted-foreground">{t('auth.signInSubtitle')}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">{t('auth.email')}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-input bg-secondary/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">{t('auth.password')}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-input bg-secondary/40 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? t('auth.signingIn') : t('auth.signIn')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-primary transition-opacity hover:opacity-80">
              {t('auth.createOne')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
