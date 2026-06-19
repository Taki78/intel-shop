import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useCategories } from '../../context/CategoryContext'
import { getCategoryIcon, gradientFor } from '../../utils/categoryUI'

const fa = (n) => new Intl.NumberFormat('fa-IR').format(n)

export default function CategoryGrid() {
  const { categories, loading } = useCategories()

  if (!loading && categories.length === 0) return null

  return (
    <section className="py-10">
      <div className="container-custom">
        <h2 className="section-title">دسته‌بندی‌ها</h2>
        <p className="section-subtitle">محصول مورد نظر خود را انتخاب کنید</p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-gray-100 animate-pulse min-h-[180px]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat, i) => {
              const Icon = getCategoryIcon(cat.icon)
              return (
                <Link
                  key={cat.id}
                  to={`/shop?category=${encodeURIComponent(cat.slug)}`}
                  className={`${gradientFor(i)} relative overflow-hidden text-white rounded-2xl p-6 flex flex-col justify-between min-h-[180px] group hover:-translate-y-1.5 transition-all duration-300 shadow-md hover:shadow-2xl`}
                >
                  {/* Decorative blobs */}
                  <div className="absolute -top-10 -left-10 w-36 h-36 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-500" />
                  <div className="absolute -bottom-12 -left-4 w-28 h-28 rounded-full bg-black/10" />
                  {/* Watermark icon */}
                  <Icon className="absolute -bottom-4 left-2 opacity-10 group-hover:opacity-20 group-hover:rotate-6 transition-all duration-500" size={120} />

                  <div className="relative flex justify-between items-start">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <Icon size={24} />
                    </div>
                    {cat.product_count > 0 && (
                      <span className="text-xs bg-white/20 backdrop-blur px-2.5 py-1 rounded-full font-medium">
                        {fa(cat.product_count)} محصول
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <h3 className="font-black text-xl mb-1">{cat.name}</h3>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold bg-white/15 group-hover:bg-white/25 px-3 py-1.5 rounded-lg group-hover:gap-2 transition-all">
                      مشاهده همه <ArrowLeft size={14} />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
