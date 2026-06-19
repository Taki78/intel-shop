import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, PackageSearch, Loader2 } from 'lucide-react'
import FilterSidebar from '../components/shop/FilterSidebar'
import SortBar from '../components/shop/SortBar'
import ProductCard from '../components/common/ProductCard'
import Breadcrumb from '../components/common/Breadcrumb'
import EmptyState from '../components/common/EmptyState'
import { useCategories } from '../context/CategoryContext'
import api from '../utils/api'

const PAGE_SIZE = 12

const defaultFilters = { condition: '', brands: [], minPrice: '', maxPrice: '', ram: [], cpu: [] }

export default function ShopPage() {
  const [searchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') || ''
  const initialSearch = searchParams.get('search') || ''
  const { getName } = useCategories()

  const [allProducts, setAllProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState('default')
  const [view, setView] = useState('grid')
  const [page, setPage] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    api.get('/products/')
      .then(({ data }) => setAllProducts(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => setAllProducts([]))
      .finally(() => setProductsLoading(false))
  }, [])

  useEffect(() => {
    setPage(1)
  }, [filters, sort])

  const filtered = useMemo(() => {
    let list = [...allProducts]

    if (initialCategory) list = list.filter((p) => p.category === initialCategory)
    if (initialSearch) {
      const q = initialSearch.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))
    }
    if (filters.condition) list = list.filter((p) => p.condition === filters.condition)
    if (filters.brands.length) list = list.filter((p) => filters.brands.includes(p.brand))
    if (filters.minPrice) list = list.filter((p) => (p.discount_price ?? p.price) >= Number(filters.minPrice))
    if (filters.maxPrice) list = list.filter((p) => (p.discount_price ?? p.price) <= Number(filters.maxPrice))

    if (sort === 'price-asc') list.sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price))
    else if (sort === 'price-desc') list.sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price))
    else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating)

    return list
  }, [allProducts, filters, sort, initialCategory, initialSearch])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const breadcrumb = [
    { label: 'فروشگاه', href: '/shop' },
    ...(initialCategory ? [{ label: getName(initialCategory) }] : []),
    ...(initialSearch ? [{ label: `جستجو: ${initialSearch}` }] : []),
  ]

  return (
    <div className="py-8">
      <div className="container-custom">
        <Breadcrumb items={breadcrumb} />

        <div className="flex gap-6">
          {/* Sidebar desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              onReset={() => setFilters(defaultFilters)}
            />
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-800">
                {initialSearch ? `نتایج جستجو: "${initialSearch}"` : initialCategory ? getName(initialCategory) : 'همه محصولات'}
              </h1>
              <button
                onClick={() => setFilterOpen(true)}
                className="lg:hidden btn-outline text-sm py-2"
              >
                <SlidersHorizontal size={15} /> فیلتر
              </button>
            </div>

            <SortBar
              total={filtered.length}
              sort={sort}
              setSort={setSort}
              view={view}
              setView={setView}
            />

            {productsLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 size={28} className="animate-spin text-primary-400" />
              </div>
            ) : pageItems.length === 0 ? (
              <EmptyState
                icon={PackageSearch}
                title="محصولی یافت نشد"
                description="فیلترها را تغییر دهید یا کلمه جستجو را عوض کنید"
                actionLabel="مشاهده همه محصولات"
                actionTo="/shop"
              />
            ) : (
              <div className={view === 'grid'
                ? 'grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-3'
              }>
                {pageItems.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      page === p ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-400'
                    }`}
                  >
                    {new Intl.NumberFormat('fa-IR').format(p)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-[90] flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFilterOpen(false)} />
          <div className="relative bg-white w-80 h-full overflow-y-auto p-4 shadow-2xl mr-auto">
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              onReset={() => { setFilters(defaultFilters); setFilterOpen(false) }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
