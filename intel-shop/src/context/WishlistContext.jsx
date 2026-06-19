import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'

const WishlistContext = createContext(null)

function wishKey(userId) {
  return userId ? `intel-shop-wishlist-${userId}` : 'intel-shop-wishlist-guest'
}

function loadItems(userId) {
  try {
    const raw = localStorage.getItem(wishKey(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const key = wishKey(user?.id)
  const prevKey = useRef(key)

  const [items, setItems] = useState(() => loadItems(user?.id))

  // When user logs in/out, reload their wishlist
  useEffect(() => {
    if (key !== prevKey.current) {
      prevKey.current = key
      setItems(loadItems(user?.id))
    }
  }, [key, user?.id])

  // Persist to user-specific key
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(items))
  }, [items, key])

  function toggle(product) {
    setItems((prev) =>
      prev.find((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    )
  }

  function isWished(id) {
    return items.some((p) => p.id === id)
  }

  return (
    <WishlistContext.Provider value={{ items, toggle, isWished }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  return useContext(WishlistContext)
}
