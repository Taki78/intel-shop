import { useState, useEffect } from 'react'
import { NavLink, Link, Outlet, Navigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag, Users, Ticket, Settings,
  Cpu, Search, Menu, X, LogOut, ArrowRight, Star, Bell, Clock, FolderOpen,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Avatar } from './ui'
import NotificationPanel from './NotificationPanel'

const P_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const toP = n => String(n).padStart(2, '0').replace(/\d/g, d => P_DIGITS[d])
const JALALI_MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند']
const PERSIAN_DAYS  = ['یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه','شنبه']

function toJalali(gy, gm, gd) {
  const g = [0,31,59,90,120,151,181,212,243,273,304,334]
  let jy, jm, jd, leap, i
  gy -= 1600; gm -= 1; gd -= 1
  let gDN = 365*gy + Math.floor((gy+3)/4) - Math.floor((gy+99)/100) + Math.floor((gy+399)/400) + g[gm] + gd
  if (gm > 1 && ((gy+1600)%4===0 && ((gy+1600)%100!==0||(gy+1600)%400===0))) gDN++
  let jDN = gDN - 79
  const j1 = Math.floor(jDN / 12053); jDN %= 12053
  jy = 979 + 33*j1 + 4*Math.floor(jDN/1461); jDN %= 1461
  if (jDN >= 366) { jy += Math.floor((jDN-1)/365); jDN = (jDN-1)%365 }
  const jDays = [31,31,31,31,31,31,30,30,30,30,30,29]
  for (i=0; i<11 && jDN>=jDays[i]; i++) jDN -= jDays[i]
  jm = i+1; jd = jDN+1
  return [jy, jm, jd]
}

function DateTimeClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const [jy, jm, jd] = toJalali(now.getFullYear(), now.getMonth()+1, now.getDate())
  const timeStr = `${toP(now.getHours())}:${toP(now.getMinutes())}:${toP(now.getSeconds())}`
  const dateStr = `${PERSIAN_DAYS[now.getDay()]}، ${String(jd).replace(/\d/g, d => P_DIGITS[d])} ${JALALI_MONTHS[jm-1]} ${String(jy).replace(/\d/g, d => P_DIGITS[d])}`

  return (
    <div className="hidden lg:flex items-center gap-2.5 bg-slate-50 border border-gray-100 rounded-xl px-3.5 py-2 shrink-0">
      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
        <Clock size={15} className="text-primary-600" />
      </div>
      <div className="text-right leading-none">
        <p className="text-[15px] font-black text-gray-800 tabular-nums tracking-wide" dir="ltr">{timeStr}</p>
        <p className="text-[11px] text-gray-400 mt-1">{dateStr}</p>
      </div>
    </div>
  )
}

const nav = [
  { to: '/admin', label: 'داشبورد', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'محصولات', icon: Package },
  { to: '/admin/categories', label: 'دسته‌بندی‌ها', icon: FolderOpen },
  { to: '/admin/orders', label: 'سفارشات', icon: ShoppingBag },
  { to: '/admin/customers', label: 'مشتریان', icon: Users },
  { to: '/admin/reviews', label: 'نظرات', icon: Star },
  { to: '/admin/discounts', label: 'کدهای تخفیف', icon: Ticket },
  { to: '/admin/notifications', label: 'اعلان‌ها', icon: Bell },
  { to: '/admin/settings', label: 'تنظیمات', icon: Settings },
]

const titles = {
  '/admin': 'داشبورد',
  '/admin/products': 'مدیریت محصولات',
  '/admin/products/new': 'افزودن محصول جدید',
  '/admin/categories': 'مدیریت دسته‌بندی‌ها',
  '/admin/orders': 'مدیریت سفارشات',
  '/admin/customers': 'مشتریان',
  '/admin/reviews': 'مدیریت نظرات',
  '/admin/discounts': 'کدهای تخفیف',
  '/admin/notifications': 'مرکز اعلان‌ها',
  '/admin/settings': 'تنظیمات فروشگاه',
}

function SidebarContent({ user, onLogout, onNavigate }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <Link to="/admin" onClick={onNavigate} className="flex items-center gap-2.5 px-5 h-16 border-b border-white/10 shrink-0">
        <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
          <Cpu size={20} className="text-white" />
        </div>
        <div className="leading-tight">
          <span className="text-white font-black text-base block">Intel Shop</span>
          <span className="text-slate-400 text-[11px]">پنل مدیریت</span>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <p className="text-[11px] text-slate-500 font-semibold px-3 mb-2 mt-1">منوی اصلی</p>
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group ${
                isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={19} className={isActive ? '' : 'text-slate-400 group-hover:text-white'} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Back to site + user */}
      <div className="p-3 border-t border-white/10 space-y-2 shrink-0">
        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
        >
          <ArrowRight size={17} /> بازگشت به فروشگاه
        </Link>
        <div className="flex items-center gap-2.5 px-2 py-2 bg-white/5 rounded-xl">
          <Avatar name={user?.name || 'مدیر'} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name || 'مدیر سیستم'}</p>
            <p className="text-slate-400 text-[11px] truncate">{user?.email || 'admin@intelshop.ir'}</p>
          </div>
          <button onClick={onLogout} className="p-1.5 text-slate-400 hover:text-red-400 transition-colors" title="خروج">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  if (!user) return <Navigate to="/login" replace />
  if (user.is_staff !== true) return <Navigate to="/login" state={{ adminOnly: true }} replace />

  const title = titles[location.pathname]
    ?? (location.pathname.endsWith('/edit') ? 'ویرایش محصول' : 'پنل مدیریت')

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop sidebar (right side in RTL) */}
      <aside className="hidden lg:flex w-64 bg-slate-900 fixed inset-y-0 right-0 z-40">
        <SidebarContent user={user} onLogout={logout} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 right-0 w-64 bg-slate-900 animate-slide-in-right">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 left-4 text-slate-400 hover:text-white"
              aria-label="بستن"
            >
              <X size={20} />
            </button>
            <SidebarContent user={user} onLogout={logout} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:mr-64 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 h-16 flex items-center gap-3 px-4 sm:px-6 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 -mr-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="منو"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-2">
            <h1 className="font-black text-gray-800 text-lg">{title}</h1>
          </div>

          {/* Search */}
          <div className="relative mr-auto hidden sm:block w-56 lg:w-72">
            <input
              type="text"
              placeholder="جستجو..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
            />
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <DateTimeClock />

          <div className="flex items-center gap-1 sm:mr-0 mr-auto">
            <NotificationPanel />
            <div className="hidden sm:flex items-center gap-2 pr-2 mr-1 border-r border-gray-100">
              <Avatar name={user?.name || 'مدیر'} size="sm" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
