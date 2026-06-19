import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../utils/price'
import CartItem from '../components/cart/CartItem'
import DiscountInput from '../components/cart/DiscountInput'
import EmptyState from '../components/common/EmptyState'

const DELIVERY_FEE = 350000
const FREE_DELIVERY_THRESHOLD = 5000000

export default function CartPage() {
  const { items, totalItems, totalPrice, discountedTotal, discount } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const delivery = discountedTotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const finalTotal = discountedTotal + delivery

  function goToCheckout() {
    if (user) {
      navigate('/checkout')
    } else {
      navigate('/login', { state: { next: '/checkout' } })
    }
  }

  if (items.length === 0) {
    return (
      <div className="py-12">
        <div className="container-custom">
          <EmptyState
            icon={ShoppingBag}
            title="سبد خرید شما خالی است"
            description="محصولات مورد نظر خود را به سبد خرید اضافه کنید"
            actionLabel="ادامه خرید"
            actionTo="/shop"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="container-custom">
        <h1 className="text-2xl font-black text-gray-800 mb-6">سبد خرید ({totalItems} کالا)</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="card p-4">
                <CartItem item={item} />
              </div>
            ))}
            <Link to="/shop" className="flex items-center gap-2 text-sm text-primary-600 font-medium hover:gap-3 transition-all">
              <ArrowRight size={16} /> ادامه خرید
            </Link>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="card p-5 space-y-4">
              <h2 className="font-bold text-gray-800 text-lg">خلاصه سفارش</h2>

              <DiscountInput />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>مجموع قیمت‌ها:</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                {discount && (
                  <div className="flex justify-between text-green-600">
                    <span>تخفیف ({discount.label}):</span>
                    <span>-{formatPrice(totalPrice - discountedTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>هزینه ارسال:</span>
                  <span className={delivery === 0 ? 'text-green-600 font-semibold' : ''}>
                    {delivery === 0 ? 'رایگان' : formatPrice(delivery)}
                  </span>
                </div>
                {delivery > 0 && (
                  <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                    برای ارسال رایگان، {formatPrice(FREE_DELIVERY_THRESHOLD - discountedTotal)} دیگر خرید کنید
                  </p>
                )}
                <div className="border-t pt-3 flex justify-between font-bold text-gray-900 text-base">
                  <span>مبلغ قابل پرداخت:</span>
                  <span className="text-primary-700 text-lg">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <button onClick={goToCheckout} className="btn-primary w-full justify-center text-base py-3">
                ادامه و پرداخت
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
