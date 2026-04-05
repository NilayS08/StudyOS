import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// ── Dark mode ─────────────────────────────────────────────────────────────

function getInitialDark() {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem('srg_dark_mode')
  if (stored !== null) return stored === 'true'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// ── JWT helpers ───────────────────────────────────────────────────────────

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

function isTokenExpired(token) {
  const payload = parseJwt(token)
  if (!payload?.exp) return true
  return Date.now() / 1000 > payload.exp
}

// ── Provider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [token, setToken]   = useState(() => {
    const t = localStorage.getItem('srg_token')
    if (t && isTokenExpired(t)) {
      localStorage.removeItem('srg_token')
      return null
    }
    return t || null
  })
  const [darkMode, setDarkMode] = useState(getInitialDark)

  // Apply / remove `dark` class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('srg_dark_mode', String(darkMode))
  }, [darkMode])

  const user = token ? parseJwt(token) : null

  const loginWithToken = (newToken) => {
    localStorage.setItem('srg_token', newToken)
    setToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem('srg_token')
    setToken(null)
  }

  const toggleDarkMode = () => setDarkMode(d => !d)

  const loginWithGoogle = () => {
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    window.location.href = `${apiBase}/api/auth/google/login`
  }

  return (
    <AuthContext.Provider value={{
      token,
      user,
      isAuthenticated: !!token,
      loginWithToken,
      loginWithGoogle,
      logout,
      darkMode,
      toggleDarkMode,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}