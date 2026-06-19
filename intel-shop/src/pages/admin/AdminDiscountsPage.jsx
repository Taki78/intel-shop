import { useState, useEffect } from 'react'
import { Plus, Ticket, Trash2, X, Copy, Check, Loader2 } from 'lucide-react'
import { adminApi } from '../../utils/adminApi'
import { formatPrice } from '../../utils/price'

const fa = n => new Intl.NumberFormat('fa-IR').format(n)

function DiscountModal({ onSave, onClose }) {
  const [form, setForm] = useState({
    code: '', discount_type: 'percent', percent: '', amount: '', min_order: '', max_uses: '', expires_at: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    if (!form.code.trim()) return
    setSaving(true)
    setError('')
    try {
      const payload = {
        code:          form.code.toUpperCase().trim(),
        discount_type: form.discount_type,
        percent:       form.discount_type === 'percent' ? Number(form.percent) || 0 : 0,
        amount:        form.discount_type === 'fixed'   ? Number(form.amount)  || 0 : 0,
        min_order:     Number(form.min_order) || 0,
        max_uses:      Number(form.max_uses)  || 0,
        expires_at:    form.expires_at || null,
        is_active:     true,
      }
      const { data } = await adminApi.createDiscount(payload)
      onSave(data)
    } catch (err) {
      const d = err.response?.data || {}
      setError(d.code?.[0] || d.detail || 'خطا در ایجاد کد تخفیف')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">کد تخفیف جدید</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">کد</label>
              <input value={form.code} onChange={set('code')} className="input uppercase" placeholder="SUMMER15" dir="ltr" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">نوع تخفیف</label>
              <select value={form.discount_type} onChange={set('discount_type')} className="input">
                <option value="percent">درصدی</option>
                <option value="fixed">مبلغ ثابت</option>
              </select>
            </div>
          </div>

          {form.discount_type === 'percent' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">درصد تخفیف</label>
              <input type="number" min="1" max="100" value={form.percent} onChange={set('percent')} className="input" placeholder="۱۵" required />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">مبلغ تخفیف (تومان)</label>
              <input type="number" min="1000" value={form.amount} onChange={set('amount')} className="input" placeholder="۵۰۰۰۰۰" required />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">حداقل سفارش</label>
              <input type="number" value={form.min_order} onChange={set('min_order')} className="input" placeholder="۰" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">سقف استفاده (۰ = نامحدود)</label>
              <input type="number" value={form.max_uses} onChange={set('max_uses')} className="input" placeholder="۰" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">تاریخ انقضا</label>
            <input type="datetime-local" value={form.expires_at} onChange={set('expires_at')} className="input" dir="ltr" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} ایجاد کد
            </button>
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminDiscountsPage() {
  const [list, setList]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    adminApi.getDiscounts()
      .then(r => setList(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function toggle(id, currentActive) {
    try {
      await adminApi.updateDiscount(id, { is_active: !currentActive })
      setList(l => l.map(c => c.id === id ? { ...c, is_active: !currentActive } : c))
    } catch {}
  }

  async function remove(id) {
    if (!confirm('این کد تخفیف حذف شود؟')) return
    try {
      await adminApi.deleteDiscount(id)
      setList(l => l.filter(c => c.id !== id))
    } catch {}
  }

  function copy(code) {
    navigator.clipboard?.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 1500)
  }

  function addDiscount(c) {
    setList(l => [c, ...l])
    setModal(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-primary-400" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{fa(list.length)} کد تخفیف</p>
        <button onClick={() => setModal(true)} className="btn-primary justify-center">
          <Plus size={17} /> کد جدید
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map(c => {
          const usagePct = c.max_uses > 0 ? Math.min(100, (c.used_count / c.max_uses) * 100) : 0
          const discountLabel = c.discount_type === 'percent'
            ? `${fa(c.percent)}٪`
            : formatPrice(c.amount)

          return (
            <div key={c.id} className={`relative bg-white rounded-2xl border overflow-hidden transition-all ${c.is_active ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>
              <div className={`h-1.5 ${c.is_active ? 'bg-gradient-to-l from-primary-600 to-primary-400' : 'bg-gray-300'}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.is_active ? 'bg-primary-50 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                      <Ticket size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-gray-800 font-mono" dir="ltr">{c.code}</span>
                        <button onClick={() => copy(c.code)} className="text-gray-300 hover:text-primary-600 transition-colors" title="کپی">
                          {copied === c.code ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400">{c.discount_type_display}</p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-primary-600">{discountLabel}</span>
                </div>

                {/* Usage bar (only if max_uses set) */}
                {c.max_uses > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>استفاده شده</span>
                      <span>{fa(c.used_count)} / {fa(c.max_uses)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: `${usagePct}%` }} />
                    </div>
                  </div>
                )}
                {c.max_uses === 0 && (
                  <p className="text-xs text-gray-400 mb-3">استفاده: {fa(c.used_count)} بار · نامحدود</p>
                )}

                {c.min_order > 0 && (
                  <p className="text-xs text-gray-400 mb-2">حداقل سفارش: {formatPrice(c.min_order)}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <span className="text-xs text-gray-400">
                    {c.expires_at ? `انقضا: ${new Date(c.expires_at).toLocaleDateString('fa-IR')}` : 'بدون انقضا'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => remove(c.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="حذف">
                      <Trash2 size={14} />
                    </button>
                    <button
                      onClick={() => toggle(c.id, c.is_active)}
                      className={`relative w-10 rounded-full transition-colors ${c.is_active ? 'bg-primary-600' : 'bg-gray-300'}`}
                      style={{ height: '22px' }}
                      title={c.is_active ? 'فعال' : 'غیرفعال'}
                    >
                      <span className={`absolute top-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-all ${c.is_active ? 'left-0.5' : 'right-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {list.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-400">
            <Ticket size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm">هیچ کد تخفیفی ثبت نشده</p>
          </div>
        )}
      </div>

      {modal && <DiscountModal onSave={addDiscount} onClose={() => setModal(false)} />}
    </div>
  )
}
