import { useState, useMemo, useEffect } from 'react'
import { Search, Star, Trash2, CheckCircle, XCircle, MessageSquare, Loader2 } from 'lucide-react'
import { SectionCard, Avatar } from '../../components/admin/ui'
import { adminApi, timeAgo } from '../../utils/adminApi'

const fa = n => new Intl.NumberFormat('fa-IR').format(n)

const STATUS_CFG = {
  approved: { label: 'تأیید شده',  color: 'text-emerald-700 bg-emerald-100' },
  pending:  { label: 'در انتظار',  color: 'text-amber-700  bg-amber-100'   },
  rejected: { label: 'رد شده',     color: 'text-red-700    bg-red-100'     },
}

function Stars({ n }) {
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={13}
          className={i <= n ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </span>
  )
}

export default function AdminReviewsPage() {
  const [list, setList]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [query, setQuery]         = useState('')
  const [filterStar, setStar]     = useState('all')
  const [filterStatus, setStatus] = useState('all')

  useEffect(() => {
    adminApi.getReviews()
      .then(r => setList(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => list.filter(r => {
    const qMatch  = !query || r.product_name.includes(query) || r.user_name.includes(query)
    const sMatch  = filterStar   === 'all' || r.rating === Number(filterStar)
    const stMatch = filterStatus === 'all' || r.status === filterStatus
    return qMatch && sMatch && stMatch
  }), [list, query, filterStar, filterStatus])

  const counts = {
    total:    list.length,
    pending:  list.filter(r => r.status === 'pending').length,
    approved: list.filter(r => r.status === 'approved').length,
  }

  async function approve(id) {
    try {
      await adminApi.updateReviewStatus(id, 'approved')
      setList(l => l.map(r => r.id === id ? { ...r, status: 'approved' } : r))
    } catch {}
  }

  async function reject(id) {
    try {
      await adminApi.updateReviewStatus(id, 'rejected')
      setList(l => l.map(r => r.id === id ? { ...r, status: 'rejected' } : r))
    } catch {}
  }

  async function remove(id) {
    if (!confirm('این نظر حذف شود؟')) return
    try {
      await adminApi.deleteReview(id)
      setList(l => l.filter(r => r.id !== id))
    } catch {}
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'کل نظرات',   value: counts.total,    color: 'text-gray-800'   },
          { label: 'در انتظار',  value: counts.pending,  color: 'text-amber-600'  },
          { label: 'تأیید شده',  value: counts.approved, color: 'text-emerald-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{fa(s.value)}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="جستجوی محصول یا کاربر..."
            className="w-full bg-white border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <select value={filterStar} onChange={e => setStar(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="all">همه امتیازها</option>
          {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ستاره</option>)}
        </select>
        <select value={filterStatus} onChange={e => setStatus(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="all">همه وضعیت‌ها</option>
          {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* List */}
      <SectionCard title={`نظرات (${fa(filtered.length)})`} icon={MessageSquare}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-primary-400" />
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.length === 0 && (
              <p className="py-12 text-center text-gray-400 text-sm">نظری یافت نشد</p>
            )}
            {filtered.map(r => {
              const cfg = STATUS_CFG[r.status] ?? STATUS_CFG.pending
              return (
                <div key={r.id} className="p-5 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-start gap-3">
                    <Avatar name={r.user_name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-800">{r.user_name}</span>
                        <span className="text-xs text-gray-400" dir="ltr">{r.user_email}</span>
                        <Stars n={r.rating} />
                        <span className="text-xs text-gray-400 mr-auto">{timeAgo(r.created_at)}</span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-primary-600 font-medium mb-2 truncate">{r.product_name}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>
                      <div className="flex gap-2 mt-3">
                        {r.status !== 'approved' && (
                          <button onClick={() => approve(r.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors">
                            <CheckCircle size={13} /> تأیید
                          </button>
                        )}
                        {r.status !== 'rejected' && (
                          <button onClick={() => reject(r.id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors">
                            <XCircle size={13} /> رد
                          </button>
                        )}
                        <button onClick={() => remove(r.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors mr-auto">
                          <Trash2 size={13} /> حذف
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
