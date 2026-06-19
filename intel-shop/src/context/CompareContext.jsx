import { createContext, useContext, useState } from 'react'

const CompareContext = createContext(null)

export function CompareProvider({ children }) {
  const [items, setItems] = useState([])
  const [toast, setToast] = useState(null)

  function addToCompare(product) {
    if (items.find((p) => p.id === product.id)) return
    if (items.length >= 3) {
      setToast('حداکثر ۳ محصول می‌توانید مقایسه کنید')
      setTimeout(() => setToast(null), 3000)
      return
    }
    setItems((prev) => [...prev, product])
  }

  function removeFromCompare(id) {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }

  function clear() {
    setItems([])
  }

  function isComparing(id) {
    return items.some((p) => p.id === id)
  }

  return (
    <CompareContext.Provider value={{ items, toast, addToCompare, removeFromCompare, clear, isComparing }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  return useContext(CompareContext)
}
