import { X, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { formatPrice } from '../../utils/price'
import CartItem from './CartItem'

export default function CartDrawer({ open, onClose }) {
  const { items, totalItems, discountedTotal, discount } = useCart()

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-[90]" onClick={onClose} />}
      <div
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-white shadow-2xl z-[95] flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary-600" />
            <span className="font-bold text-gray-800">سبد خرید</span>
            {totalItems > 0 && (
              <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {totalItems} کالا
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ShoppingBag size={48} className="text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">سبد خرید شما خالی است</p>
              <button onClick={onClose} className="mt-4 text-sm text-primary-600 hover:underline">
                ادامه خرید
              </button>
            </div>
          ) : (
            items.map((item) => <CartItem key={item.id} item={item} />)
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            {discount && (
              <div className="flex justify-between text-sm text-green-600">
                <span>تخفیف ({discount.label})</span>
                <span>اعمال شد</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">جمع کل:</span>
              <span className="text-primary-700 font-bold text-lg">{formatPrice(discountedTotal)}</span>
            </div>
            <Link
              to="/cart"
              onClick={onClose}
              className="btn-primary w-full justify-center"
            >
              مشاهده سبد خرید
            </Link>
            <Link
              to="/checkout"
              onClick={onClose}
              className="btn-outline w-full justify-center"
            >
              تسویه حساب
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
