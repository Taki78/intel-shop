import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, MapPin, CreditCard, Package, ChevronDown } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAddress } from '../context/AddressContext'
import { useAuth } from '../context/AuthContext'
import { formatPrice } from '../utils/price'
import { useProvinces } from '../utils/useProvinces'
import api from '../utils/api'

const steps = [
  { id: 1, label: 'آدرس', icon: MapPin },
  { id: 2, label: 'پرداخت', icon: CreditCard },
  { id: 3, label: 'تایید', icon: Package },
]

const EMPTY_ADDR = { name: '', phone: '', province: '', city: '', postal: '', detail: '' }

export default function CheckoutPage() {
  const [step, setStep] = useState(1)
  const [address, setAddress] = useState(EMPTY_ADDR)
  const [showSaved, setShowSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [payError, setPayError] = useState('')
  const [confirmedOrder, setConfirmedOrder] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('online')

  const { items, discountedTotal, discount, totalPrice, clearCart } = useCart()
  const { addresses, defaultAddress } = useAddress()
  const { user } = useAuth()
  const navigate = useNavigate()
  const provinces = useProvinces()

  const DELIVERY = discountedTotal >= 5000000 ? 0 : 350000

  // Auto-fill: default address takes priority, then profile phone
  useEffect(() => {
    if (defaultAddress) {
      setAddress({
        name:     defaultAddress.full_name,
        phone:    defaultAddress.phone,
        province: defaultAddress.province,
        city:     defaultAddress.city,
        postal:   defaultAddress.postal_code || '',
        detail:   defaultAddress.detail,
      })
    } else if (user?.phone) {
      setAddress(a => ({ ...a, phone: a.phone || user.phone }))
    }
  }, [defaultAddress, user?.phone])

  function fillFromAddress(addr) {
    setAddress({
      name: addr.full_name,
      phone: addr.phone,
      province: addr.province,
      city: addr.city,
      postal: addr.postal_code || '',
      detail: addr.detail,
    })
    setShowSaved(false)
  }

  function handleAddress(e) {
    e.preventDefault()
    setStep(2)
  }

  async function handlePayment(e) {
    e.preventDefault()
    setPayError('')
    setSubmitting(true)
    try {
      const { data: order } = await api.post('/orders/', {
        items:             items.map(i => ({ product_id: i.id, quantity: i.qty })),
        shipping_name:     address.name,
        shipping_phone:    address.phone,
        shipping_province: address.province,
        shipping_city:     address.city,
        shipping_postal:   address.postal || '',
        shipping_detail:   address.detail,
        discount_code:     discount?.code || '',
        payment_method:    paymentMethod,
      })

      // Cache for InvoicePage (used after payment return)
      localStorage.setItem('intel-shop-last-order', JSON.stringify({
        orderNumber:    order.order_number,
        invoiceNumber:  order.invoice_number,
        items:          order.items,
        address,
        subtotal:       order.subtotal,
        delivery:       order.delivery_fee,
        discountAmount: order.discount_amount,
        total:          order.total,
        discountCode:   discount?.code || null,
      }))

      if (paymentMethod === 'online') {
        // Redirect to payment gateway — backend handles callback & redirect back
        const { data: pay } = await api.post(`/orders/${order.id}/payment/initiate/`)
        clearCart()
        window.location.href = pay.payment_url
        return
      }

      // COD — go straight to confirmation step
      setConfirmedOrder(order)
      clearCart()
      setStep(3)
    } catch (err) {
      const d = err.response?.data
      const msg = Array.isArray(d) ? d[0]
        : d?.non_field_errors?.[0] || d?.items?.[0] || d?.detail || 'خطا در ثبت سفارش، دوباره تلاش کنید'
      setPayError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="py-8">
      <div className="container-custom max-w-3xl">
        <h1 className="text-2xl font-black text-gray-800 mb-6">تسویه حساب</h1>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className={`flex flex-col items-center ${i < steps.length - 1 ? 'flex-1' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                  step > s.id ? 'bg-green-500 text-white' : step === s.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step > s.id ? <CheckCircle size={20} /> : <s.icon size={18} />}
                </div>
                <span className={`text-xs mt-1 font-medium ${step >= s.id ? 'text-gray-700' : 'text-gray-400'}`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors ${step > s.id ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Address */}
        {step === 1 && (
          <form onSubmit={handleAddress} className="card p-6 space-y-4">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <MapPin size={18} className="text-primary-600" /> آدرس تحویل
            </h2>

            {/* Saved address selector */}
            {addresses.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSaved(!showSaved)}
                  className="w-full flex items-center justify-between px-4 py-3 border-2 border-primary-200 rounded-xl bg-primary-50 text-sm font-medium text-primary-700 hover:border-primary-400 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <MapPin size={15} />
                    انتخاب از آدرس‌های ذخیره شده ({addresses.length} آدرس)
                  </span>
                  <ChevronDown size={16} className={`transition-transform ${showSaved ? 'rotate-180' : ''}`} />
                </button>
                {showSaved && (
                  <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                    {addresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => fillFromAddress(addr)}
                        className="w-full text-right px-4 py-3 hover:bg-primary-50 border-b last:border-0 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{addr.label}</span>
                          {addr.is_default && <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">پیش‌فرض</span>}
                        </div>
                        <p className="text-sm font-medium text-gray-800 mt-0.5">{addr.full_name}</p>
                        <p className="text-xs text-gray-500">{addr.province}، {addr.city} — {addr.detail.slice(0, 40)}{addr.detail.length > 40 ? '...' : ''}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {defaultAddress && (
              <p className="text-xs text-primary-600 bg-primary-50 rounded-lg px-3 py-2">
                آدرس پیش‌فرض شما به صورت خودکار پر شده است. در صورت نیاز ویرایش کنید.
              </p>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">نام و نام خانوادگی</label>
                <input required value={address.name} onChange={(e) => setAddress((p) => ({ ...p, name: e.target.value }))} className="input" placeholder="نام کامل" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">شماره موبایل</label>
                <input required value={address.phone} onChange={(e) => setAddress((p) => ({ ...p, phone: e.target.value }))} className="input" placeholder="09..." dir="ltr" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">استان</label>
                <select required value={address.province} onChange={(e) => setAddress((p) => ({ ...p, province: e.target.value }))} className="input">
                  <option value="">انتخاب استان</option>
                  {provinces.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">شهر</label>
                <input required value={address.city} onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))} className="input" placeholder="نام شهر" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">کد پستی</label>
                <input
                  value={address.postal}
                  onChange={(e) => setAddress((p) => ({ ...p, postal: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  className="input"
                  placeholder="کد پستی ۱۰ رقمی"
                  inputMode="numeric"
                  maxLength={10}
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">آدرس کامل</label>
              <textarea required value={address.detail} onChange={(e) => setAddress((p) => ({ ...p, detail: e.target.value }))} className="input resize-none" rows={3} placeholder="خیابان، پلاک، واحد..." />
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-3">ادامه به مرحله پرداخت</button>
          </form>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <form onSubmit={handlePayment} className="space-y-4">
            <div className="card p-6">
              <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                <CreditCard size={18} className="text-primary-600" /> روش پرداخت
              </h2>
              <div className="space-y-3">
                {[
                  { id: 'online', label: 'پرداخت آنلاین', sub: 'درگاه پرداخت اینترنتی' },
                  { id: 'cod',    label: 'پرداخت در محل', sub: 'تحویل و پرداخت هنگام دریافت' },
                ].map(opt => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                      paymentMethod === opt.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.id}
                      checked={paymentMethod === opt.id}
                      onChange={() => setPaymentMethod(opt.id)}
                      className="accent-primary-600"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.sub}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-bold text-gray-800 mb-4">خلاصه سفارش</h2>
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-2 border-b last:border-0">
                  <span className="text-gray-600 line-clamp-1">{item.name} × {item.qty}</span>
                  <span className="font-medium">{formatPrice((item.discount_price ?? item.price) * item.qty)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm py-2 text-gray-600">
                <span>هزینه ارسال:</span>
                <span>{DELIVERY === 0 ? 'رایگان' : formatPrice(DELIVERY)}</span>
              </div>
              {discount && (
                <div className="flex justify-between text-sm py-2 text-green-600">
                  <span>تخفیف ({discount.code}):</span>
                  <span>-{formatPrice(totalPrice - discountedTotal)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-primary-700 text-lg pt-2">
                <span>مبلغ قابل پرداخت:</span>
                <span>{formatPrice(discountedTotal + DELIVERY)}</span>
              </div>
            </div>

            {payError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {payError}
              </div>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-ghost" disabled={submitting}>بازگشت</button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center py-3">
                {submitting ? 'در حال ثبت سفارش...' : 'پرداخت و ثبت سفارش'}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="card p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">سفارش شما ثبت شد!</h2>
            <p className="text-gray-500 mb-4">با موفقیت ثبت شد و به زودی ارسال می‌شود</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 inline-block">
              <p className="text-sm text-gray-500">کد پیگیری سفارش</p>
              <p className="text-2xl font-black text-primary-700 tracking-wider" dir="ltr">#{confirmedOrder?.order_number}</p>
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to={`/invoice/${confirmedOrder?.order_number}`} className="btn-outline">مشاهده فاکتور</Link>
              <Link to="/account" className="btn-outline">پیگیری سفارش</Link>
              <Link to="/" className="btn-primary">بازگشت به خانه</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
