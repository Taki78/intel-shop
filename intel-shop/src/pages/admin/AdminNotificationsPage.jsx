import { useState, useMemo, useEffect } from 'react'
import {
  Bell, ShoppingBag, User, AlertTriangle, Star,
  CreditCard, X, CheckCheck, Trash2, Loader2,
} from 'lucide-react'
import { adminApi, timeAgo } from '../../utils/adminApi'

const TYPE_CFG = {
  order:        { icon: ShoppingBag,   color: 'text-blue-600 bg-blue-50',       label: 'سفارش'     },
  order_cancel: { icon: X,             color: 'text-red-600 bg-red-50',         label: 'لغو سفارش' },
  user:         { icon: User,          color: 'text-emerald-600 bg-emerald-50', label: 'کاربر'     },
  stock:        { icon: AlertTriangle, color: 'text-amber-600 bg-amber-50',     label: 'موجودی'    },
  review:       { icon: Star,          color: 'text-violet-600 bg-violet-50',   label: 'نظر'       },
  payment:      { icon: CreditCard,    color: 'text-teal-600 bg-teal-50',       label: 'پرداخت'    },
}

const FILTER_TABS = [
  { key: 'all',          label: 'همه'       },
  { key: 'order',        label: 'سفارش'     },
  { key: 'user',         label: 'کاربر'     },
  { key: 'stock',        label: 'موجودی'    },
  { key: 'review',       label: 'نظرات'     },
  { key: 'order_cancel', label: 'لغو شده'  },
]

const fa = n => new Intl.NumberFormat('fa-IR').format(n)

const DISMISSED_KEY = 'admin_notif_dismissed'
const READ_KEY      = 'admin_notif_read'

function getDismissed() { try { return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]')) } catch { return new Set() } }
function getReadIds()   { try { return new Set(JSON.parse(localStorage.getItem(READ_KEY)      || '[]')) } catch { return new Set() } }
function saveDismissed(s) { localStorage.setItem(DISMISSED_KEY, JSON.stringify([...s])) }
function saveReadIds(s)   { localStorage.setItem(READ_KEY,      JSON.stringify([...s])) }

export default function AdminNotificationsPage() {
  const [items, setItems]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('all')
  const [showUnread, setShowUnread] = useState(false)

  useEffect(() => {
    const dismissed = getDismissed()
    const readIds   = getReadIds()
    adminApi.getNotifications()
      .then(r => {
        const all = r.data
          .filter(n => !dismissed.has(n.id))
          .map(n => ({ ...n, read: n.read || readIds.has(n.id) }))
        setItems(all)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const unread = items.filter(n => !n.read).length

  const filtered = useMemo(() => items.filter(n => {
    const typeMatch   = filter === 'all' || n.type === filter
    const unreadMatch = !showUnread || !n.read
    return typeMatch && unreadMatch
  }), [items, filter, showUnread])

  function markRead(id) {
    const s = getReadIds(); s.add(id); saveReadIds(s)
    setItems(ns => ns.map(n => n.id === id ? { ...n, read: true } : n))
  }

  function dismiss(id) {
    const s = getDismissed(); s.add(id); saveDismissed(s)
    setItems(ns => ns.filter(n => n.id !== id))
  }

  function markAllRead() {
    const s = getReadIds(); items.forEach(n => s.add(n.id)); saveReadIds(s)
    setItems(ns => ns.map(n => ({ ...n, read: true })))
  }

  function clearAll() {
    if (!confirm('همه اعلان‌ها پاک شوند؟')) return
    const s = getDismissed(); items.forEach(n => s.add(n.id)); saveDismissed(s)
    setItems([])
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-black text-gray-800 text-xl">مرکز اعلان‌ها</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {fa(items.length)} اعلان
            {unread > 0 && (
              <span className="mr-1.5 text-primary-600 font-semibold">
                ({fa(unread)} خوانده نشده)
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {unread > 0 && (
            <button onClick={markAllRead}
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors">
              <CheckCheck size={15} /> خواندن همه
            </button>
          )}
          {items.length > 0 && (
            <button onClick={clearAll}
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
              <Trash2 size={15} /> پاک کردن همه
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map(t => {
          const count = t.key === 'all' ? items.length : items.filter(n => n.type === t.key).length
          return (
            <button key={t.key} onClick={() => setFilter(t.key)}
              className={`text-sm px-3.5 py-2 rounded-xl font-medium transition-colors ${
                filter === t.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
              }`}>
              {t.label}
              <span className={`mr-1.5 text-xs ${filter === t.key ? 'text-white/80' : 'text-gray-400'}`}>
                ({fa(count)})
              </span>
            </button>
          )
        })}
        <button onClick={() => setShowUnread(v => !v)}
          className={`text-sm px-3.5 py-2 rounded-xl font-medium transition-colors border ${
            showUnread
              ? 'bg-rose-600 text-white border-rose-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
          }`}>
          فقط خوانده نشده
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-primary-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-300">
            <Bell size={44} className="mb-3" />
            <p className="text-sm font-medium text-gray-400">اعلانی برای نمایش وجود ندارد</p>
          </div>
        ) : (
          filtered.map(n => {
            const cfg  = TYPE_CFG[n.type] ?? TYPE_CFG.order
            const Icon = cfg.icon
            return (
              <div key={n.id}
                role="button"
                tabIndex={0}
                onClick={() => markRead(n.id)}
                onKeyDown={e => e.key === 'Enter' && markRead(n.id)}
                className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors group ${
                  !n.read ? 'bg-primary-50/40 hover:bg-primary-50' : 'hover:bg-gray-50'
                }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                    {n.text}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-xs text-gray-400">{timeAgo(n.time)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    {!n.read && <span className="text-xs text-primary-600 font-semibold">جدید</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!n.read && <span className="w-2.5 h-2.5 rounded-full bg-primary-500 shrink-0" />}
                  <button
                    onClick={e => { e.stopPropagation(); dismiss(n.id) }}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label="حذف">
                    <X size={14} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
