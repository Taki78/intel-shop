import { useState, useEffect, useMemo } from 'react'
import { MessageSquare, Trash2, Search, Loader2, Inbox, Reply, Archive, Mail, X } from 'lucide-react'
import { adminApi, timeAgo } from '../../utils/adminApi'

const STATUS_META = {
  new:      { label: 'جدید',         color: 'bg-amber-100 text-amber-800' },
  read:     { label: 'خوانده‌شده',    color: 'bg-blue-100 text-blue-800' },
  replied:  { label: 'پاسخ داده‌شده', color: 'bg-emerald-100 text-emerald-700' },
  archived: { label: 'بایگانی',       color: 'bg-gray-100 text-gray-600' },
}

function MessageDetail({ message, onClose, onStatus, onDelete }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
              <MessageSquare size={18} className="text-primary-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-800 truncate">{message.subject}</h3>
              <p className="text-xs text-gray-500">از {message.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">ایمیل فرستنده</p>
              <a href={`mailto:${message.email}`} className="font-mono text-primary-600 hover:underline" dir="ltr">{message.email}</a>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">زمان ارسال</p>
              <p className="text-gray-700">{timeAgo(message.created_at)}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1.5">متن پیام</p>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{message.message}</div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs text-gray-500">وضعیت:</span>
            <select value={message.status} onChange={e => onStatus(message.id, e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              {Object.entries(STATUS_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
            </select>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-2 justify-between sticky bottom-0 bg-white">
          <button onClick={() => onDelete(message)} className="btn-ghost gap-2 !text-red-600 hover:!bg-red-50">
            <Trash2 size={15} /> حذف
          </button>
          <a href={`mailto:${message.email}?subject=${encodeURIComponent('پاسخ: ' + message.subject)}`}
            onClick={() => onStatus(message.id, 'replied')}
            className="btn-primary gap-2">
            <Reply size={15} /> پاسخ ایمیلی
          </a>
        </div>
      </div>
    </div>
  )
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    adminApi.getMessages()
      .then(({ data }) => setMessages(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => messages.filter(m => {
    if (filter !== 'all' && m.status !== filter) return false
    if (query) {
      const q = query.toLowerCase()
      return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q)
    }
    return true
  }), [messages, query, filter])

  async function openMessage(msg) {
    setOpen(msg)
    if (msg.status === 'new') {
      try {
        const { data } = await adminApi.getMessage(msg.id)
        setMessages(p => p.map(m => m.id === msg.id ? data : m))
        setOpen(data)
      } catch {}
    }
  }

  async function changeStatus(id, status) {
    try {
      const { data } = await adminApi.updateMessageStatus(id, status)
      setMessages(p => p.map(m => m.id === id ? data : m))
      setOpen(curr => curr?.id === id ? data : curr)
    } catch {}
  }

  async function handleDelete(msg) {
    if (!confirm(`حذف پیام «${msg.subject}»؟`)) return
    try {
      await adminApi.deleteMessage(msg.id)
      setMessages(p => p.filter(m => m.id !== msg.id))
      setOpen(null)
    } catch {}
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-primary-500" /></div>
  }

  const newCount = messages.filter(m => m.status === 'new').length

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center"><Mail size={18} className="text-primary-600" /></div>
          <div>
            <p className="text-2xl font-black text-gray-800">{messages.length.toLocaleString('fa-IR')}</p>
            <p className="text-xs text-gray-500">کل پیام‌ها</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center"><Inbox size={18} className="text-amber-600" /></div>
          <div>
            <p className="text-2xl font-black text-gray-800">{newCount.toLocaleString('fa-IR')}</p>
            <p className="text-xs text-gray-500">جدید</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><Reply size={18} className="text-emerald-600" /></div>
          <div>
            <p className="text-2xl font-black text-gray-800">{messages.filter(m => m.status === 'replied').length.toLocaleString('fa-IR')}</p>
            <p className="text-xs text-gray-500">پاسخ داده شده</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"><Archive size={18} className="text-gray-500" /></div>
          <div>
            <p className="text-2xl font-black text-gray-800">{messages.filter(m => m.status === 'archived').length.toLocaleString('fa-IR')}</p>
            <p className="text-xs text-gray-500">بایگانی</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="جستجو در نام، ایمیل، موضوع..."
            className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="all">همه وضعیت‌ها</option>
          {Object.entries(STATUS_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <Inbox size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">پیامی یافت نشد</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">فرستنده</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">موضوع</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500">وضعیت</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">زمان</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const meta = STATUS_META[m.status] || STATUS_META.new
                return (
                  <tr key={m.id} onClick={() => openMessage(m)}
                    className={`border-t border-gray-50 hover:bg-gray-50/60 cursor-pointer ${m.status === 'new' ? 'font-semibold' : ''}`}>
                    <td className="px-5 py-3">
                      <p className="text-sm text-gray-800">{m.name}</p>
                      <p className="text-xs text-gray-400 font-mono" dir="ltr">{m.email}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700 max-w-[260px] truncate">{m.subject}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${meta.color}`}>{meta.label}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500 hidden sm:table-cell">{timeAgo(m.created_at)}</td>
                    <td className="px-5 py-3">
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(m) }}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <MessageDetail
          message={open}
          onClose={() => setOpen(null)}
          onStatus={changeStatus}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
