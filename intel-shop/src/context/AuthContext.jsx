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

  async function login(email, password) {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/login/', { email, password })
      saveSession(data.user, { access: data.access, refresh: data.refresh })
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.detail || 'ایمیل یا رمز عبور اشتباه است'
      setError(msg)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  async function register(name, email, phone, password) {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/register/', { name, email, phone, password, confirm: password })
      saveSession(data.user, { access: data.access, refresh: data.refresh })
      return { success: true }
    } catch (err) {
      const e = err.response?.data || {}
      const msg =
        e.email?.[0] ||
        e.phone?.[0] ||
        e.name?.[0] ||
        e.password?.[0] ||
        e.non_field_errors?.[0] ||
        e.detail ||
        'خطا در ثبت‌نام'
      setError(msg)
      return { success: false }
    } finally {
      setLoading(false)
    }
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
    <AuthContext.Provider value={{ user, loading, error, setError, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
