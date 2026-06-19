import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell, X, ShoppingBag, User, AlertTriangle, Star, CreditCard, CheckCheck, Trash2,
} from 'lucide-react'
import { adminApi, timeAgo } from '../../utils/adminApi'

const DISMISSED_KEY = 'admin_notif_dismissed'
const READ_KEY      = 'admin_notif_read'
const getDismissed = () => { try { return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]')) } catch { return new Set() } }
const getReadIds   = () => { try { return new Set(JSON.parse(localStorage.getItem(READ_KEY)      || '[]')) } catch { return new Set() } }
const saveDismissed = s => localStorage.setItem(DISMISSED_KEY, JSON.stringify([...s]))
const saveReadIds   = s => localStorage.setItem(READ_KEY,      JSON.stringify([...s]))

const TYPE_CONFIG = {
  order:        { icon: ShoppingBag,    color: 'text-blue-600 bg-blue-50'       },
  order_cancel: { icon: X,              color: 'text-red-600 bg-red-50'         },
  user:         { icon: User,           color: 'text-emerald-600 bg-emerald-50' },
  stock:        { icon: AlertTriangle,  color: 'text-amber-600 bg-amber-50'     },
  review:       { icon: Star,           color: 'text-violet-600 bg-violet-50'   },
  payment:      { icon: CreditCard,     color: 'text-teal-600 bg-teal-50'       },
}

const fa = n => new Intl.NumberFormat('fa-IR').format(n)

export default function NotificationPanel() {
  const [open, setOpen]     = useState(false)
  const [items, setItems]   = useState([])
  const [loaded, setLoaded] = useState(false)
  const wrapRef = useRef(null)

  const unread = items.filter(n => !n.read).length

  useEffect(() => {
    adminApi.getNotifications()
      .then(r => {
        const dismissed = getDismissed()
        const readIds   = getReadIds()
        const filtered  = r.data
          .filter(n => !dismissed.has(n.id))
          .map(n => ({ ...n, read: n.read || readIds.has(n.id) }))
        setItems(filtered.slice(0, 8))
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  useEffect(() => {
    if (!open) return
    function onDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const markAllRead = () => {
    const ids = new Set([...getReadIds(), ...items.map(n => n.id)])
    saveReadIds(ids)
    setItems(ns => ns.map(n => ({ ...n, read: true })))
  }
  const markRead = id => {
    const ids = new Set([...getReadIds(), id])
    saveReadIds(ids)
    setItems(ns => ns.map(n => n.id === id ? { ...n, read: true } : n))
  }
  const dismiss = id => {
    const dis = getDismissed(); dis.add(id); saveDismissed(dis)
    const ids = new Set([...getReadIds(), id]); saveReadIds(ids)
    setItems(ns => ns.filter(n => n.id !== id))
  }
  const clearAll = () => {
    const dis = getDismissed()
    const ids = getReadIds()
    items.forEach(n => { dis.add(n.id); ids.add(n.id) })
    saveDismissed(dis)
    saveReadIds(ids)
    setItems([])
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`relative p-2 rounded-lg transition-colors ${
          open ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-100'
        }`}
        aria-label="اعلان‌ها"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-white leading-none px-0.5">
            {unread > 9 ? '۹+' : fa(unread)}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-fade-in-down">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-800 text-sm">اعلان‌ها</h3>
              {unread > 0 && (
                <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {fa(unread)} جدید
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button onClick={markAllRead}
                  className="text-xs text-primary-600 hover:text-primary-700 px-2 py-1 rounded-lg hover:bg-primary-50 transition-colors inline-flex items-center gap-1">
                  <CheckCheck size={13} /> خواندن همه
                </button>
              )}
              {items.length > 0 && (
                <button onClick={clearAll}
                  className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors inline-flex items-center gap-1">
                  <Trash2 size={13} /> پاک‌کردن
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto max-h-[22rem] divide-y divide-gray-50">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                <Bell size={40} className="mb-3" />
                <p className="text-sm font-medium text-gray-400">اعلانی وجود ندارد</p>
              </div>
            ) : (
              items.map(n => {
                const cfg  = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.order
                const Icon = cfg.icon
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    role="button"
                    tabIndex={0}
                    className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors group ${
                      !n.read ? 'bg-primary-50/50 hover:bg-primary-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                      <Icon size={17} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                        {n.text}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(n.time)}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />}
                      <button
                        onClick={e => { e.stopPropagation(); dismiss(n.id) }}
                        className="p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="حذف اعلان"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2.5">
              <Link
                to="/admin/notifications"
                onClick={() => setOpen(false)}
                className="w-full text-center text-xs text-primary-600 hover:text-primary-700 font-semibold py-1.5 rounded-xl hover:bg-primary-50 transition-colors block"
              >
                مشاهده همه اعلان‌ها
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
