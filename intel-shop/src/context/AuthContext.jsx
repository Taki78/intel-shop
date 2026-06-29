import { createContext, useContext, useState } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)
const USER_KEY = 'intel-shop-user'
const TOKENS_KEY = 'intel-shop-tokens'

function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function saveSession(userData, tokens) {
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
    setUser(userData)
  }

  function clearSession() {
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(TOKENS_KEY)
    setUser(null)
  }

  async function login(identifier, password) {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/login/', { identifier, password })
      saveSession(data.user, { access: data.access, refresh: data.refresh })
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.detail || 'اطلاعات ورود اشتباه است'
      setError(msg)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  /** Called by RegisterPage after the 3-step verify-first flow completes. */
  function adoptSession({ user, access, refresh }) {
    saveSession(user, { access, refresh })
  }

  async function logout() {
    try {
      const tokens = JSON.parse(localStorage.getItem(TOKENS_KEY) || '{}')
      if (tokens.refresh) await api.post('/auth/logout/', { refresh: tokens.refresh })
    } catch { /* ignore */ }
    clearSession()
  }

  async function updateProfile(data) {
    try {
      const { data: updated } = await api.patch('/users/me/', data)
      const merged = { ...user, ...updated }
      localStorage.setItem(USER_KEY, JSON.stringify(merged))
      setUser(merged)
    } catch (err) {
      const e = err.response?.data || {}
      const msg = e.detail || 'خطا در ذخیره اطلاعات'
      setError(msg)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, login, adoptSession, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
