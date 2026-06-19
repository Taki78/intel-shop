import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight, Save, Package, Banknote, Image as ImageIcon,
  Cpu, Tag, Eye, Plus, Trash2, Check, RefreshCw, Loader2,
  ChevronDown, Palette, Grid3X3, UploadCloud,
} from 'lucide-react'
import { SectionCard } from '../../components/admin/ui'
import { adminApi } from '../../utils/adminApi'
import api from '../../utils/api'
import { formatPrice } from '../../utils/price'
import { getCategoryIcon } from '../../utils/categoryUI'

const SPEC_FIELDS = [
  { key: 'cpu',     label: 'پردازنده (CPU)',    placeholder: 'Intel Core i7-1355U / AMD Ryzen 5 7530U' },
  { key: 'ram',     label: 'حافظه رم',           placeholder: '16GB DDR4 3200MHz' },
  { key: 'storage', label: 'حافظه ذخیره‌سازی',   placeholder: '512GB NVMe SSD' },
  { key: 'gpu',     label: 'پردازنده گرافیکی',    placeholder: 'NVIDIA RTX 3050 4GB / Intel Iris Xe' },
  { key: 'display', label: 'نمایشگر',             placeholder: '15.6 اینچ FHD IPS 144Hz' },
  { key: 'os',      label: 'سیستم‌عامل',          placeholder: 'Windows 11 Home' },
  { key: 'weight',  label: 'وزن',                 placeholder: '1.85 کیلوگرم' },
  { key: 'battery', label: 'باتری',               placeholder: '56Wh / تا ۸ ساعت' },
]

const EMPTY_SPECS = { cpu: '', ram: '', storage: '', gpu: '', display: '', os: '', weight: '', battery: '' }

const EMPTY_FORM = {
  name: '', slug: '', brand: '', category: '', condition: 'new',
  warranty: '', price: '', discount_price: '', stock: '0',
  featured: false, is_active: true, tags: [],
}

