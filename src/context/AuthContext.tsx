import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { AuthUser, AuthResponse } from '../services/api'
import { getProfile } from '../services/api'

type AuthContextType = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  saveAuth: (auth: AuthResponse) => void
  refreshUser: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('financially_auth')
    if (!stored) {
      setIsLoading(false)
      return
    }

    try {
      const parsed = JSON.parse(stored) as AuthResponse
      setToken(parsed.accessToken)
      setUser(parsed.user)

      getProfile()
        .then((profile) => {
          setUser(profile)
          const updated = { ...parsed, user: profile }
          localStorage.setItem('financially_auth', JSON.stringify(updated))
        })
        .catch(() => {
          localStorage.removeItem('financially_auth')
          setUser(null)
          setToken(null)
        })
        .finally(() => setIsLoading(false))
    } catch {
      localStorage.removeItem('financially_auth')
      setIsLoading(false)
    }
  }, [])

  const saveAuth = (auth: AuthResponse) => {
    localStorage.setItem('financially_auth', JSON.stringify(auth))
    setToken(auth.accessToken)
    setUser(auth.user)
  }

  const refreshUser = async () => {
    const stored = localStorage.getItem('financially_auth')
    if (!stored) return
    try {
      const parsed = JSON.parse(stored) as AuthResponse
      const profile = await getProfile()
      setUser(profile)
      localStorage.setItem('financially_auth', JSON.stringify({ ...parsed, user: profile }))
    } catch {
      // ignore
    }
  }

  const logout = () => {
    localStorage.removeItem('financially_auth')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        saveAuth,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
