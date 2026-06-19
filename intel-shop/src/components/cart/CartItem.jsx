import { Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { formatPrice } from '../../utils/price'
import QuantityPicker from '../common/QuantityPicker'

export default function CartItem({ item }) {
  const { removeItem, updateQty } = useCart()
  const price = item.discount_price ?? item.price

  return (
    <div className="flex gap-3 p-3 bg-gray-50 rounded-xl">
      <Link to={`/product/${item.slug}`} className="shrink-0">
        <img src={item.images[0]} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/product/${item.slug}`}>
          <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug mb-1 hover:text-primary-600">
            {item.name}
          </p>
        </Link>
        <p className="text-xs text-primary-600 font-bold mb-2">{formatPrice(price)}</p>
        <div className="flex items-center justify-between">
          <QuantityPicker
            qty={item.qty}
            onInc={() => updateQty(item.id, item.qty + 1)}
            onDec={() => updateQty(item.id, item.qty - 1)}
            max={item.stock}
          />
          <button
            onClick={() => removeItem(item.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
