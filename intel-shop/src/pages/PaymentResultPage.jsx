import { useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, AlertCircle, RotateCcw } from 'lucide-react'

export default function PaymentResultPage() {
  const [params] = useSearchParams()
  const payStatus = params.get('status')   // ok | cancelled | failed | error
  const orderNum  = params.get('order')
  const refId     = params.get('ref')

  const isOk        = payStatus === 'ok'
  const isCancelled = payStatus === 'cancelled'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-16 px-4">
      <div className="card max-w-md w-full p-10 text-center">

        {isOk ? (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={42} className="text-green-500" />
            </div>
            <h1 className="text-2xl font-black text-gray-800 mb-2">پرداخت موفق</h1>
            <p className="text-gray-500 mb-6">سفارش شما با موفقیت ثبت و تأیید شد.</p>

            <div className="bg-gray-50 rounded-xl p-4 mb-2 space-y-2 text-sm">
              {orderNum && (
                <div className="flex justify-between">
                  <span className="text-gray-500">کد سفارش:</span>
                  <span className="font-bold text-primary-700" dir="ltr">{orderNum}</span>
                </div>
              )}
              {refId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">شماره پیگیری:</span>
                  <span className="font-bold text-gray-700" dir="ltr">{refId}</span>
                </div>
              )}
            </div>
          </>
        ) : isCancelled ? (
          <>
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <RotateCcw size={38} className="text-amber-500" />
            </div>
            <h1 className="text-2xl font-black text-gray-800 mb-2">پرداخت لغو شد</h1>
            <p className="text-gray-500 mb-6">شما پرداخت را لغو کردید. سفارش شما ثبت شده و منتظر پرداخت است.</p>
            {orderNum && (
              <div className="bg-gray-50 rounded-xl p-4 mb-2 text-sm flex justify-between">
                <span className="text-gray-500">کد سفارش:</span>
                <span className="font-bold text-primary-700" dir="ltr">{orderNum}</span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle size={42} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-gray-800 mb-2">پرداخت ناموفق</h1>
            <p className="text-gray-500 mb-6">
              متأسفانه پرداخت تأیید نشد. مبلغی از حساب شما کسر نشده است.
            </p>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
          {isOk ? (
            <>
              {orderNum && (
                <Link to={`/invoice/${orderNum}`} className="btn-outline">مشاهده فاکتور</Link>
              )}
              <Link to="/account" className="btn-outline">پیگیری سفارشات</Link>
              <Link to="/" className="btn-primary">بازگشت به خانه</Link>
            </>
          ) : (
            <>
              {orderNum && (
                <Link to="/checkout" className="btn-primary">تلاش مجدد</Link>
              )}
              <Link to="/" className="btn-ghost">بازگشت به خانه</Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
