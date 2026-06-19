import { createContext, useContext, useReducer, useEffect, useRef } from 'react'
import api from '../utils/api'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

function cartKey(userId) {
  return userId ? `intel-shop-cart-${userId}` : 'intel-shop-cart-guest'
}

function loadState(userId) {
  try {
    const raw = localStorage.getItem(cartKey(userId))
    return raw ? JSON.parse(raw) : { items: [], discount: null }
  } catch {
    return { items: [], discount: null }
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return action.payload
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.id === action.product.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i
          ),
        }
      }
      return { ...state, items: [...state.items, { ...action.product, qty: 1 }] }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) }
    case 'UPDATE_QTY':
      if (action.qty <= 0)
        return { ...state, items: state.items.filter((i) => i.id !== action.id) }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, qty: action.qty } : i
        ),
      }
    case 'APPLY_DISCOUNT':
      return { ...state, discount: action.discount }
    case 'CLEAR_DISCOUNT':
      return { ...state, discount: null }
    case 'CLEAR':
      return { items: [], discount: null }
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const key = cartKey(user?.id)
  const prevKey = useRef(key)

  const [state, dispatch] = useReducer(cartReducer, undefined, () => loadState(user?.id))

  // When user logs in/out, reload their cart
  useEffect(() => {
    if (key !== prevKey.current) {
      prevKey.current = key
      dispatch({ type: 'LOAD', payload: loadState(user?.id) })
    }
  }, [key, user?.id])

  // Persist to user-specific key
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state))
  }, [state, key])

  const totalItems = state.items.reduce((sum, i) => sum + i.qty, 0)

  const totalPrice = state.items.reduce((sum, i) => {
    const price = i.discount_price ?? i.price
    return sum + price * i.qty
  }, 0)

  const discountedTotal = (() => {
    if (!state.discount) return totalPrice
    if (state.discount.discount_type === 'fixed')
      return Math.max(0, totalPrice - state.discount.amount)
    return Math.round(totalPrice * (1 - state.discount.percent / 100))
  })()

  function addItem(product) {
    dispatch({ type: 'ADD_ITEM', product })
  }
  function removeItem(id) {
    dispatch({ type: 'REMOVE_ITEM', id })
  }
  function updateQty(id, qty) {
    dispatch({ type: 'UPDATE_QTY', id, qty })
  }
  async function applyDiscount(code) {
    try {
      const { data } = await api.post('/discounts/validate/', { code })
      if (!data.valid) return data
      if (data.min_order > 0 && totalPrice < data.min_order) {
        const fmt = n => new Intl.NumberFormat('fa-IR').format(n)
        return { valid: false, message: `حداقل مبلغ سفارش برای این کد ${fmt(data.min_order)} تومان است` }
      }
      const label = data.discount_type === 'fixed'
        ? `${new Intl.NumberFormat('fa-IR').format(data.amount)} تومان`
        : `${data.percent}٪`
      dispatch({ type: 'APPLY_DISCOUNT', discount: { ...data, label } })
      return data
    } catch {
      return { valid: false, message: 'خطا در بررسی کد تخفیف' }
    }
  }
  function clearDiscount() {
    dispatch({ type: 'CLEAR_DISCOUNT' })
  }
  function clearCart() {
    dispatch({ type: 'CLEAR' })
  }

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        discount: state.discount,
        totalItems,
        totalPrice,
        discountedTotal,
        addItem,
        removeItem,
        updateQty,
        applyDiscount,
        clearDiscount,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
