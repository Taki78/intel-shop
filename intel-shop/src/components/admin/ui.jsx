import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export const ORDER_STATUS = {
  pending:    { label: 'در انتظار',          color: 'text-gray-600 bg-gray-100',     dot: 'bg-gray-400'    },
  processing: { label: 'در حال پردازش',      color: 'text-amber-700 bg-amber-100',   dot: 'bg-amber-500'   },
  shipped:    { label: 'در حال ارسال',        color: 'text-blue-700 bg-blue-100',     dot: 'bg-blue-500'    },
  delivered:  { label: 'تحویل شده',           color: 'text-emerald-700 bg-emerald-100', dot: 'bg-emerald-500' },
  cancelled:  { label: 'لغو شده',             color: 'text-red-700 bg-red-100',       dot: 'bg-red-500'     },
}

/* KPI / stat card with optional trend */
export function StatCard({ icon: Icon, label, value, trend, trendUp = true, color = 'text-primary-600 bg-primary-50' }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={22} />
        </div>
        {trend && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-lg ${
            trendUp ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
          }`}>
            {trendUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-gray-900 leading-tight">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}

/* Section wrapper with title + optional action */
export function SectionCard({ title, icon: Icon, action, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            {Icon && <Icon size={18} className="text-primary-600" />}
            {title}
          </h2>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

/* Order status pill */
export function StatusBadge({ status }) {
  const s = ORDER_STATUS[status] || ORDER_STATUS.pending
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

/* Avatar from initials */
export function Avatar({ name, size = 'md' }) {
  const initials = name?.trim().split(' ').slice(0, 2).map((w) => w[0]).join('') || '؟'
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500']
  const color = colors[(name?.length || 0) % colors.length]
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center text-white font-bold shrink-0`}>
      {initials}
    </div>
  )
}

/* Simple responsive SVG bar chart */
export function BarChart({ data, unit = '' }) {
  const max = Math.max(...data.map((d) => d.value)) || 1
  const W = 520, H = 200, pad = 28
  const barW = (W - pad * 2) / data.length
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-52" preserveAspectRatio="xMidYMid meet">
      {/* gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((g) => {
        const y = pad + (H - pad * 2) * (1 - g)
        return <line key={g} x1={pad} y1={y} x2={W - pad} y2={y} stroke="#f1f5f9" strokeWidth="1" />
      })}
      {data.map((d, i) => {
        const h = (H - pad * 2) * (d.value / max)
        const x = pad + i * barW + barW * 0.2
        const y = H - pad - h
        const bw = barW * 0.6
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={h} rx="5" fill="url(#barGrad)" />
            <text x={x + bw / 2} y={H - pad + 16} textAnchor="middle" fontSize="11" fill="#94a3b8">{d.day || d.label}</text>
            <text x={x + bw / 2} y={y - 6} textAnchor="middle" fontSize="10" fontWeight="700" fill="#475569">{d.value}{unit}</text>
          </g>
        )
      })}
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/* Donut via conic-gradient + legend */
export function Donut({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  let acc = 0
  const stops = data.map((d) => {
    const start = (acc / total) * 100
    acc += d.value
    const end = (acc / total) * 100
    return `${d.color} ${start}% ${end}%`
  }).join(', ')

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <div
          className="w-32 h-32 rounded-full"
          style={{ background: `conic-gradient(${stops})` }}
        />
        <div className="absolute inset-[18px] bg-white rounded-full flex flex-col items-center justify-center">
          <span className="text-xs text-gray-400">مجموع</span>
          <span className="font-black text-gray-800">٪۱۰۰</span>
        </div>
      </div>
      <div className="space-y-2.5 flex-1">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: d.color }} />
            <span className="text-sm text-gray-600 flex-1">{d.label}</span>
            <span className="text-sm font-bold text-gray-800">{new Intl.NumberFormat('fa-IR').format(d.value)}٪</span>
          </div>
        ))}
      </div>
    </div>
  )
}
