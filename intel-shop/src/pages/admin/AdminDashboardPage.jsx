import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Wallet, ShoppingBag, Users, Package, BarChart3, PieChart,
  AlertTriangle, ArrowLeft, TrendingUp, Loader2,
} from 'lucide-react'
import { StatCard, SectionCard, StatusBadge, BarChart, Donut, Avatar, ORDER_STATUS } from '../../components/admin/ui'
import { categoryShare } from '../../data/adminData'
import { formatPrice } from '../../utils/price'
import { adminApi } from '../../utils/adminApi'

const fa = n => new Intl.NumberFormat('fa-IR').format(n)

export default function AdminDashboardPage() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getStats()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-primary-400" />
      </div>
    )
  }

  const revenue    = stats?.total_revenue ?? 0
  const lowStock   = stats?.low_stock_products ?? []
  const recentOrds = stats?.recent_orders ?? []

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Wallet}   label="درآمد کل"   value={formatPrice(revenue).replace(' تومان', '')} color="text-emerald-600 bg-emerald-50" />
        <StatCard icon={ShoppingBag} label="سفارشات" value={fa(stats?.total_orders ?? 0)} color="text-blue-600 bg-blue-50" />
        <StatCard icon={Users}    label="مشتریان"    value={fa(stats?.total_users ?? 0)} color="text-violet-600 bg-violet-50" />
        <StatCard icon={Package}  label="موجودی کم"  value={fa(stats?.low_stock_count ?? 0)} color="text-amber-600 bg-amber-50" />
      </div>

      {/* Pending alerts */}
      {(stats?.pending_orders > 0 || stats?.pending_reviews > 0) && (
        <div className="flex flex-wrap gap-3">
          {stats.pending_orders > 0 && (
            <Link to="/admin/orders?status=pending" className="flex items-center gap-2 text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl hover:bg-amber-100 transition-colors">
              <ShoppingBag size={15} /> {fa(stats.pending_orders)} سفارش در انتظار
            </Link>
          )}
          {stats.pending_reviews > 0 && (
            <Link to="/admin/reviews?status=pending" className="flex items-center gap-2 text-sm font-semibold text-violet-700 bg-violet-50 border border-violet-200 px-4 py-2.5 rounded-xl hover:bg-violet-100 transition-colors">
              <AlertTriangle size={15} /> {fa(stats.pending_reviews)} نظر در انتظار تأیید
            </Link>
          )}
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard title="فروش هفته (میلیون تومان)" icon={BarChart3} className="lg:col-span-2">
          <div className="p-5">
            <BarChart data={stats?.weekly_sales ?? []} />
          </div>
        </SectionCard>
        <SectionCard title="سهم دسته‌بندی" icon={PieChart}>
          <div className="p-5">
            <Donut data={categoryShare} />
          </div>
        </SectionCard>
      </div>

      {/* Recent orders + low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionCard
          title="سفارشات اخیر"
          icon={ShoppingBag}
          className="lg:col-span-2"
          action={
            <Link to="/admin/orders" className="text-sm text-primary-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              همه <ArrowLeft size={14} />
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['شماره', 'مشتری', 'وضعیت', 'مبلغ'].map(h => (
                    <th key={h} className="px-5 py-3 text-right text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrds.map(o => (
                  <tr key={o.id} className="border-t border-gray-50 hover:bg-gray-50/60">
                    <td className="px-5 py-3 text-sm font-mono text-gray-700" dir="ltr">{o.order_number}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={o.user_name} size="sm" />
                        <span className="text-sm text-gray-800">{o.user_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3 text-sm font-bold text-primary-600 whitespace-nowrap">{formatPrice(o.total)}</td>
                  </tr>
                ))}
                {recentOrds.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400 text-sm">سفارشی ثبت نشده</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="هشدار موجودی کم" icon={AlertTriangle}>
          <div className="p-3">
            {lowStock.length === 0 && (
              <p className="text-sm text-gray-400 p-4 text-center">موجودی همه محصولات کافی است</p>
            )}
            {lowStock.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
                {p.image
                  ? <img src={p.image} alt="" className="w-11 h-11 rounded-lg object-contain bg-gray-50 p-1" />
                  : <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><Package size={18} className="text-gray-300" /></div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.brand}</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${
                  p.stock === 0 ? 'text-red-600 bg-red-50' : 'text-amber-600 bg-amber-50'
                }`}>
                  {p.stock === 0 ? 'ناموجود' : `${fa(p.stock)} عدد`}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'سفارشات امروز', value: fa(stats?.today_orders ?? 0), sub: formatPrice(stats?.today_revenue ?? 0) },
          { label: 'درآمد این ماه', value: formatPrice(stats?.month_revenue ?? 0).replace(' تومان', ''), sub: 'تومان' },
          { label: 'کل محصولات', value: fa(stats?.total_products ?? 0), sub: 'محصول فعال' },
          { label: 'درآمد کل', value: formatPrice(revenue).replace(' تومان', ''), sub: 'تومان' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className="text-xl font-black text-gray-900 truncate">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
