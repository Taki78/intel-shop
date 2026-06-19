import { useState } from 'react'
import { ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react'
import { brands } from '../../data/brands'

const conditions = [
  { value: '', label: 'همه' },
  { value: 'new', label: 'نو' },
  { value: 'used', label: 'دست دوم' },
]

const ramOptions = ['4GB', '8GB', '16GB', '32GB']
const cpuOptions = ['Intel i3', 'Intel i5', 'Intel i7', 'AMD Ryzen 5', 'AMD Ryzen 7']

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 pb-4 mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-bold text-gray-700 mb-3 hover:text-primary-600 transition-colors"
      >
        {title}
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && children}
    </div>
  )
}

export default function FilterSidebar({ filters, setFilters, onReset }) {
  function toggle(key, value) {
    setFilters((prev) => {
      const arr = prev[key] || []
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      }
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-primary-600" />
          <h3 className="font-bold text-gray-800">فیلترها</h3>
        </div>
        <button onClick={onReset} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
          <X size={12} /> پاک کردن
        </button>
      </div>

      {/* Condition */}
      <Section title="وضعیت">
        <div className="space-y-2">
          {conditions.map((c) => (
            <label key={c.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="condition"
                value={c.value}
                checked={filters.condition === c.value}
                onChange={() => setFilters((p) => ({ ...p, condition: c.value }))}
                className="w-4 h-4 accent-primary-600"
              />
              <span className="text-sm text-gray-600 group-hover:text-primary-600 transition-colors">{c.label}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Price range */}
      <Section title="محدوده قیمت">
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="از (تومان)"
              value={filters.minPrice || ''}
              onChange={(e) => setFilters((p) => ({ ...p, minPrice: e.target.value ? Number(e.target.value) : '' }))}
              className="input text-xs py-2"
              dir="ltr"
            />
            <input
              type="number"
              placeholder="تا (تومان)"
              value={filters.maxPrice || ''}
              onChange={(e) => setFilters((p) => ({ ...p, maxPrice: e.target.value ? Number(e.target.value) : '' }))}
              className="input text-xs py-2"
              dir="ltr"
            />
          </div>
        </div>
      </Section>

      {/* Brands */}
      <Section title="برند">
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {brands.map((b) => (
            <label key={b.id} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={(filters.brands || []).includes(b.name)}
                onChange={() => toggle('brands', b.name)}
                className="w-4 h-4 accent-primary-600 rounded"
              />
              <span className="text-sm text-gray-600 group-hover:text-primary-600 transition-colors">{b.name}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* RAM */}
      <Section title="حافظه RAM" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {ramOptions.map((r) => (
            <button
              key={r}
              onClick={() => toggle('ram', r)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                (filters.ram || []).includes(r)
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-gray-200 text-gray-600 hover:border-primary-400'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </Section>

      {/* CPU */}
      <Section title="پردازنده" defaultOpen={false}>
        <div className="space-y-2">
          {cpuOptions.map((c) => (
            <label key={c} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={(filters.cpu || []).includes(c)}
                onChange={() => toggle('cpu', c)}
                className="w-4 h-4 accent-primary-600"
              />
              <span className="text-xs text-gray-600 group-hover:text-primary-600 transition-colors">{c}</span>
            </label>
          ))}
        </div>
      </Section>
    </div>
  )
}
