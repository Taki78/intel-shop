import { useState, useEffect } from 'react'
import api from './api'

let _cache = null

export default function useShopSettings() {
  const [s, setS] = useState(_cache)
  useEffect(() => {
    if (_cache) return
    api.get('/admin/settings/').then(r => { _cache = r.data; setS(r.data) }).catch(() => {})
  }, [])
  return s
}
