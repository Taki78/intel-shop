import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Edit, Trash2, Package, Star, Loader2 } from 'lucide-react'
import { SectionCard } from '../../components/admin/ui'
import { adminApi } from '../../utils/adminApi'
import { formatPrice } from '../../utils/price'

const fa = n => new Intl.NumberFormat('fa-IR').format(n)

export default function AdminProductsPage() {
  const navigate = useNavigate()
  const [list, setList]       = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery]     = useState('')
  const [cat, setCat]         = useState('all')

  useEffect(() => {
    adminApi.getProducts()
      .then(r => setList(Array.isArray(r.data) ? r.data : (r.data.results ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false))
    adminApi.getCategories()
      .then(r => setCategories(r.data))
      .catch(() => {})
  }, [])

  const categoryLabels = useMemo(
    () => Object.fromEntries(categories.map(c => [c.slug, c.name])),
    [categories],
  )

  const filtered = useMemo(() => list.filter(p => {
    const q = !query || p.name.includes(query) || (p.brand ?? '').toLowerCase().includes(query.toLowerCase())
    const c = cat === 'all' || p.category === cat
    return q && c
  }), [list, query, cat])

  async function handleDelete(id) {
    if (!confirm('این محصول حذف شود؟')) return
    try {
      await adminApi.deleteProduct(id)
      setList(l => l.filter(p => p.id !== id))
    } catch {}
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1 max-w-xs">
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="جستجوی محصول..."
              className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <select value={cat} onChange={e => setCat(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="all">همه دسته‌ها</option>
            {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <button onClick={() => navigate('/admin/products/new')} className="btn-primary justify-center shrink-0">
          <Plus size={17} /> افزودن محصول
        </button>
      </div>

      <SectionCard title={`لیست محصولات (${fa(filtered.length)})`} icon={Package}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-primary-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['محصول', 'دسته', 'قیمت', 'موجودی', 'امتیاز', 'عملیات'].map(h => (
                    <th key={h} className="px-5 py-3 text-right text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image || ''} alt="" className="w-11 h-11 rounded-lg object-contain bg-gray-50 p-1 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 line-clamp-1 max-w-[220px]">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                        {categoryLabels[p.category] ?? p.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      {p.discount_price ? (
                        <div>
                          <p className="text-xs text-gray-400 line-through">{formatPrice(p.price)}</p>
                          <p className="text-sm font-bold text-emerald-600">{formatPrice(p.discount_price)}</p>
                        </div>
                      ) : (
                        <p className="text-sm font-bold text-primary-600">{formatPrice(p.price)}</p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-sm font-medium ${
                        p.stock === 0 ? 'text-red-500' : p.stock <= 3 ? 'text-amber-500' : 'text-gray-600'
                      }`}>
                        {p.stock === 0 ? 'ناموجود' : `${fa(p.stock)} عدد`}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1 text-sm text-amber-500 font-bold">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        {p.rating}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                          className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors" title="ویرایش">
                          <Edit size={15} />
                        </button>
                        <button onClick={() => handleDelete(p.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="حذف">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading && (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">محصولی یافت نشد</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
