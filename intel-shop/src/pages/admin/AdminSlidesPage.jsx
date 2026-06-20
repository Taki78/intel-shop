import { useState, useEffect, useRef } from 'react'
import {
  Plus, Pencil, Trash2, X, Loader2, Image as ImageIcon,
  UploadCloud, GripVertical, Eye, EyeOff, ArrowUp, ArrowDown,
} from 'lucide-react'
import { adminApi } from '../../utils/adminApi'

const GRADIENTS = [
  { value: 'primary', label: 'آبی پررنگ',  swatch: 'from-primary-900 to-primary-600' },
  { value: 'amber',   label: 'کهربایی',    swatch: 'from-amber-900 to-amber-500' },
  { value: 'violet',  label: 'بنفش',       swatch: 'from-violet-950 to-violet-600' },
  { value: 'emerald', label: 'سبز زمردی',  swatch: 'from-emerald-900 to-emerald-600' },
  { value: 'rose',    label: 'صورتی',      swatch: 'from-rose-900 to-rose-500' },
]

const EMPTY = {
  title: '', subtitle: '', badge: '', offer: '',
  cta_label: '', cta_link: '', image: '',
  gradient: 'primary', chips: [], order: 0, is_active: true,
}

function SlideModal({ initial, onSave, onClose }) {
  const isEdit = !!initial?.id
  const [form, setForm] = useState(initial || EMPTY)
  const [chipInput, setChipInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setError('')
    try {
      const { data } = await adminApi.uploadImage(file)
      setForm(f => ({ ...f, image: data.absolute_url || data.url }))
    } catch (err) {
      setError(err.response?.data?.detail || 'خطا در آپلود تصویر')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function addChip() {
    const v = chipInput.trim()
    if (v && !form.chips.includes(v)) {
      setForm(f => ({ ...f, chips: [...f.chips, v] })); setChipInput('')
    }
  }
  function removeChip(c) { setForm(f => ({ ...f, chips: f.chips.filter(x => x !== c) })) }

  async function submit(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true); setError('')
    try {
      const payload = { ...form, order: Number(form.order) || 0 }
      const { data } = isEdit
        ? await adminApi.updateSlide(initial.id, payload)
        : await adminApi.createSlide(payload)
      onSave(data, isEdit)
    } catch (err) {
      const d = err.response?.data || {}
      setError(d.title?.[0] || d.detail || 'خطا در ذخیره اسلاید')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-gray-800">{isEdit ? 'ویرایش اسلاید' : 'اسلاید جدید'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">تصویر اسلاید</label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
            {form.image ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                <img src={form.image} alt="" className="w-full h-44 object-contain bg-gray-100" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 flex justify-between">
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="bg-white/95 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white flex items-center gap-1">
                    {uploading ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
                    تغییر
                  </button>
                  <button type="button" onClick={() => setForm(f => ({ ...f, image: '' }))}
                    className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600">
                    حذف
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="w-full border-2 border-dashed border-primary-200 hover:border-primary-400 bg-primary-50/40 rounded-xl p-6 flex flex-col items-center gap-2 text-primary-600 transition-colors disabled:opacity-60">
                {uploading ? <Loader2 size={24} className="animate-spin" /> : <UploadCloud size={24} />}
                <span className="text-sm font-semibold">{uploading ? 'در حال آپلود...' : 'آپلود تصویر اسلاید'}</span>
                <span className="text-xs text-gray-400">JPG, PNG, WEBP — حداکثر ۵MB</span>
              </button>
            )}
          </div>

          {/* Title + subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">عنوان <span className="text-red-500">*</span></label>
              <input value={form.title} onChange={set('title')} className="input" placeholder="بهترین لپ‌تاپ‌های نو" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">برچسب بالا</label>
              <input value={form.badge} onChange={set('badge')} className="input" placeholder="جدیدترین مدل‌ها" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">زیرعنوان</label>
            <input value={form.subtitle} onChange={set('subtitle')} className="input" placeholder="با گارانتی اصل و قیمت رقابتی" />
          </div>

          {/* CTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">متن دکمه</label>
              <input value={form.cta_label} onChange={set('cta_label')} className="input" placeholder="مشاهده لپ‌تاپ نو" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">لینک دکمه</label>
              <input value={form.cta_link} onChange={set('cta_link')} className="input font-mono text-sm" placeholder="/shop?category=laptop-new" dir="ltr" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">برچسب پیشنهاد</label>
            <input value={form.offer} onChange={set('offer')} className="input" placeholder="تا ۱۸ ماه گارانتی" />
          </div>

          {/* Gradient picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">پالت رنگی</label>
            <div className="grid grid-cols-5 gap-2">
              {GRADIENTS.map(g => (
                <button key={g.value} type="button" onClick={() => setForm(f => ({ ...f, gradient: g.value }))}
                  className={`relative h-14 rounded-xl bg-gradient-to-l ${g.swatch} ring-2 transition-all ${
                    form.gradient === g.value ? 'ring-primary-500 scale-105' : 'ring-transparent hover:ring-gray-200'
                  }`}>
                  <span className="absolute inset-x-0 bottom-1 text-[10px] text-white font-bold drop-shadow">{g.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chips */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">چیپس‌ها (مزیت‌ها)</label>
            <div className="flex gap-2 mb-2">
              <input value={chipInput} onChange={e => setChipInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChip() } }}
                className="input flex-1" placeholder="مثلاً: گارانتی اصالت" />
              <button type="button" onClick={addChip} className="btn-outline shrink-0 px-4"><Plus size={15} /></button>
            </div>
            {form.chips.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.chips.map(c => (
                  <span key={c} className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 text-xs px-2.5 py-1 rounded-lg">
                    {c}
                    <button type="button" onClick={() => removeChip(c)}><X size={12} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Order + active */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ترتیب</label>
              <input type="number" value={form.order} onChange={set('order')} className="input" min="0" dir="ltr" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                  className="w-4 h-4 accent-primary-600" />
                <span className="text-sm text-gray-700">نمایش در سایت</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">انصراف</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <Loader2 size={16} className="animate-spin" /> : isEdit ? 'ذخیره تغییرات' : 'افزودن اسلاید'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminSlidesPage() {
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    adminApi.getSlides()
      .then(({ data }) => setSlides(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleSaved(data, isEdit) {
    setSlides(p => isEdit ? p.map(s => s.id === data.id ? data : s) : [...p, data])
    setModal(null)
  }

  async function toggleActive(slide) {
    try {
      const { data } = await adminApi.updateSlide(slide.id, { is_active: !slide.is_active })
      setSlides(p => p.map(s => s.id === slide.id ? data : s))
    } catch {}
  }

  async function moveSlide(slide, dir) {
    const newOrder = (slide.order || 0) + dir
    try {
      const { data } = await adminApi.updateSlide(slide.id, { order: newOrder })
      setSlides(p => [...p.map(s => s.id === slide.id ? data : s)].sort((a, b) => a.order - b.order))
    } catch {}
  }

  async function handleDelete() {
    try {
      await adminApi.deleteSlide(deleting.id)
      setSlides(p => p.filter(s => s.id !== deleting.id))
      setDeleting(null)
    } catch {}
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-primary-500" /></div>
  }

  const sorted = [...slides].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{slides.length} اسلاید · {slides.filter(s => s.is_active).length} فعال</p>
        <button onClick={() => setModal('create')} className="btn-primary gap-2">
          <Plus size={16} /> اسلاید جدید
        </button>
      </div>

      {slides.length === 0 ? (
        <div className="card p-16 text-center">
          <ImageIcon size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">هیچ اسلایدی وجود ندارد</p>
          <p className="text-sm text-gray-400 mt-1">اولین اسلاید بنر را اضافه کنید</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sorted.map((s, i) => {
            const g = GRADIENTS.find(x => x.value === s.gradient) || GRADIENTS[0]
            return (
              <div key={s.id} className={`relative rounded-2xl overflow-hidden bg-gradient-to-l ${g.swatch} text-white shadow-md ${!s.is_active ? 'opacity-60' : ''}`}>
                <div className="p-5 flex items-start gap-4">
                  <GripVertical size={18} className="text-white/40 mt-1 shrink-0" />
                  {s.image && (
                    <img src={s.image} alt="" className="w-20 h-20 object-contain bg-white/10 rounded-xl p-1 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    {s.badge && <span className="inline-block text-[10px] bg-white/20 px-2 py-0.5 rounded-full mb-1">{s.badge}</span>}
                    <h3 className="font-black text-base leading-tight truncate">{s.title}</h3>
                    {s.subtitle && <p className="text-white/80 text-xs mt-1 line-clamp-2">{s.subtitle}</p>}
                    {s.chips?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {s.chips.slice(0, 3).map(c => <span key={c} className="text-[10px] bg-white/15 px-2 py-0.5 rounded">{c}</span>)}
                      </div>
                    )}
                  </div>
                </div>
                {/* Actions */}
                <div className="bg-black/30 backdrop-blur px-4 py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <button onClick={() => moveSlide(s, -1)} disabled={i === 0}
                      className="p-1.5 rounded hover:bg-white/15 disabled:opacity-30" title="بالا"><ArrowUp size={13} /></button>
                    <button onClick={() => moveSlide(s, 1)} disabled={i === sorted.length - 1}
                      className="p-1.5 rounded hover:bg-white/15 disabled:opacity-30" title="پایین"><ArrowDown size={13} /></button>
                    <span className="text-white/60 mr-1">ترتیب: {s.order}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleActive(s)} className="p-1.5 rounded hover:bg-white/15" title={s.is_active ? 'مخفی' : 'نمایش'}>
                      {s.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
                    </button>
                    <button onClick={() => setModal(s)} className="p-1.5 rounded hover:bg-white/15" title="ویرایش"><Pencil size={13} /></button>
                    <button onClick={() => setDeleting(s)} className="p-1.5 rounded hover:bg-red-500/40" title="حذف"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <SlideModal
          initial={modal === 'create' ? null : modal}
          onSave={handleSaved}
          onClose={() => setModal(null)}
        />
      )}

      {deleting && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleting(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">حذف اسلاید</h3>
            <p className="text-sm text-gray-500 mb-4">آیا از حذف «{deleting.title}» مطمئنید؟</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleting(null)} className="btn-ghost flex-1 justify-center">انصراف</button>
              <button onClick={handleDelete} className="flex-1 btn-primary !from-red-600 !to-red-500 justify-center">حذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
