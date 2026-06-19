import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const TOKENS_KEY = 'intel-shop-tokens'

const api = axios.create({ baseURL: BASE, headers: { 'Content-Type': 'application/json' } })

api.interceptors.request.use((config) => {
  const tokens = JSON.parse(localStorage.getItem(TOKENS_KEY) || '{}')
  if (tokens.access) config.headers.Authorization = `Bearer ${tokens.access}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const tokens = JSON.parse(localStorage.getItem(TOKENS_KEY) || '{}')
      if (tokens.refresh) {
        try {
          const { data } = await axios.post(`${BASE}/auth/refresh/`, { refresh: tokens.refresh })
          const updated = { ...tokens, access: data.access, refresh: data.refresh }
          localStorage.setItem(TOKENS_KEY, JSON.stringify(updated))
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          localStorage.removeItem(TOKENS_KEY)
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
