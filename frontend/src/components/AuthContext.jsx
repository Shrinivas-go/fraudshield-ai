import { createContext, useContext, useState, useEffect } from 'react'
import API_URL from '../config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)

  // Check localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('fraudshield_user')
    if (saved) {
      try { setUser(JSON.parse(saved)) } catch { /* ignore */ }
    }
  }, [])

  const login = async (email, password) => {
    setAuthLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Login failed')
      setUser(data.user)
      localStorage.setItem('fraudshield_user', JSON.stringify(data.user))
      setShowAuthModal(false)
      return { success: true }
    } catch (e) {
      return { success: false, error: e.message }
    } finally {
      setAuthLoading(false)
    }
  }

  const signup = async (name, email, password) => {
    setAuthLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Signup failed')
      setUser(data.user)
      localStorage.setItem('fraudshield_user', JSON.stringify(data.user))
      setShowAuthModal(false)
      return { success: true }
    } catch (e) {
      return { success: false, error: e.message }
    } finally {
      setAuthLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('fraudshield_user')
  }

  return (
    <AuthContext.Provider value={{
      user, login, signup, logout,
      showAuthModal, setShowAuthModal,
      authLoading,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
