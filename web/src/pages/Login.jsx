import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { isValidEmail, kratosErrorText } from '../lib/authErrors'

export default function Login() {
  const [flow, setFlow] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErr, setFieldErr] = useState({})
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
        headers: { Accept: 'application/json' },
      })
        .then((res) => res.json())
        .then(setFlow)
    } else {
      window.location.href = 'http://localhost:4433/self-service/login/browser'
    }
  }, [searchParams])

  const validate = () => {
    const e = {}
    if (!email) e.email = t('auth.errEmailRequired')
    else if (!isValidEmail(email)) e.email = t('auth.errEmailInvalid')
    if (!password) e.password = t('auth.errPasswordRequired')
    setFieldErr(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!validate()) return

    setLoading(true)
    const csrfToken = flow?.ui?.nodes?.find((n) => n.attributes?.name === 'csrf_token')?.attributes?.value
    try {
      const res = await fetch(`http://localhost:4433/self-service/login?flow=${flow.id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ method: 'password', identifier: email, password, csrf_token: csrfToken }),
      })
      const body = await res.json()
      if (res.ok) {
        setSession(body)
        navigate('/')
      } else {
        setError(kratosErrorText(body, t))
      }
    } finally {
      setLoading(false)
    }
  }

  if (!flow) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background font-mono text-xs text-muted-foreground">
        {t('auth.redirecting')}
      </div>
    )
  }

  const inputCls = 'w-full border border-input bg-background px-3 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring'

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm border-2 border-foreground bg-card p-8 shadow-ledger-strong">
        <div className="mb-6 text-center">
          <span className="block font-serif text-2xl font-bold text-foreground">LEDGER № 01</span>
          <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {t('auth.signInSubtitle')}
          </span>
        </div>

        {error && (
          <div className="mb-4 border border-destructive/30 bg-destructive/5 px-3 py-2 font-mono text-xs text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs" noValidate>
          <div>
            <label className="mb-1 block uppercase text-muted-foreground">{t('auth.email')}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
            {fieldErr.email && <p className="mt-1 text-down">{fieldErr.email}</p>}
          </div>

          <div>
            <label className="mb-1 block uppercase text-muted-foreground">{t('auth.password')}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
            {fieldErr.password && <p className="mt-1 text-down">{fieldErr.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-foreground bg-foreground py-3 font-bold uppercase tracking-wider text-background hover:opacity-90 disabled:opacity-50"
          >
            {loading ? t('auth.signingIn') : t('auth.signIn')}
          </button>
        </form>

        <p className="mt-6 text-center font-mono text-[11px] text-muted-foreground">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-foreground underline hover:text-margin">{t('auth.createOne')}</Link>
        </p>
      </div>
    </div>
  )
}
