import { useState, useMemo, useEffect } from 'react'
import {
  Search, Mail, Phone, Users, Edit, X, UserPlus,
  ShoppingBag, Wallet, Check, Shield, ShieldOff, Trash2, Loader2,
} from 'lucide-react'
import { SectionCard, Avatar, StatusBadge } from '../../components/admin/ui'
import { formatPrice } from '../../utils/price'
import { formatJalaliDateFull } from '../../utils/jalali'
import { adminApi } from '../../utils/adminApi'

const fa = n => new Intl.NumberFormat('fa-IR').format(n)

function CustomerModal({ customer, isNew, onSave, onDelete, onClose }) {
  const [tab, setTab]   = useState('info')
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    name:      customer?.name      ?? '',
    email:     customer?.email     ?? '',
    phone:     customer?.phone     ?? '',
    password:  '',
    is_active: customer?.is_active ?? true,
  })

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    if (!isNew && tab === 'orders' && customer?.id) {
      setOrdersLoading(true)
      adminApi.getOrders({ user_id: customer.id })
        .then(r => setOrders(r.data))
        .catch(() => {})
        .finally(() => setOrdersLoading(false))
    }
  }, [tab, isNew, customer?.id])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      if (isNew) {
        const { data } = await adminApi.createUser({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          is_active: form.is_active,
        })
        onSave({ ...data, _new: true })
      } else {
        const { data } = await adminApi.updateUser(customer.id, {
          name: form.name, phone: form.phone, is_active: form.is_active,
        })
        onSave({ ...customer, ...data })
      }
    } catch (err) {
      const e = err.response?.data || {}
      const msg = e.email?.[0] || e.password?.[0] || e.name?.[0] || e.detail || 'خطا در ذخیره اطلاعات'
      setFormError(msg)
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('این مشتری حذف شود؟')) return
    try {
      await adminApi.deleteUser(customer.id)
      onDelete(customer.id)
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            {!isNew && <Avatar name={customer.name} />}
            <div>
              <h2 className="font-bold text-gray-800">
                {isNew ? 'افزودن مشتری جدید' : customer.name}
              </h2>
              {!isNew && <p className="text-xs text-gray-400" dir="ltr">{customer.email}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={20} />
          </button>
        </div>

        {!isNew && (
          <div className="flex border-b border-gray-100 px-6 shrink-0">
            {[{ k: 'info', label: 'اطلاعات' }, { k: 'orders', label: 'سفارشات' }].map(t => (
              <button key={t.k} onClick={() => setTab(t.k)}
                className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  tab === t.k ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div className="overflow-y-auto flex-1">
          {(isNew || tab === 'info') && (
            <form id="customer-form" onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">نام کامل <span className="text-red-500">*</span></label>
                  <input value={form.name} onChange={set('name')} className="input" required placeholder="علی محمدی" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    ایمیل {isNew && <span className="text-red-500">*</span>}
                  </label>
                  {isNew ? (
                    <input value={form.email} onChange={set('email')} className="input" required type="email" placeholder="example@email.com" dir="ltr" />
                  ) : (
                    <input value={customer.email} className="input bg-gray-50 text-gray-400 cursor-not-allowed" readOnly dir="ltr" />
                  )}
                </div>
                {isNew && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">رمز عبور <span className="text-red-500">*</span></label>
                    <input value={form.password} onChange={set('password')} className="input" required type="password" placeholder="حداقل ۶ کاراکتر" dir="ltr" minLength={6} />
                  </div>
                )}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">شماره موبایل</label>
                  <input value={form.phone} onChange={set('phone')} className="input" placeholder="۰۹۱۲۳۴۵۶۷۸۹" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">وضعیت حساب</label>
                  <div className="flex gap-3">
                    {[
                      { v: true,  label: 'فعال',      icon: Shield,    color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                      { v: false, label: 'غیرفعال',   icon: ShieldOff, color: 'text-gray-600 bg-gray-50 border-gray-200' },
                    ].map(opt => (
                      <button key={String(opt.v)} type="button"
                        onClick={() => setForm(f => ({ ...f, is_active: opt.v }))}
                        className={`flex items-center gap-2 flex-1 justify-center py-2.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                          form.is_active === opt.v ? opt.color + ' ring-2 ring-offset-1 ring-current' : 'border-gray-100 text-gray-400 hover:border-gray-200'
                        }`}>
                        <opt.icon size={15} /> {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {!isNew && (
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                  {[
                    { label: 'تاریخ عضویت', value: formatJalaliDateFull(customer.created_at) },
                    { label: 'سفارشات',     value: `${fa(customer.orders_count)} سفارش` },
                    { label: 'مجموع خرید',  value: formatPrice(customer.total_spent) },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-[11px] text-gray-400">{s.label}</p>
                      <p className="text-sm font-bold text-gray-800 mt-0.5 truncate">{s.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </form>
          )}

          {!isNew && tab === 'orders' && (
            <div className="divide-y divide-gray-50">
              {ordersLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={24} className="animate-spin text-primary-400" />
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <ShoppingBag size={36} className="mx-auto mb-2 text-gray-200" />
                  <p className="text-sm">این مشتری هنوز سفارشی ثبت نکرده است</p>
                </div>
              ) : (
                orders.map(o => (
                  <div key={o.id} className="px-6 py-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-mono font-semibold text-gray-800" dir="ltr">{o.order_number}</span>
                        <StatusBadge status={o.status} />
                      </div>
                      <p className="text-xs text-gray-400">{fa(o.items_count)} قلم</p>
                    </div>
                    <span className="text-sm font-bold text-primary-600 whitespace-nowrap">{formatPrice(o.total)}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="px-6 pt-3 border-t border-gray-100 shrink-0">
          {formError && (
            <p className="text-red-500 text-sm mb-3 text-center">{formError}</p>
          )}
        </div>
        <div className="flex items-center gap-3 px-6 pb-4 shrink-0">
          <button form="customer-form" type="submit" disabled={saving}
            className="btn-primary justify-center flex-1">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {isNew ? 'افزودن مشتری' : 'ذخیره تغییرات'}
          </button>
          {!isNew && (
            <button type="button" onClick={handleDelete}
              className="p-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="حذف مشتری">
              <Trash2 size={17} />
            </button>
          )}
          <button type="button" onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            انصراف
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminCustomersPage() {
  const [list, setList]     = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery]   = useState('')
  const [modal, setModal]   = useState(null)

  useEffect(() => {
    adminApi.getUsers()
      .then(r => setList(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => list.filter(c =>
    !query ||
    c.name.includes(query) ||
    c.email.toLowerCase().includes(query.toLowerCase()) ||
    (c.phone || '').includes(query)
  ), [list, query])

  const totalSpent  = list.reduce((s, c) => s + (c.total_spent || 0), 0)
  const activeCount = list.filter(c => c.is_active).length

  function handleSave(data) {
    if (data._new) {
      const { _new, ...userData } = data
      setList(l => [userData, ...l])
    } else {
      setList(l => l.map(c => c.id === data.id ? { ...c, ...data } : c))
    }
    setModal(null)
  }

  function handleDelete(id) {
    setList(l => l.filter(c => c.id !== id))
    setModal(null)
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">کل مشتریان</p>
          <p className="text-2xl font-black text-gray-900">{fa(list.length)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-1">مشتریان فعال</p>
          <p className="text-2xl font-black text-emerald-600">{fa(activeCount)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 col-span-2 lg:col-span-1">
          <p className="text-sm text-gray-500 mb-1">مجموع خرید</p>
          <p className="text-2xl font-black text-primary-600">{formatPrice(totalSpent)}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="relative max-w-xs flex-1">
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="جستجوی مشتری..."
            className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <button onClick={() => setModal('new')} className="btn-primary justify-center shrink-0">
          <UserPlus size={17} /> افزودن مشتری
        </button>
      </div>

      {/* Table */}
      <SectionCard title={`لیست مشتریان (${fa(filtered.length)})`} icon={Users}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-primary-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['مشتری', 'تماس', 'عضویت', 'سفارشات', 'مجموع خرید', 'وضعیت', 'عملیات'].map(h => (
                    <th key={h} className="px-5 py-3 text-right text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50/60 cursor-pointer"
                    onClick={() => setModal(c)}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} />
                        <span className="text-sm font-medium text-gray-800 whitespace-nowrap">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="text-xs text-gray-500 space-y-1">
                        <p className="flex items-center gap-1.5"><Mail size={12} /><span dir="ltr">{c.email}</span></p>
                        {c.phone && <p className="flex items-center gap-1.5"><Phone size={12} />{c.phone}</p>}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {formatJalaliDateFull(c.created_at)}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700 font-medium">{fa(c.orders_count)}</td>
                    <td className="px-5 py-3 text-sm font-bold text-primary-600 whitespace-nowrap">{formatPrice(c.total_spent)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        c.is_active ? 'text-emerald-700 bg-emerald-100' : 'text-gray-500 bg-gray-100'
                      }`}>
                        {c.is_active ? 'فعال' : 'غیرفعال'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={e => { e.stopPropagation(); setModal(c) }}
                        className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors" title="ویرایش">
                        <Edit size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">مشتری یافت نشد</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {modal && (
        <CustomerModal
          customer={modal === 'new' ? null : modal}
          isNew={modal === 'new'}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
