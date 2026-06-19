import { useState } from 'react'
import { Heart, ShoppingCart, GitCompare, Star, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useCompare } from '../../context/CompareContext'
import { formatPrice, calcDiscount } from '../../utils/price'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const { toggle, isWished } = useWishlist()
  const { addToCompare, isComparing } = useCompare()
  const [added, setAdded] = useState(false)

  const discount = calcDiscount(product.price, product.discount_price)
  const wished = isWished(product.id)
  const comparing = isComparing(product.id)
  const soldOut = product.stock === 0

  function handleAdd() {
    if (soldOut) return
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="card group relative flex flex-col hover:shadow-xl hover:shadow-gray-200/70 hover:-translate-y-1 transition-all duration-300">
      {/* Badges */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 items-start">
        {product.condition === 'new' ? (
          <span className="badge-new shadow-sm">نو</span>
        ) : (
          <span className="badge-used shadow-sm">دست دوم</span>
        )}
        {discount > 0 && (
          <span className="badge-sale shadow-sm">{new Intl.NumberFormat('fa-IR').format(discount)}٪ تخفیف</span>
        )}
        {product.tags?.includes('پرفروش') && (
          <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">پرفروش</span>
        )}
      </div>

      {/* Wishlist button */}
      <button
        onClick={() => toggle(product)}
        aria-label="افزودن به علاقه‌مندی‌ها"
        className={`absolute top-3 left-3 z-20 w-9 h-9 flex items-center justify-center rounded-full backdrop-blur shadow-sm transition-all active:scale-90 ${
          wished
            ? 'text-red-500 bg-red-50'
            : 'text-gray-400 bg-white/80 hover:text-red-500 hover:bg-white'
        }`}
      >
        <Heart size={16} fill={wished ? 'currentColor' : 'none'} />
      </button>

      {/* Image */}
      <Link
        to={`/product/${product.slug}`}
        className="shine relative block overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className={`w-full h-52 object-contain p-4 transition-transform duration-500 group-hover:scale-110 ${soldOut ? 'opacity-50 grayscale' : ''}`}
        />
        {soldOut && (
          <span className="absolute bottom-3 right-3 bg-gray-900/80 text-white text-xs font-bold px-3 py-1 rounded-full">
            ناموجود
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[11px] text-primary-500 font-bold mb-1 uppercase tracking-wide">{product.brand}</p>

        <Link to={`/product/${product.slug}`} className="hover:text-primary-600 transition-colors">
          <h3 className="text-sm font-bold text-gray-800 mb-2 line-clamp-2 leading-snug min-h-[2.5rem]">{product.name}</h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <Star size={13} className="text-amber-400 fill-amber-400" />
          <span className="text-xs font-semibold text-gray-700">{product.rating}</span>
          <span className="text-xs text-gray-400">({product.reviews_count} نظر)</span>
        </div>

        {/* Price */}
        <div className="mt-auto">
          {product.discount_price ? (
            <div className="flex items-end justify-between gap-2">
              <div>
                <span className="text-xs text-gray-400 line-through block">{formatPrice(product.price)}</span>
                <p className="text-primary-600 font-black text-base leading-tight">{formatPrice(product.discount_price)}</p>
              </div>
            </div>
          ) : (
            <p className="text-primary-600 font-black text-base">{formatPrice(product.price)}</p>
          )}

          {!soldOut && product.stock <= 3 && (
            <p className="text-xs text-amber-500 mt-1 font-medium">فقط {product.stock} عدد مانده</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleAdd}
            disabled={soldOut}
            className={`btn-primary flex-1 text-xs py-2.5 px-3 justify-center ${added ? '!from-emerald-600 !to-emerald-500' : ''}`}
          >
            {added ? (
              <><Check size={15} /> اضافه شد</>
            ) : (
              <><ShoppingCart size={15} /> افزودن به سبد</>
            )}
          </button>
          <button
            onClick={() => addToCompare(product)}
            className={`p-2.5 rounded-xl border-2 transition-colors active:scale-95 ${
              comparing
                ? 'border-primary-600 text-primary-600 bg-primary-50'
                : 'border-gray-200 text-gray-400 hover:border-primary-400 hover:text-primary-500'
            }`}
            title="مقایسه"
            aria-label="افزودن به مقایسه"
          >
            <GitCompare size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
