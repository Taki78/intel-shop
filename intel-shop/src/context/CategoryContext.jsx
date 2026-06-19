import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import api from '../utils/api'

const CategoryContext = createContext({
  categories: [],
  loading: true,
  error: false,
  getName: (slug) => slug,
  refresh: () => {},
})

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const refresh = useCallback(() => {
    setLoading(true)
    api.get('/products/categories/')
      .then(({ data }) => {
        setCategories(Array.isArray(data) ? data : (data.results ?? []))
        setError(false)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { refresh() }, [refresh])

  // slug → name lookup for breadcrumbs/titles
  const nameBySlug = useMemo(() => {
    const map = {}
    for (const c of categories) map[c.slug] = c.name
    return map
  }, [categories])

  const getName = useCallback((slug) => nameBySlug[slug] || slug, [nameBySlug])

  const value = useMemo(
    () => ({ categories, loading, error, getName, refresh }),
    [categories, loading, error, getName, refresh],
  )

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>
}

export function useCategories() {
  return useContext(CategoryContext)
}
