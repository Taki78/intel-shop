import { useState, useEffect, useMemo } from 'react'
import { Mail, Trash2, Download, Search, Loader2, Power, PowerOff, Inbox } from 'lucide-react'
import { adminApi, timeAgo } from '../../utils/adminApi'

export default function AdminNewsletterPage() {
  const [subs, setSubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all') // all | active | inactive

  useEffect(() => {
    adminApi.getSubscribers()
      .then(({ data }) => setSubs(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => subs.filter(s => {
    if (filter === 'active' && !s.is_active) return false
    if (filter === 'inactive' && s.is_active) return false
    if (query && !s.email.toLowerCase().includes(query.toLowerCase())) return false
    return true
  }), [subs, query, filter])

  async function toggle(sub) {
    try {
      const { data } = await adminApi.updateSubscriber(sub.id, { is_active: !sub.is_active })
      setSubs(p => p.map(s => s.id === sub.id ? data : s))
    } catch {}
  }

  async function handleDelete(sub) {
    if (!confirm(`حذف اشتراک ${sub.email}؟`)) return
    try {
      await adminApi.deleteSubscriber(sub.id)
      setSubs(p => p.filter(s => s.id !== sub.id))
    } catch {}
  }

  function exportCSV() {
    const rows = [['email', 'is_active', 'created_at'], ...filtered.map(s => [s.email, s.is_active, s.created_at])]
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-primary-500" /></div>
  }

  const activeCount = subs.filter(s => s.is_active).length

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center"><Mail size={18} className="text-primary-600" /></div>
          <div>
            <p className="text-2xl font-black text-gray-800">{subs.length.toLocaleString('fa-IR')}</p>
            <p className="text-xs text-gray-500">کل مشترکین</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><Power size={18} className="text-emerald-600" /></div>
          <div>
            <p className="text-2xl font-black text-gray-800">{activeCount.toLocaleString('fa-IR')}</p>
            <p className="text-xs text-gray-500">فعال</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"><PowerOff size={18} className="text-gray-500" /></div>
          <div>
            <p className="text-2xl font-black text-gray-800">{(subs.length - activeCount).toLocaleString('fa-IR')}</p>
            <p className="text-xs text-gray-500">غیرفعال</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1 max-w-xs">
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="جستجوی ایمیل..."
              className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" dir="ltr" />
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="all">همه</option>
            <option value="active">فعال</option>
            <option value="inactive">غیرفعال</option>
          </select>
        </div>
        <button onClick={exportCSV} disabled={filtered.length === 0} className="btn-outline gap-2 shrink-0 disabled:opacity-40">
          <Download size={15} /> خروجی CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <Inbox size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">مشترکی یافت نشد</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">ایمیل</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500">وضعیت</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 hidden sm:table-cell">عضویت</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50/60">
                  <td className="px-5 py-3 text-sm font-mono text-gray-800" dir="ltr">{s.email}</td>
                  <td className="px-5 py-3 text-center">
                    {s.is_active ? (
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">فعال</span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">غیرفعال</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500 hidden sm:table-cell">{timeAgo(s.created_at)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggle(s)}
                        className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50"
                        title={s.is_active ? 'غیرفعال' : 'فعال'}>
                        {s.is_active ? <PowerOff size={15} /> : <Power size={15} />}
                      </button>
                      <button onClick={() => handleDelete(s)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50" title="حذف">
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
    </div>
  )
}
