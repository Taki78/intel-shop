import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { User, Package, Heart, LogOut, Edit, MapPin, Plus, Trash2, Star, X, Check, FileText, Loader2, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { useAddress } from '../context/AddressContext'
import ProductCard from '../components/common/ProductCard'
import { formatPrice } from '../utils/price'
import { toPersianNum } from '../utils/jalali'
import api from '../utils/api'
import { useProvinces } from '../utils/useProvinces'
import { IRAN_CITIES } from '../utils/iranGeo'

const STATUS_COLOR = {
  pending:    'text-amber-600 bg-amber-50',
  processing: 'text-blue-600 bg-blue-50',
  shipped:    'text-purple-600 bg-purple-50',
  delivered:  'text-green-600 bg-green-50',
  cancelled:  'text-red-600 bg-red-50',
}

const EMPTY_FORM = { label: 'خانه', full_name: '', phone: '', province: '', city: '', postal_code: '', detail: '', is_default: false }

export default function AccountPage() {
  const { user, logout, updateProfile } = useAuth()
  const { items: wishlistItems } = useWishlist()
  const { addresses, defaultAddress, addAddress, updateAddress, deleteAddress, setDefault } = useAddress()
  const provinces = useProvinces()
  const [tab, setTab] = useState('profile')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '' })

  // Orders state
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  // Change password state
  const [passForm, setPassForm] = useState({ old_password: '', new_password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [passLoading, setPassLoading] = useState(false)
  const [passError, setPassError]   = useState('')
  const [passDone, setPassDone]     = useState(false)

  useEffect(() => {
    if (tab === 'orders' && user) {
      setOrdersLoading(true)
      api.get('/orders/')
        .then(({ data }) => setOrders(data.results ?? data))
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false))
    }
  }, [tab, user])

  // Address state
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [addressForm, setAddressForm] = useState(EMPTY_FORM)

  if (!user) return <Navigate to="/login" replace />

  const tabs = [
    { id: 'profile',   label: 'پروفایل',          icon: User    },
    { id: 'addresses', label: 'آدرس‌ها',           icon: MapPin  },
    { id: 'orders',    label: 'سفارشات',           icon: Package },
    { id: 'wishlist',  label: 'علاقه‌مندی‌ها',    icon: Heart   },
    { id: 'security',  label: 'تغییر رمز عبور',   icon: Lock    },
  ]

  async function handleChangePassword(e) {
    e.preventDefault()
    setPassError('')
    setPassDone(false)
    if (passForm.new_password !== passForm.confirm) {
      setPassError('تکرار رمز عبور مطابقت ندارد')
      return
    }
    setPassLoading(true)
    try {
      await api.post('/users/me/change-password/', {
        old_password: passForm.old_password,
        new_password: passForm.new_password,
      })
      setPassDone(true)
      setPassForm({ old_password: '', new_password: '', confirm: '' })
    } catch (err) {
      const e = err.response?.data || {}
      setPassError(e.old_password?.[0] || e.detail || 'خطا در تغییر رمز عبور')
    } finally {
      setPassLoading(false)
    }
  }

  function handleSave(e) {
    e.preventDefault()
    updateProfile(form)
    setEditing(false)
  }

  function openNewAddress() {
    setAddressForm({ ...EMPTY_FORM, is_default: addresses.length === 0 })
    setEditingAddressId(null)
    setShowAddressForm(true)
  }

  function openEditAddress(addr) {
    setAddressForm({ ...addr })
    setEditingAddressId(addr.id)
    setShowAddressForm(true)
  }

  function handleAddressSubmit(e) {
    e.preventDefault()
    if (editingAddressId) {
      updateAddress(editingAddressId, addressForm)
    } else {
      addAddress(addressForm)
    }
    setShowAddressForm(false)
    setEditingAddressId(null)
  }

  function af(key, val) {
    setAddressForm((p) => ({ ...p, [key]: val }))
  }

  return (
    <div className="py-8">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full sm:w-56 shrink-0">
            <div className="card p-5 text-center mb-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-700 font-black text-2xl">{user.name.charAt(0)}</span>
              </div>
              <p className="font-bold text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500 mt-0.5 dir-ltr">{user.phone || user.email || ''}</p>
            </div>
            <nav className="card p-2 space-y-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-right ${
                    tab === t.id ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <t.icon size={16} /> {t.label}
                  {t.id === 'addresses' && addresses.length > 0 && (
                    <span className={`mr-auto text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {toPersianNum(addresses.length)}
                    </span>
                  )}
                </button>
              ))}
              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors text-right"
              >
                <LogOut size={16} /> خروج از حساب
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">

            {/* Profile tab */}
            {tab === 'profile' && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-gray-800 text-lg">اطلاعات شخصی</h2>
                  <button onClick={() => setEditing(!editing)} className="btn-ghost text-sm py-1.5">
                    <Edit size={14} /> ویرایش
                  </button>
                </div>
                {editing ? (
                  <form onSubmit={handleSave} className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">نام</label>
                      <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="input" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">موبایل</label>
                      <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="input" dir="ltr" placeholder="09..." />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">ایمیل (اختیاری)</label>
                      <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="input" dir="ltr" placeholder="example@email.com" />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="btn-primary text-sm py-2">ذخیره</button>
                      <button type="button" onClick={() => setEditing(false)} className="btn-ghost text-sm py-2">انصراف</button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {[
                      ['نام', user.name],
                      ['موبایل', user.phone || 'ثبت نشده'],
                      ...(user.email ? [['ایمیل', user.email]] : []),
                    ].map(([label, val]) => (
                      <div key={label} className="flex items-center justify-between py-3 border-b last:border-0">
                        <span className="text-sm text-gray-500">{label}</span>
                        <span className="text-sm font-medium text-gray-800 dir-ltr">{val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses tab */}
            {tab === 'addresses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-gray-800 text-lg">آدرس‌های من</h2>
                  <button onClick={openNewAddress} className="btn-primary text-sm py-2">
                    <Plus size={15} /> افزودن آدرس
                  </button>
                </div>

                {/* Address form */}
                {showAddressForm && (
                  <div className="card p-5 border-2 border-primary-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-800">{editingAddressId ? 'ویرایش آدرس' : 'آدرس جدید'}</h3>
                      <button onClick={() => setShowAddressForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                    </div>
                    <form onSubmit={handleAddressSubmit} className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">برچسب</label>
                        <div className="flex gap-2">
                          {['خانه', 'محل کار', 'دیگر'].map((lbl) => (
                            <button
                              key={lbl}
                              type="button"
                              onClick={() => af('label', lbl)}
                              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${addressForm.label === lbl ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}
                            >
                              {lbl}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">نام تحویل‌گیرنده</label>
                          <input required value={addressForm.full_name} onChange={(e) => af('full_name', e.target.value)} className="input" placeholder="نام کامل" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">موبایل</label>
                          <input required value={addressForm.phone} onChange={(e) => af('phone', e.target.value)} className="input" placeholder="09..." dir="ltr" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">استان</label>
                          <select
                            required
                            value={addressForm.province}
                            onChange={(e) => { af('province', e.target.value); af('city', '') }}
                            className="input"
                          >
                            <option value="">انتخاب استان</option>
                            {provinces.map((p) => <option key={p}>{p}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">شهر</label>
                          <select
                            required
                            value={addressForm.city}
                            onChange={(e) => af('city', e.target.value)}
                            className="input"
                            disabled={!addressForm.province}
                          >
                            <option value="">انتخاب شهر</option>
                            {(IRAN_CITIES[addressForm.province] || []).map((c) => (
                              <option key={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">کد پستی</label>
                          <input
                            value={addressForm.postal_code}
                            onChange={(e) => af('postal_code', e.target.value.replace(/\D/g, '').slice(0, 10))}
                            className="input"
                            placeholder="۱۰ رقم"
                            inputMode="numeric"
                            maxLength={10}
                            dir="ltr"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">آدرس کامل</label>
                        <textarea required value={addressForm.detail} onChange={(e) => af('detail', e.target.value)} className="input resize-none" rows={2} placeholder="خیابان، پلاک، واحد..." />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={addressForm.is_default} onChange={(e) => af('is_default', e.target.checked)} className="accent-primary-600" />
                        <span className="text-sm text-gray-700">تنظیم به عنوان آدرس پیش‌فرض</span>
                      </label>
                      <div className="flex gap-2 pt-1">
                        <button type="submit" className="btn-primary text-sm py-2">
                          <Check size={15} /> {editingAddressId ? 'ذخیره تغییرات' : 'افزودن آدرس'}
                        </button>
                        <button type="button" onClick={() => setShowAddressForm(false)} className="btn-ghost text-sm py-2">انصراف</button>
                      </div>
                    </form>
                  </div>
                )}

                {addresses.length === 0 && !showAddressForm ? (
                  <div className="card p-10 text-center">
                    <MapPin size={40} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">هنوز آدرسی ثبت نکرده‌اید</p>
                    <button onClick={openNewAddress} className="btn-primary text-sm">افزودن اولین آدرس</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div key={addr.id} className={`card p-4 border-2 transition-colors ${addr.is_default ? 'border-primary-300 bg-primary-50/30' : 'border-gray-100'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{addr.label}</span>
                              {addr.is_default && (
                                <span className="text-xs font-bold text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Star size={10} fill="currentColor" /> پیش‌فرض
                                </span>
                              )}
                            </div>
                            <p className="font-semibold text-gray-800 text-sm">{addr.full_name}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{addr.phone}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {addr.province}، {addr.city} — {addr.detail}
                            </p>
                            {addr.postal_code && <p className="text-xs text-gray-400 mt-0.5" dir="ltr">کد پستی: {addr.postal_code}</p>}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {!addr.is_default && (
                              <button
                                onClick={() => setDefault(addr.id)}
                                className="text-xs text-primary-600 hover:bg-primary-50 px-2 py-1.5 rounded-lg transition-colors"
                                title="تنظیم پیش‌فرض"
                              >
                                پیش‌فرض
                              </button>
                            )}
                            <button onClick={() => openEditAddress(addr)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                              <Edit size={15} />
                            </button>
                            <button onClick={() => deleteAddress(addr.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Orders tab */}
            {tab === 'orders' && (
              <div className="card p-6">
                <h2 className="font-bold text-gray-800 text-lg mb-5">سفارشات من</h2>
                {ordersLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 size={28} className="animate-spin text-primary-400" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-10">
                    <Package size={40} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">هنوز سفارشی ثبت نکرده‌اید</p>
                    <Link to="/shop" className="btn-primary text-sm">شروع خرید</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-100 rounded-xl p-4 hover:border-primary-200 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-gray-800" dir="ltr">{order.order_number}</span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLOR[order.status] || 'text-gray-600 bg-gray-100'}`}>
                            {order.status_display}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            {new Date(order.created_at).toLocaleDateString('fa-IR')} | {toPersianNum(order.items_count)} کالا
                          </span>
                          <span className="font-semibold text-primary-600">{formatPrice(order.total)}</span>
                        </div>
                        {order.invoice_number && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <Link
                              to={`/invoice/${order.order_number}`}
                              className="text-xs text-primary-600 hover:underline flex items-center gap-1"
                            >
                              <FileText size={12} /> مشاهده فاکتور {order.invoice_number}
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist tab */}
            {tab === 'wishlist' && (
              <div>
                <h2 className="font-bold text-gray-800 text-lg mb-5">علاقه‌مندی‌ها ({wishlistItems.length})</h2>
                {wishlistItems.length === 0 ? (
                  <div className="card p-8 text-center">
                    <Heart size={40} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500">علاقه‌مندی‌ای ندارید</p>
                    <Link to="/shop" className="btn-primary mt-4 text-sm">خرید کنید</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4">
                    {wishlistItems.map((p) => <ProductCard key={p.id} product={p} />)}
                  </div>
                )}
              </div>
            )}

            {/* Security tab */}
            {tab === 'security' && (
              <div className="card p-6 max-w-md">
                <h2 className="font-bold text-gray-800 text-lg mb-5 flex items-center gap-2">
                  <Lock size={18} className="text-primary-600" /> تغییر رمز عبور
                </h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">رمز عبور فعلی</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={passForm.old_password}
                        onChange={e => setPassForm(f => ({ ...f, old_password: e.target.value }))}
                        className="input pl-10"
                        dir="ltr"
                        required
                      />
                      <button type="button" onClick={() => setShowPass(v => !v)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">رمز عبور جدید</label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={passForm.new_password}
                      onChange={e => setPassForm(f => ({ ...f, new_password: e.target.value }))}
                      placeholder="حداقل ۶ کاراکتر"
                      className="input"
                      dir="ltr"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">تکرار رمز جدید</label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={passForm.confirm}
                      onChange={e => setPassForm(f => ({ ...f, confirm: e.target.value }))}
                      placeholder="تکرار رمز"
                      className="input"
                      dir="ltr"
                      required
                    />
                  </div>

                  {passError && (
                    <p className="text-red-500 text-sm bg-red-50 rounded-lg p-3">{passError}</p>
                  )}
                  {passDone && (
                    <p className="text-green-600 text-sm bg-green-50 rounded-lg p-3 flex items-center gap-2">
                      <Check size={15} /> رمز عبور با موفقیت تغییر کرد
                    </p>
                  )}

                  <button type="submit" disabled={passLoading} className="btn-primary w-full justify-center py-2.5">
                    {passLoading ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                    {passLoading ? 'در حال ذخیره...' : 'تغییر رمز عبور'}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
