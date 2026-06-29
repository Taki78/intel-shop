import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { GitCompare, X, Loader2 } from 'lucide-react'
import { useCompare } from '../context/CompareContext'
import { formatPrice } from '../utils/price'
import StarRating from '../components/common/StarRating'
import EmptyState from '../components/common/EmptyState'
import api from '../utils/api'

const specLabels = {
  cpu: 'پردازنده',
  ram: 'حافظه رم',
  storage: 'حافظه ذخیره‌ساز',
  gpu: 'کارت گرافیک',
  display: 'صفحه‌نمایش',
  os: 'سیستم‌عامل',
  weight: 'وزن',
  battery: 'باتری',
}

export default function ComparePage() {
  const { items, removeFromCompare, clear } = useCompare()
  const [fullItems, setFullItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (items.length === 0) { setFullItems([]); return }
    setLoading(true)
    Promise.all(items.map(p => api.get(`/products/${p.slug}/`).then(r => r.data)))
      .then(setFullItems)
      .catch(() => setFullItems(items))
      .finally(() => setLoading(false))
  }, [items])

  if (items.length === 0) {
    return (
      <div className="py-12">
        <div className="container-custom">
          <EmptyState
            icon={GitCompare}
            title="هیچ محصولی برای مقایسه ندارید"
            description="از صفحه محصولات، محصولات مورد نظر را برای مقایسه انتخاب کنید"
            actionLabel="رفتن به فروشگاه"
            actionTo="/shop"
          />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 size={32} className="animate-spin text-primary-600" />
      </div>
    )
  }

  const allSpecKeys = [...new Set(
    fullItems.flatMap(p =>
      Object.entries(p.specs || {})
        .filter(([, v]) => v && String(v).trim())
        .map(([k]) => k)
    )
  )].filter(k => specLabels[k])

  return (
    <div className="py-8">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-gray-800">مقایسه محصولات</h1>
          <button onClick={clear} className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1">
            <X size={14} /> پاک کردن همه
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-2xl shadow-sm overflow-hidden">
            <thead>
              <tr>
                <th className="text-right px-5 py-4 text-sm text-gray-500 font-medium bg-gray-50 w-40">ویژگی</th>
                {fullItems.map((p) => (
                  <th key={p.id} className="px-5 py-4 bg-gray-50 min-w-[200px]">
                    <div className="flex flex-col items-center gap-2">
                      <img src={p.images?.[0]} alt={p.name} className="w-24 h-20 object-contain rounded-xl" />
                      <Link to={`/product/${p.slug}`} className="text-sm font-bold text-gray-800 text-center hover:text-primary-600 line-clamp-2">
                        {p.name}
                      </Link>
                      <button onClick={() => removeFromCompare(p.id)} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                        <X size={11} /> حذف
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Price */}
              <tr className="border-t border-gray-100">
                <td className="px-5 py-3 text-sm text-gray-500 font-medium">قیمت</td>
                {fullItems.map((p) => (
                  <td key={p.id} className="px-5 py-3 text-center">
                    {p.discount_price ? (
                      <div>
                        <span className="text-xs text-gray-400 line-through block">{formatPrice(p.price)}</span>
                        <span className="text-primary-700 font-bold text-sm">{formatPrice(p.discount_price)}</span>
                      </div>
                    ) : (
                      <span className="text-primary-700 font-bold text-sm">{formatPrice(p.price)}</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Rating */}
              <tr className="border-t border-gray-100 bg-gray-50">
                <td className="px-5 py-3 text-sm text-gray-500 font-medium">امتیاز</td>
                {fullItems.map((p) => (
                  <td key={p.id} className="px-5 py-3">
                    <div className="flex justify-center items-center gap-1">
                      <StarRating rating={p.rating} size={14} />
                      <span className="text-xs text-gray-500">({p.reviews_count})</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Condition */}
              <tr className="border-t border-gray-100">
                <td className="px-5 py-3 text-sm text-gray-500 font-medium">وضعیت</td>
                {fullItems.map((p) => (
                  <td key={p.id} className="px-5 py-3 text-center text-sm">
                    {p.condition === 'new' ? (
                      <span className="badge-new">نو</span>
                    ) : (
                      <span className="badge-used">دست دوم</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Warranty */}
              <tr className="border-t border-gray-100 bg-gray-50">
                <td className="px-5 py-3 text-sm text-gray-500 font-medium">گارانتی</td>
                {fullItems.map((p) => (
                  <td key={p.id} className="px-5 py-3 text-center text-sm text-gray-700">{p.warranty || '-'}</td>
                ))}
              </tr>

              {/* Stock */}
              <tr className="border-t border-gray-100">
                <td className="px-5 py-3 text-sm text-gray-500 font-medium">موجودی</td>
                {fullItems.map((p) => (
                  <td key={p.id} className="px-5 py-3 text-center text-sm">
                    {p.stock === 0
                      ? <span className="text-red-500 font-medium">ناموجود</span>
                      : <span className="text-green-600 font-medium">موجود</span>}
                  </td>
                ))}
              </tr>

              {/* Specs */}
              {allSpecKeys.length > 0 && (
                <tr className="border-t-2 border-gray-200">
                  <td colSpan={fullItems.length + 1} className="px-5 py-2 bg-primary-50 text-xs font-bold text-primary-700 uppercase tracking-wide">
                    مشخصات فنی
                  </td>
                </tr>
              )}
              {allSpecKeys.map((key, i) => (
                <tr key={key} className={`border-t border-gray-100 ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                  <td className="px-5 py-3 text-sm text-gray-500 font-medium">{specLabels[key] || key}</td>
                  {fullItems.map((p) => (
                    <td key={p.id} className="px-5 py-3 text-center text-sm text-gray-700">
                      {p.specs?.[key] || <span className="text-gray-300">—</span>}
                    </td>
                  ))}
                </tr>
              ))}

              {/* CTA */}
              <tr className="border-t border-gray-100">
                <td className="px-5 py-4"></td>
                {fullItems.map((p) => (
                  <td key={p.id} className="px-5 py-4 text-center">
                    <Link to={`/product/${p.slug}`} className="btn-primary text-sm py-2 justify-center w-full">
                      مشاهده محصول
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
