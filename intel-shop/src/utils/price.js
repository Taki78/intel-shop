export function formatPrice(amount) {
  if (!amount && amount !== 0) return ''
  return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان'
}

export function formatPriceShort(amount) {
  if (!amount && amount !== 0) return ''
  if (amount >= 1_000_000) {
    const m = amount / 1_000_000
    return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(m) + ' میلیون تومان'
  }
  return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان'
}

export function calcDiscount(price, discountPrice) {
  if (!discountPrice || discountPrice >= price) return 0
  return Math.round(((price - discountPrice) / price) * 100)
}
