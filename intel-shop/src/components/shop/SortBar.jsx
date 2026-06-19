import { LayoutGrid, List } from 'lucide-react'

const sortOptions = [
  { value: 'default', label: 'پیش‌فرض' },
  { value: 'price-asc', label: 'ارزان‌ترین' },
  { value: 'price-desc', label: 'گران‌ترین' },
  { value: 'rating', label: 'بهترین امتیاز' },
  { value: 'newest', label: 'جدیدترین' },
]

export default function SortBar({ total, sort, setSort, view, setView }) {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 mb-5">
      <span className="text-sm text-gray-600">
        <span className="font-bold text-gray-800">{new Intl.NumberFormat('fa-IR').format(total)}</span> محصول
      </span>
      <div className="flex items-center gap-3">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <div className="flex gap-1 border border-gray-200 rounded-lg p-0.5">
          <button
            onClick={() => setView('grid')}
            className={`p-1.5 rounded transition-colors ${view === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-1.5 rounded transition-colors ${view === 'list' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
