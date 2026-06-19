import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Printer, ArrowRight, CheckCircle, Cpu } from 'lucide-react'
import { formatPrice } from '../utils/price'
import { toPersianNum } from '../utils/jalali'
import api from '../utils/api'

export default function InvoicePage() {
  const { orderNumber } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    // 1. Try localStorage (works for just-placed orders)
    try {
      const raw = localStorage.getItem('intel-shop-last-order')
      if (raw) {
        const data = JSON.parse(raw)
        if (!orderNumber || data.orderNumber === orderNumber) {
          setOrder(data)
          return
        }
      }
    } catch { /* ignore */ }

    // 2. Fallback: fetch from API (for old orders from order history)
    api.get(`/orders/by-number/${orderNumber}/`)
      .then(({ data }) => {
        setOrder({
          orderNumber:    data.order_number,
          invoiceNumber:  data.invoice_number,
          items: data.items.map(i => ({
            name:  i.product_name,
            qty:   i.quantity,
            price: i.product_price,
          })),
          address: {
            name:     data.shipping_name,
            phone:    data.shipping_phone,
            province: data.shipping_province,
            city:     data.shipping_city,
            postal:   data.shipping_postal,
            detail:   data.shipping_detail,
          },
          subtotal:      data.subtotal,
          delivery:      data.delivery_fee,
          discountAmount: data.discount_amount,
          total:         data.total,
          discountCode:  null,
        })
      })
      .catch(() => {})
  }, [orderNumber])

  if (!order) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-500 mb-4">فاکتوری یافت نشد</p>
        <Link to="/account" className="btn-primary text-sm">سفارشات من</Link>
      </div>
    )
  }

  const now = new Date()
  const dateStr = now.toLocaleDateString('fa-IR')
  const timeStr = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="py-8">
      <div className="container-custom max-w-3xl">
        {/* Actions - hidden on print */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link to="/account" className="btn-ghost text-sm">
            <ArrowRight size={16} /> بازگشت به حساب
          </Link>
          <button onClick={() => window.print()} className="btn-primary text-sm">
            <Printer size={16} /> چاپ / ذخیره PDF
          </button>
        </div>

        {/* Invoice card */}
        <div id="invoice" className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden print:shadow-none print:border-0 print:rounded-none">
          {/* Header */}
          <div className="bg-primary-600 text-white p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Cpu size={20} />
              </div>
              <div>
                <p className="font-black text-lg">Intel Shop</p>
                <p className="text-primary-200 text-xs">اینتل شاپ — لپ‌تاپ و قطعات کامپیوتر</p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-primary-200 text-xs">فاکتور رسمی</p>
              <p className="font-bold text-lg" dir="ltr">#{order.orderNumber}</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Meta row */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 text-xs mb-1">تاریخ صدور</p>
                <p className="font-semibold text-gray-800">{dateStr}</p>
                <p className="text-gray-400 text-xs">{timeStr}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 text-xs mb-1">وضعیت پرداخت</p>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="font-semibold text-green-700 text-xs">پرداخت شده</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-500 text-xs mb-1">روش پرداخت</p>
                <p className="font-semibold text-gray-800">پرداخت آنلاین</p>
              </div>
            </div>

            {/* Customer & Shipping */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">خریدار</p>
                <p className="font-semibold text-gray-800">{order.address?.name}</p>
                <p className="text-sm text-gray-500 mt-1">{order.address?.phone}</p>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">آدرس تحویل</p>
                <p className="text-sm text-gray-700">
                  {order.address?.province}، {order.address?.city}
                </p>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{order.address?.detail}</p>
                {order.address?.postal && (
                  <p className="text-xs text-gray-400 mt-1" dir="ltr">کد پستی: {order.address.postal}</p>
                )}
              </div>
            </div>

            {/* Items table */}
            <div>
              <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">اقلام سفارش</p>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-right py-3 px-4 font-semibold text-gray-600">محصول</th>
                      <th className="text-center py-3 px-3 font-semibold text-gray-600 w-16">تعداد</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600 w-36">قیمت واحد</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600 w-36">جمع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, i) => {
                      // Support both localStorage format (name/qty/price) and API format (product_name/quantity/product_price)
                      const name  = item.name  ?? item.product_name
                      const qty   = item.qty   ?? item.quantity
                      const price = item.price ?? item.product_price
                      return (
                        <tr key={i} className="border-t border-gray-100">
                          <td className="py-3 px-4 text-gray-800">{name}</td>
                          <td className="py-3 px-3 text-center text-gray-600">{toPersianNum(qty)}</td>
                          <td className="py-3 px-4 text-gray-600" dir="ltr">{formatPrice(price)}</td>
                          <td className="py-3 px-4 font-medium text-gray-800" dir="ltr">{formatPrice(price * qty)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-full sm:w-72 space-y-2">
                <div className="flex justify-between text-sm text-gray-600 py-1">
                  <span>جمع کالاها</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 py-1 border-t border-gray-100">
                  <span>هزینه ارسال</span>
                  <span>{order.delivery === 0 ? 'رایگان' : formatPrice(order.delivery)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 py-1 border-t border-gray-100">
                    <span>تخفیف</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-primary-700 text-lg py-3 border-t-2 border-primary-200">
                  <span>مبلغ پرداخت شده</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 pt-4 text-center">
              <p className="text-xs text-gray-400">
                این فاکتور به صورت الکترونیکی صادر شده و نیازی به مهر و امضا ندارد.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Intel Shop — intelshop.ir | پشتیبانی: ۰۲۱-۱۲۳۴۵۶۷۸
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice, #invoice * { visibility: visible; }
          #invoice { position: fixed; top: 0; left: 0; width: 100%; }
        }
      `}</style>
    </div>
  )
}
