import { Link } from 'react-router-dom'
import { Home, SearchX } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <SearchX size={40} className="text-primary-500" />
        </div>
        <h1 className="text-6xl font-black text-primary-600 mb-3">۴۰۴</h1>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">صفحه یافت نشد</h2>
        <p className="text-gray-400 text-sm mb-8">صفحه‌ای که دنبالش می‌گردید وجود ندارد یا حذف شده</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary">
            <Home size={16} /> بازگشت به خانه
          </Link>
          <Link to="/shop" className="btn-outline">مشاهده فروشگاه</Link>
        </div>
      </div>
    </div>
  )
}
