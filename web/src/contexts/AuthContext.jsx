import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:4433/sessions/whoami', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => setSession(data))
      .catch(() => setSession(null))
      .finally(() => setLoading(false))
  }, [])

  const logout = async () => {
    const res = await fetch('http://localhost:4433/self-service/logout/browser', { credentials: 'include' })
    const { logout_url } = await res.json()
    window.location.href = logout_url
  }

  return (
    <AuthContext.Provider value={{ session, loading, logout, setSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
