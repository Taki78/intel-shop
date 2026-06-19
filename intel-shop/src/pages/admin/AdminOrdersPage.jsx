import { useState, useMemo, useEffect } from 'react'
import { Search, Eye, X, MapPin, Phone, Mail, CreditCard, Banknote, Loader2, StickyNote, Trash2, Send } from 'lucide-react'
import { SectionCard, StatusBadge, Avatar, ORDER_STATUS } from '../../components/admin/ui'
import { formatPrice } from '../../utils/price'
import { formatJalaliDateFull } from '../../utils/jalali'
import { adminApi, timeAgo } from '../../utils/adminApi'

const fa = n => new Intl.NumberFormat('fa-IR').format(n)

function OrderModal({ orderId, onClose, onStatusChange }) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteSaving, setNoteSaving] = useState(false)

  useEffect(() => {
    adminApi.getOrder(orderId)
      .then(r => setOrder(r.data))
      .finally(() => setLoading(false))
  }, [orderId])

  async function changeStatus(newStatus) {
    setSaving(true)
    try {
      await adminApi.updateOrderStatus(orderId, newStatus)
      setOrder(o => ({ ...o, status: newStatus }))
      onStatusChange(orderId, newStatus)
    } finally {
      setSaving(false)
    }
  }

  async function submitNote(e) {
    e.preventDefault()
    if (!noteText.trim()) return
    setNoteSaving(true)
    try {
      const { data: note } = await adminApi.addOrderNote(orderId, noteText.trim())
      setOrder(o => ({ ...o, notes: [note, ...(o.notes || [])] }))
      setNoteText('')
    } finally {
      setNoteSaving(false)
    }
  }

  async function deleteNote(noteId) {
    await adminApi.deleteOrderNote(orderId, noteId)
    setOrder(o => ({ ...o, notes: o.notes.filter(n => n.id !== noteId) }))
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h2 className="font-bold text-gray-800 font-mono" dir="ltr">
              {order?.order_number ?? '...'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {order ? timeAgo(order.created_at) : ''}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-primary-400" />
          </div>
        ) : order ? (
          <div className="p-6 space-y-5">
            {/* Customer */}
            <div className="flex items-center gap-3">
              <Avatar name={order.user_name} />
              <div>
                <p className="font-semibold text-gray-800">{order.user_name}</p>
                <p className="text-xs text-gray-400">{order.shipping_city}</p>
              </div>
              <div className="mr-auto"><StatusBadge status={order.status} /></div>
            </div>

            {/* Contact */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <p className="flex items-center gap-2 text-gray-600">
                <Phone size={14} className="text-gray-400" /> {order.shipping_phone}
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                <Mail size={14} className="text-gray-400" />
                <span dir="ltr">{order.user_email}</span>
              </p>
              <p className="flex items-start gap-2 text-gray-600">
                <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                {order.shipping_province}، {order.shipping_city}، {order.shipping_detail}
              </p>
              <p className="flex items-center gap-2 text-gray-600">
                {order.payment_method === 'online'
                  ? <><CreditCard size={14} className="text-gray-400" /> پرداخت آنلاین</>
                  : <><Banknote size={14} className="text-gray-400" /> پرداخت در محل</>
                }
              </p>
            </div>

            {/* Items */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">اقلام سفارش</p>
              <div className="space-y-2">
                {order.items.map(it => (
                  <div key={it.id} className="flex items-center justify-between text-sm bg-white border border-gray-100 rounded-xl px-3 py-2.5">
                    <span className="text-gray-700 flex-1">{it.product_name}</span>
                    <span className="text-gray-400 mx-3">×{fa(it.quantity)}</span>
                    <span className="font-semibold text-gray-800 whitespace-nowrap">{formatPrice(it.product_price)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>جمع کالاها</span><span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>تخفیف</span><span>−{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>هزینه ارسال</span>
                <span>{order.delivery_fee === 0 ? 'رایگان' : formatPrice(order.delivery_fee)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-200">
                <span>مبلغ کل</span>
                <span className="text-primary-600 text-base">{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Status changer */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">تغییر وضعیت سفارش</label>
              <select
                value={order.status}
                onChange={e => changeStatus(e.target.value)}
                disabled={saving}
                className="input"
              >
                {Object.entries(ORDER_STATUS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              {saving && <p className="text-xs text-primary-500 mt-1">در حال ذخیره...</p>}
            </div>

            {/* Notes */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                <StickyNote size={15} className="text-amber-500" /> یادداشت‌های داخلی
              </p>

              {/* Add note form */}
              <form onSubmit={submitNote} className="flex gap-2 mb-3">
                <input
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="یادداشت جدید..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={noteSaving}
                />
                <button
                  type="submit"
                  disabled={!noteText.trim() || noteSaving}
                  className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-40 transition-colors"
                >
                  {noteSaving ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                </button>
              </form>

              {/* Notes list */}
              {order.notes?.length > 0 ? (
                <div className="space-y-2">
                  {order.notes.map(note => (
                    <div key={note.id} className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 text-sm">
                      <p className="text-gray-800 leading-relaxed">{note.text}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs text-gray-400">
                          {note.created_by_name} — {new Date(note.created_at).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="text-gray-300 hover:text-red-400 transition-colors"
                          title="حذف یادداشت"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-3">یادداشتی ثبت نشده</p>
              )}
            </div>
          </div>
        ) : (
          <p className="p-8 text-center text-gray-400">خطا در بارگذاری اطلاعات</p>
        )}
      </div>
    </div>
  )
}

export default function AdminOrdersPage() {
  const [list, setList]     = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery]   = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    adminApi.getOrders()
      .then(r => setList(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const counts = useMemo(() => {
    const c = { all: list.length }
    for (const k of Object.keys(ORDER_STATUS)) c[k] = list.filter(o => o.status === k).length
    return c
  }, [list])

  const filtered = useMemo(() => list.filter(o => {
    const matchQ = !query ||
      o.order_number.toLowerCase().includes(query.toLowerCase()) ||
      o.user_name.includes(query) ||
      o.user_email.toLowerCase().includes(query.toLowerCase())
    const matchF = filter === 'all' || o.status === filter
    return matchQ && matchF
  }), [list, query, filter])

  function handleStatusChange(id, newStatus) {
    setList(l => l.map(o => o.id === id ? { ...o, status: newStatus } : o))
  }

  return (
    <div className="space-y-5">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {[['all', 'همه'], ...Object.entries(ORDER_STATUS).map(([k, v]) => [k, v.label])].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`text-sm px-3.5 py-2 rounded-xl font-medium transition-colors ${
              filter === k ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
            }`}
          >
            {label}
            <span className={`text-xs mr-1 ${filter === k ? 'text-white/80' : 'text-gray-400'}`}>
              ({fa(counts[k] || 0)})
            </span>
          </button>
        ))}
      </div>

      <div className="relative max-w-xs">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="جستجوی شماره یا مشتری..."
          className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      <SectionCard>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-primary-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['شماره', 'مشتری', 'تاریخ', 'اقلام', 'وضعیت', 'مبلغ', 'عملیات'].map(h => (
                    <th key={h} className="px-5 py-3 text-right text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => {
                  const statusCfg = ORDER_STATUS[o.status] ?? ORDER_STATUS.pending
                  return (
                    <tr key={o.id} className="border-t border-gray-50 hover:bg-gray-50/60">
                      <td className="px-5 py-3 text-sm font-mono text-gray-700" dir="ltr">{o.order_number}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={o.user_name} size="sm" />
                          <span className="text-sm text-gray-800 whitespace-nowrap">{o.user_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {timeAgo(o.created_at)}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">{fa(o.items_count)} قلم</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm font-bold text-primary-600 whitespace-nowrap">{formatPrice(o.total)}</td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => setSelectedId(o.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          title="مشاهده"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && !loading && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">سفارشی یافت نشد</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {selectedId && (
        <OrderModal
          orderId={selectedId}
          onClose={() => setSelectedId(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}
