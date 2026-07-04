import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { TrendingUp } from 'lucide-react'

export default function Register() {
  const [flow, setFlow] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setSession } = useAuth()

  useEffect(() => {
    const flowId = searchParams.get('flow')
    if (flowId) {
      fetch(`http://localhost:4433/self-service/registration/flows?id=${flowId}`, {
        credentials: 'include',
        headers: { Accept: 'application/json' }
      })
        .then(res => res.json())
        .then(setFlow)
    } else {
      window.location.href = 'http://localhost:4433/self-service/registration/browser'
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const csrfToken = flow?.ui?.nodes?.find(n => n.attributes?.name === 'csrf_token')?.attributes?.value

    try {
      const res = await fetch(`http://localhost:4433/self-service/registration?flow=${flow.id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ method: 'password', 'traits.email': email, password, csrf_token: csrfToken })
      })

      const body = await res.json()

      if (res.ok) {
        setSession(body.session)
        navigate('/')
      } else {
        setError(body.ui?.messages?.[0]?.text ?? body.ui?.nodes?.find(n => n.messages?.length > 0)?.messages?.[0]?.text ?? 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!flow) return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-400 text-sm">
      Redirecting...
    </div>
  )

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-gradient-to-br from-blue-950 to-gray-950">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-blue-400" />
          <span className="text-white font-semibold text-lg">Investment Tracker</span>
        </div>
        <div>
          <p className="text-2xl font-semibold text-white leading-snug">
            Start tracking today.<br />Build your portfolio.<br />Own your finances.
          </p>
          <p className="mt-3 text-gray-400 text-sm">Create an account in seconds. No credit card required.</p>
        </div>
        <p className="text-gray-600 text-xs">© 2025 Investment Tracker</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <span className="text-white font-semibold">Investment Tracker</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
          <p className="text-gray-400 text-sm mb-8">Get started with your free account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