function Toggle({ on, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!on)}
      className={`relative w-11 rounded-full transition-colors shrink-0 ${on ? 'bg-primary-600' : 'bg-gray-300'}`}
      style={{ height: '24px' }}>
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${on ? 'left-0.5' : 'right-0.5'}`} />
    </button>
  )
}

function Lbl({ children, required }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}{required && <span className="text-red-500 mr-1">*</span>}
    </label>
  )
}

function BrandCombobox({ value, onChange, brands, onCreateBrand }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value || '')
  const [creating, setCreating] = useState(false)
  const ref = useRef(null)

  useEffect(() => { setQuery(value || '') }, [value])

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = brands.filter(b => b.name.toLowerCase().includes(query.toLowerCase()))
  const exactMatch = brands.some(b => b.name.toLowerCase() === query.toLowerCase())

  async function selectBrand(name) {
    onChange(name)
    setQuery(name)
    setOpen(false)
  }

  async function handleCreate() {
    setCreating(true)
    try {
      const { data } = await onCreateBrand(query.trim())
      onChange(data.name)
      setQuery(data.name)
      setOpen(false)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          className="input pl-9"
          placeholder="جستجو یا نام برند را وارد کنید..."
        />
        <ChevronDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {filtered.length === 0 && !query && (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">برندی یافت نشد</div>
          )}
          {filtered.map(b => (
            <button
              key={b.id}
              type="button"
              onMouseDown={e => { e.preventDefault(); selectBrand(b.name) }}
              className={`w-full text-right px-4 py-2.5 text-sm hover:bg-primary-50 hover:text-primary-700 flex items-center justify-between transition-colors ${value === b.name ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-700'}`}
            >
              {b.name}
              {value === b.name && <Check size={15} className="text-primary-600 shrink-0" />}
            </button>
          ))}
          {query.trim() && !exactMatch && (
            <button
              type="button"
              onMouseDown={e => { e.preventDefault(); handleCreate() }}
              disabled={creating}
              className="w-full text-right px-4 py-2.5 text-sm text-primary-700 hover:bg-primary-50 flex items-center gap-2 border-t border-gray-100 font-medium transition-colors"
            >
              {creating ? <Loader2 size={14} className="animate-spin shrink-0" /> : <Plus size={14} className="shrink-0" />}
              افزودن برند جدید «{query.trim()}»
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function CategoryCards({ value, categories, onChange }) {
  if (categories.length === 0) {
    return (
      <select value={value} onChange={e => onChange(e.target.value)} className="input">
        <option value="">انتخاب دسته‌بندی...</option>
      </select>
    )
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      {categories.map(cat => {
        const Icon = getCategoryIcon(cat.icon)
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.slug)}
            className={`p-3 rounded-xl border-2 text-right transition-all flex items-center gap-2 ${
              value === cat.slug
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Icon size={18} className="shrink-0" />
            <span className="text-xs font-semibold leading-tight">{cat.name}</span>
          </button>
        )
      })}
    </div>
  )
}

function ColorRow({ color, onChange, onDelete }) {
  return (
    <div className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
      <input
        type="color"
        value={color.hex}
        onChange={e => onChange({ ...color, hex: e.target.value })}
        className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer p-0.5 shrink-0"
        style={{ backgroundColor: color.hex }}
      />
      <input
        value={color.name}
        onChange={e => onChange({ ...color, name: e.target.value })}
        className="input flex-1 text-sm py-1.5"
        placeholder="نام رنگ (مثلاً: مشکی)"
      />
      <input
        type="number"
        value={color.stock}
        onChange={e => onChange({ ...color, stock: e.target.value })}
        className="input w-20 text-sm py-1.5 text-center"
        dir="ltr"
        placeholder="موجودی"
        min="0"
      />
      <button
        type="button"
        onClick={onDelete}
        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

export default function AdminProductFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [form, setForm] = useState(EMPTY_FORM)
  const [specs, setSpecs] = useState(EMPTY_SPECS)
  const [images, setImages] = useState([])
  const [imgInput, setImgInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef(null)
  const [tagInput, setTagInput] = useState('')
  const [colors, setColors] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [brands, setBrands] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    adminApi.getBrands().then(({ data }) => setBrands(data)).catch(() => {})
    api.get('/products/categories/')
      .then(({ data }) => setCategories(Array.isArray(data) ? data : data.results || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit) return
    adminApi.getProduct(id)
      .then(({ data }) => {
        setForm({
          name:           data.name           ?? '',
          slug:           data.slug           ?? '',
          brand:          data.brand          ?? '',
          category:       data.category       ?? '',
          condition:      data.condition      ?? 'new',
          warranty:       data.warranty       ?? '',
          price:          data.price != null  ? String(data.price) : '',
          discount_price: data.discount_price ? String(data.discount_price) : '',
          stock:          String(data.stock   ?? 0),
          featured:       !!data.featured,
          is_active:      data.is_active !== false,
          tags:           data.tags           ?? [],
        })
        setSpecs({ ...EMPTY_SPECS, ...(data.specs ?? {}) })
        setImages(data.images ?? [])
        const rawColors = data.colors ?? []
        setColors(rawColors.map(c => ({ id: crypto.randomUUID(), name: c.name || '', hex: c.hex || '#3B82F6', stock: c.stock ?? 0 })))
      })
      .catch(() => navigate('/admin/products'))
      .finally(() => setLoading(false))
  }, [id, isEdit, navigate])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const setSpec = k => e => setSpecs(s => ({ ...s, [k]: e.target.value }))

  function toSlug(str) {
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
  }

  function onNameChange(e) {
    const name = e.target.value
    setForm(f => ({ ...f, name, slug: f.slug ? f.slug : toSlug(name) }))
  }

  function addImage() {
    const url = imgInput.trim()
    if (url && !images.includes(url)) { setImages(p => [...p, url]); setImgInput('') }
  }
  function removeImage(idx) { setImages(p => p.filter((_, i) => i !== idx)) }

  async function handleFileUpload(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    setUploadError('')
    try {
      for (const file of files) {
        const { data } = await adminApi.uploadImage(file)
        const url = data.absolute_url || data.url
        setImages(p => (p.includes(url) ? p : [...p, url]))
      }
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'خطا در آپلود تصویر')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }
  function moveImage(from, to) {
    setImages(p => { const a = [...p]; const [item] = a.splice(from, 1); a.splice(to, 0, item); return a })
  }

  function addTag() {
    const t = tagInput.trim()
    if (t && !form.tags.includes(t)) { setForm(f => ({ ...f, tags: [...f.tags, t] })); setTagInput('') }
  }
  function removeTag(tag) { setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) })) }

  function addColor() {
    setColors(c => [...c, { id: crypto.randomUUID(), name: '', hex: '#3B82F6', stock: 0 }])
  }
  function updateColor(id, patch) {
    setColors(c => c.map(x => x.id === id ? { ...x, ...patch } : x))
  }
  function removeColor(id) { setColors(c => c.filter(x => x.id !== id)) }

  const colorStockTotal = colors.reduce((sum, c) => sum + Number(c.stock || 0), 0)
  const hasColors = colors.length > 0

  const discountPct = form.discount_price && form.price
    ? Math.round((1 - Number(form.discount_price) / Number(form.price)) * 100) : 0

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    const payload = {
      name:           form.name,
      slug:           form.slug,
      brand:          form.brand,
      category:       form.category,
      condition:      form.condition,
      warranty:       form.warranty,
      price:          Number(form.price) || 0,
      discount_price: form.discount_price ? Number(form.discount_price) : null,
      stock:          hasColors ? colorStockTotal : (Number(form.stock) || 0),
      featured:       form.featured,
      is_active:      form.is_active,
      tags:           form.tags,
      colors:         colors.map(c => ({ name: c.name, hex: c.hex, stock: Number(c.stock || 0) })),
      images,
      specs,
    }
    try {
      if (isEdit) {
        await adminApi.updateProduct(id, payload)
      } else {
        await adminApi.createProduct(payload)
      }
      setSaved(true)
      setTimeout(() => navigate('/admin/products'), 900)
    } catch (err) {
      const d = err.response?.data || {}
      const msg = d.slug?.[0] || d.name?.[0] || d.category?.[0] || d.detail || 'خطا در ذخیره محصول'
      setSaveError(msg)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-primary-400" />
      </div>
    )
  }

  const SaveButton = ({ className = '' }) => (
    <button type="submit" disabled={saving}
      className={`btn-primary justify-center min-w-[150px] ${saved ? '!from-emerald-600 !to-emerald-500' : ''} ${className}`}>
      {saving
        ? <Loader2 size={17} className="animate-spin" />
        : saved
          ? <><Check size={17} /> ذخیره شد</>
          : <><Save size={17} /> ذخیره محصول</>}
    </button>
  )

  return (
    <form onSubmit={handleSubmit} className="pb-10">

      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap mb-6">
        <button type="button" onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-gray-500 hover:bg-white hover:shadow border border-transparent hover:border-gray-100 transition-all">
          <ArrowRight size={20} />
        </button>
        <div>
          <h1 className="font-black text-gray-800 text-xl">
            {isEdit ? 'ویرایش محصول' : 'افزودن محصول جدید'}
          </h1>
          {isEdit && <p className="text-xs text-gray-400 mt-0.5">آیدی: {id}</p>}
        </div>
        <div className="mr-auto flex flex-col items-end gap-1">
          {saveError && <p className="text-red-500 text-xs">{saveError}</p>}
          <SaveButton />
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">

          {/* اطلاعات اصلی */}
          <SectionCard title="اطلاعات اصلی" icon={Package}>
            <div className="p-5 space-y-4">
              <div>
                <Lbl required>نام محصول</Lbl>
                <input value={form.name} onChange={onNameChange} className="input"
                  placeholder="مثلاً: لنوو IdeaPad 5 — Ryzen 7 5700U / 16GB / 512GB" required />
              </div>
              <div>
                <Lbl>اسلاگ URL</Lbl>
                <div className="flex gap-2">
                  <input value={form.slug} onChange={set('slug')} className="input flex-1 font-mono text-sm" dir="ltr"
                    placeholder="lenovo-ideapad-5" required />
                  <button type="button" title="بازسازی از نام"
                    onClick={() => setForm(f => ({ ...f, slug: toSlug(f.name) }))}
                    className="p-2.5 rounded-xl bg-gray-100 text-gray-500 hover:bg-primary-50 hover:text-primary-600 transition-colors shrink-0">
                    <RefreshCw size={16} />
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  /product/<span className="text-primary-500 font-mono">{form.slug || 'slug'}</span>
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Lbl>وضعیت کالا</Lbl>
                  <div className="flex gap-3">
                    {[{ v: 'new', l: 'نو' }, { v: 'used', l: 'کارکرده' }].map(opt => (
                      <label key={opt.v}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 cursor-pointer transition-all text-sm font-semibold ${
                          form.condition === opt.v
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}>
                        <input type="radio" name="condition" value={opt.v}
                          checked={form.condition === opt.v}
                          onChange={set('condition')} className="sr-only" />
                        {opt.l}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Lbl>گارانتی</Lbl>
                  <input value={form.warranty} onChange={set('warranty')} className="input"
                    placeholder="مثلاً: ۱۸ ماه گارانتی آواتک" />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* قیمت و موجودی */}
          <SectionCard title="قیمت و موجودی" icon={Banknote}>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Lbl required>قیمت اصلی (تومان)</Lbl>
                <input type="number" value={form.price} onChange={set('price')}
                  className="input" dir="ltr" placeholder="38500000" min="0" required />
                {form.price && (
                  <p className="text-xs text-gray-500 mt-1">{formatPrice(Number(form.price))}</p>
                )}
              </div>
              <div>
                <Lbl>قیمت با تخفیف (اختیاری)</Lbl>
                <input type="number" value={form.discount_price} onChange={set('discount_price')}
                  className="input" dir="ltr" placeholder="بدون تخفیف" min="0" />
                {form.discount_price && (
                  <p className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1 flex-wrap">
                    {formatPrice(Number(form.discount_price))}
                    {discountPct > 0 && (
                      <span className="bg-emerald-100 px-1.5 py-0.5 rounded-full text-[10px]">٪{discountPct} تخفیف</span>
                    )}
                  </p>
                )}
              </div>
              <div>
                <Lbl required>موجودی انبار (عدد)</Lbl>
                <input type="number" value={hasColors ? colorStockTotal : form.stock}
                  onChange={hasColors ? undefined : set('stock')}
                  readOnly={hasColors}
                  className={`input ${hasColors ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                  dir="ltr" placeholder="10" min="0" required />
                {hasColors && (
                  <p className="text-[11px] text-primary-500 mt-1">جمع موجودی از رنگ‌بندی</p>
                )}
                {!hasColors && Number(form.stock) === 0 && (
                  <p className="text-xs text-red-500 mt-1">محصول به صورت ناموجود نمایش داده می‌شود</p>
                )}
                {!hasColors && Number(form.stock) > 0 && Number(form.stock) <= 3 && (
                  <p className="text-xs text-amber-500 mt-1">موجودی کم — هشدار داده می‌شود</p>
                )}
              </div>
            </div>
          </SectionCard>

          {/* تصاویر */}
          <SectionCard title="تصاویر و گالری" icon={ImageIcon}>
            <div className="p-5 space-y-4">
              {/* Upload from device */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full border-2 border-dashed border-primary-200 hover:border-primary-400 bg-primary-50/40 hover:bg-primary-50 rounded-2xl p-6 flex flex-col items-center gap-2 text-primary-600 transition-colors disabled:opacity-60"
              >
                {uploading ? <Loader2 size={26} className="animate-spin" /> : <UploadCloud size={26} />}
                <span className="text-sm font-semibold">
                  {uploading ? 'در حال آپلود...' : 'آپلود تصویر از سیستم'}
                </span>
                <span className="text-xs text-gray-400">JPG، PNG، WEBP یا GIF — حداکثر ۵ مگابایت — چند تصویر همزمان</span>
              </button>
              {uploadError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{uploadError}</p>}

              {/* Or add by URL */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">یا افزودن با لینک</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="flex gap-2">
                <input value={imgInput} onChange={e => setImgInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage() } }}
                  className="input flex-1" dir="ltr"
                  placeholder="آدرس URL تصویر را وارد کنید و Enter بزنید..." />
                <button type="button" onClick={addImage}
                  className="btn-outline shrink-0 justify-center px-4 whitespace-nowrap">
                  <Plus size={16} /> افزودن
                </button>
              </div>
              {images.length > 0 ? (
                <>
                  <p className="text-xs text-gray-400">تصویر اول به عنوان تصویر اصلی محصول است.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((url, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                        <div className="aspect-square">
                          <img src={url} alt="" className="w-full h-full object-contain p-2"
                            onError={e => { e.currentTarget.style.opacity = '0.3' }} />
                        </div>
                        {i === 0 && (
                          <span className="absolute top-1.5 right-1.5 bg-primary-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10">اصلی</span>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-1">
                            {i > 0 && (
                              <button type="button" onClick={() => moveImage(i, i - 1)}
                                className="w-6 h-6 bg-white/90 text-gray-700 rounded-full text-base font-bold hover:bg-white flex items-center justify-center leading-none">›</button>
                            )}
                            {i < images.length - 1 && (
                              <button type="button" onClick={() => moveImage(i, i + 1)}
                                className="w-6 h-6 bg-white/90 text-gray-700 rounded-full text-base font-bold hover:bg-white flex items-center justify-center leading-none">‹</button>
                            )}
                          </div>
                          <button type="button" onClick={() => removeImage(i)}
                            className="w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center">
                  <ImageIcon size={36} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-500 font-medium">هنوز تصویری اضافه نشده است</p>
                  <p className="text-xs text-gray-400 mt-1">از دکمه بالا تصویر آپلود کنید یا لینک وارد کنید</p>
                </div>
              )}
            </div>
          </SectionCard>

          {/* مشخصات فنی */}
          <SectionCard title="مشخصات فنی لپ‌تاپ" icon={Cpu}>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SPEC_FIELDS.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <Lbl>{label}</Lbl>
                  <input value={specs[key]} onChange={setSpec(key)} className="input" placeholder={placeholder} />
                </div>
              ))}
            </div>
          </SectionCard>

        </div>

        {/* Sidebar column */}
        <div className="lg:col-span-1 space-y-5 lg:sticky lg:top-6">

          {/* نمایش و وضعیت */}
          <SectionCard title="نمایش و وضعیت" icon={Eye}>
            <div className="p-4 divide-y divide-gray-50">
              <div className="flex items-center justify-between py-3.5">
                <div>
                  <p className="text-sm font-medium text-gray-800">محصول ویژه</p>
                  <p className="text-xs text-gray-400 mt-0.5">نمایش در بنر و بخش «ویژه‌ها»</p>
                </div>
                <Toggle on={form.featured} onChange={v => setForm(f => ({ ...f, featured: v }))} />
              </div>
              <div className="flex items-center justify-between py-3.5">
                <div>
                  <p className="text-sm font-medium text-gray-800">فعال در فروشگاه</p>
                  <p className="text-xs text-gray-400 mt-0.5">غیرفعال: محصول مخفی می‌شود</p>
                </div>
                <Toggle on={form.is_active} onChange={v => setForm(f => ({ ...f, is_active: v }))} />
              </div>
            </div>
          </SectionCard>

          {/* دسته‌بندی و برند */}
          <SectionCard title="دسته‌بندی و برند" icon={Grid3X3}>
            <div className="p-4 space-y-4">
              <div>
                <Lbl>برند</Lbl>
                <BrandCombobox
                  value={form.brand}
                  onChange={name => setForm(f => ({ ...f, brand: name }))}
                  brands={brands}
                  onCreateBrand={name => adminApi.createBrand(name)}
                />
              </div>
              <div>
                <Lbl>دسته‌بندی</Lbl>
                <CategoryCards
                  value={form.category}
                  categories={categories}
                  onChange={slug => setForm(f => ({ ...f, category: slug }))}
                />
              </div>
            </div>
          </SectionCard>

          {/* برچسب‌ها */}
          <SectionCard title="برچسب‌ها" icon={Tag}>
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                  className="input flex-1 text-sm" placeholder="برچسب + Enter" />
                <button type="button" onClick={addTag}
                  className="p-2.5 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors shrink-0">
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2.5 bg-gray-50 rounded-xl">
                {form.tags.length === 0 && (
                  <p className="text-xs text-gray-400 self-center">هنوز برچسبی اضافه نشده</p>
                )}
                {form.tags.map(t => (
                  <span key={t}
                    className="inline-flex items-center gap-1 bg-primary-100 text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {t}
                    <button type="button" onClick={() => removeTag(t)}
                      className="text-primary-400 hover:text-red-500 transition-colors leading-none text-sm">×</button>
                  </span>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* رنگ‌بندی */}
          <SectionCard title="رنگ‌بندی" icon={Palette}>
            <div className="p-4 space-y-1">
              {colors.length > 0 && (
                <div className="flex items-center gap-2 px-1 pb-1">
                  <span className="text-xs text-gray-400 w-8 text-center">رنگ</span>
                  <span className="text-xs text-gray-400 flex-1">نام</span>
                  <span className="text-xs text-gray-400 w-20 text-center">موجودی</span>
                  <span className="w-8" />
                </div>
              )}
              {colors.map(c => (
                <ColorRow
                  key={c.id}
                  color={c}
                  onChange={patch => updateColor(c.id, patch)}
                  onDelete={() => removeColor(c.id)}
                />
              ))}
              {colors.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">هنوز رنگی اضافه نشده</p>
              )}
              <button type="button" onClick={addColor}
                className="w-full mt-2 py-2 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-1.5">
                <Plus size={15} /> افزودن رنگ
              </button>
              {hasColors && (
                <p className="text-xs text-gray-500 text-center pt-1">
                  جمع موجودی: <span className="font-bold text-gray-700">{colorStockTotal}</span> عدد
                </p>
              )}
            </div>
          </SectionCard>

        </div>
      </div>

      {/* Bottom save bar */}
      <div className="flex items-center gap-3 pt-6 mt-2 border-t border-gray-100">
        {saveError && <p className="text-red-500 text-sm">{saveError}</p>}
        <SaveButton />
        <button type="button" onClick={() => navigate(-1)}
          className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm">
          انصراف
        </button>
      </div>

    </form>
  )
}
