import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Loader2, FolderOpen, Package } from 'lucide-react'
import { adminApi } from '../../utils/adminApi'
import { CATEGORY_ICON_OPTIONS, getCategoryIcon } from '../../utils/categoryUI'

const EMPTY = { name: '', slug: '', icon: '', order: 0 }

function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9؀-ۿ-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function CategoryModal({ initial, onSave, onClose }) {
  const isEdit = !!initial?.id
  const [form, setForm] = useState(initial || EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [slugTouched, setSlugTouched] = useState(isEdit)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  function onNameChange(e) {
    const name = e.target.value
    setForm(f => ({ ...f, name, slug: slugTouched ? f.slug : toSlug(name) }))
  }

  async function submit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.slug.trim()) return
    setSaving(true)
    setError('')
    try {
      const payload = {
        name:  form.name.trim(),
        slug:  form.slug.trim(),
        icon:  form.icon.trim(),
        order: Number(form.order) || 0,
      }
      const { data } = isEdit
        ? await adminApi.updateCategory(initial.id, payload)
        : await adminApi.createCategory(payload)
      onSave(data, isEdit)
    } catch (err) {
      const d = err.response?.data || {}
      setError(d.slug?.[0] || d.name?.[0] || d.detail || 'خطا در ذخیره دسته‌بندی')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">
            {isEdit ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">نام دسته‌بندی <span className="text-red-500">*</span></label>
            <input
              value={form.name}
              onChange={onNameChange}
              className="input"
              placeholder="مثلاً: لپ‌تاپ نو"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">آیکون</label>
            <div className="grid grid-cols-8 gap-1.5">
              {CATEGORY_ICON_OPTIONS.map((name) => {
                const Icon = getCategoryIcon(name)
                const active = form.icon === name
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, icon: active ? '' : name }))}
                    title={name}
                    className={`aspect-square flex items-center justify-center rounded-lg border transition-colors ${
                      active
                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                        : 'border-gray-200 text-gray-400 hover:border-primary-300 hover:text-primary-500'
                    }`}
                  >
                    <Icon size={18} />
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-gray-400 mt-1">یک آیکون انتخاب کنید (اختیاری)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">اسلاگ (URL) <span className="text-red-500">*</span></label>
            <input
              value={form.slug}
              onChange={e => { setSlugTouched(true); set('slug')(e) }}
              className="input font-mono text-sm"
              placeholder="laptop-new"
              dir="ltr"
              required
            />
            <p className="text-xs text-gray-400 mt-1">فقط حروف انگلیسی، اعداد و خط‌تیره</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ترتیب نمایش</label>
            <input
              type="number"
              value={form.order}
              onChange={set('order')}
              className="input w-28"
              min="0"
              dir="ltr"
            />
            <p className="text-xs text-gray-400 mt-1">عدد کمتر = نمایش اول</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">انصراف</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <Loader2 size={16} className="animate-spin" /> : isEdit ? 'ذخیره تغییرات' : 'افزودن دسته‌بندی'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirm({ category, onConfirm, onClose, loading }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-600" />
        </div>
        <h3 className="font-bold text-gray-800 mb-1">حذف دسته‌بندی</h3>
        <p className="text-sm text-gray-500 mb-1">
          آیا از حذف <span className="font-semibold text-gray-700">«{category.name}»</span> مطمئنید؟
        </p>
        {category.product_count > 0 && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">
            این دسته‌بندی دارای {category.product_count} محصول است. محصولات بدون دسته‌بندی می‌مانند.
          </p>
        )}
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="btn-ghost flex-1 justify-center">انصراف</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 btn-primary !from-red-600 !to-red-500 justify-center">
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'حذف'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | category-object (for edit)
  const [deleting, setDeleting] = useState(null) // category to delete
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    adminApi.getCategories()
      .then(({ data }) => setCats(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleSaved(data, isEdit) {
    setCats(prev => isEdit
      ? prev.map(c => c.id === data.id ? data : c)
      : [...prev, data].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
    )
    setModal(null)
  }

  async function handleDelete() {
    setDeleteLoading(true)
    try {
      await adminApi.deleteCategory(deleting.id)
      setCats(prev => prev.filter(c => c.id !== deleting.id))
      setDeleting(null)
    } catch {
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{cats.length} دسته‌بندی</p>
        </div>
        <button onClick={() => setModal('create')} className="btn-primary gap-2">
          <Plus size={16} /> دسته‌بندی جدید
        </button>
      </div>

      {/* Empty state */}
      {cats.length === 0 ? (
        <div className="card p-16 text-center">
          <FolderOpen size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">هیچ دسته‌بندی‌ای وجود ندارد</p>
          <p className="text-sm text-gray-400 mt-1">اولین دسته‌بندی را اضافه کنید</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">دسته‌بندی</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">اسلاگ</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">محصولات</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">ترتیب</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {cats.map(cat => (
                <tr key={cat.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-500 shrink-0">
                        {(() => {
                          const Icon = cat.icon ? getCategoryIcon(cat.icon) : FolderOpen
                          return <Icon size={18} className={cat.icon ? '' : 'text-primary-400'} />
                        })()}
                      </div>
                      <span className="font-semibold text-gray-800">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{cat.slug}</span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                      <Package size={14} className="text-gray-400" />
                      {cat.product_count}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                    <span className="text-sm text-gray-500">{cat.order}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setModal(cat)}
                        className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        title="ویرایش"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleting(cat)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {modal && (
        <CategoryModal
          initial={modal === 'create' ? null : modal}
          onSave={handleSaved}
          onClose={() => setModal(null)}
        />
      )}
      {deleting && (
        <DeleteConfirm
          category={deleting}
          onConfirm={handleDelete}
          onClose={() => setDeleting(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}
