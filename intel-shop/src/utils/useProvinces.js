import { useState, useEffect } from 'react'
import api from './api'

// Module-level cache — fetched once per page load
let _cache = null

export function useProvinces() {
  const [provinces, set] = useState(_cache ?? [])

  useEffect(() => {
    if (_cache) return
    api.get('/provinces/')
      .then(({ data }) => { _cache = data; set(data) })
      .catch(() => {})
  }, [])

  return provinces
}
