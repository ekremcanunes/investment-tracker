import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

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

  if (!flow) return <div className="flex min-h-screen items-center justify-center text-gray-500">Redirecting...</div>

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-96 space-y-4 p-8 bg-white border rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
