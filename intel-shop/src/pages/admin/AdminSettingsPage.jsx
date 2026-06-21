import { useState, useEffect } from 'react'
import { Store, Truck, CreditCard, Bell, Shield, Check, Save, Loader2 } from 'lucide-react'
import { SectionCard } from '../../components/admin/ui'
import { adminApi } from '../../utils/adminApi'

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`relative w-11 rounded-full transition-colors shrink-0 ${on ? 'bg-primary-600' : 'bg-gray-300'}`}
      style={{ height: '24px' }}
    >
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${on ? 'left-0.5' : 'right-0.5'}`} />
    </button>
  )
}

function Row({ title, desc, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div>
        <p className="text-sm font-medium text-gray-800">{title}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  )
}

const DEFAULTS = {
  store_name: '', email: '', phone: '', address: '',
  free_shipping_enabled: true, free_shipping_over: 5000000, express_enabled: true,
  payment_online: true, payment_cod: true, payment_installment: false,
  notify_new_order: true, notify_low_stock: true, notify_new_user: false,
  enamad_html: '',
}

export default function AdminSettingsPage() {
  const [form, setForm]       = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    adminApi.getSettings()
      .then(r => setForm(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const set  = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const setB = k => v => setForm(f => ({ ...f, [k]: v }))

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const { data } = await adminApi.updateSettings({
        store_name: form.store_name,
        email:      form.email,
        phone:      form.phone,
        address:    form.address,
        free_shipping_enabled: form.free_shipping_enabled,
        free_shipping_over:    Number(form.free_shipping_over) || 0,
        express_enabled:       form.express_enabled,
        payment_online:        form.payment_online,
        payment_cod:           form.payment_cod,
        payment_installment:   form.payment_installment,
        notify_new_order:      form.notify_new_order,
        notify_low_stock:      form.notify_low_stock,
        notify_new_user:       form.notify_new_user,
        enamad_html:           form.enamad_html,
      })
      setForm(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('خطا در ذخیره تنظیمات')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-primary-400" />
      </div>
    )
  }

  return (
    <form onSubmit={save} className="space-y-6 max-w-3xl">
      {/* General */}
      <SectionCard title="اطلاعات فروشگاه" icon={Store}>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">نام فروشگاه</label>
            <input value={form.store_name} onChange={set('store_name')} className="input" placeholder="اینتل شاپ" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ایمیل</label>
            <input value={form.email} onChange={set('email')} className="input" dir="ltr" type="email" placeholder="info@intelshop.ir" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">تلفن</label>
            <input value={form.phone} onChange={set('phone')} className="input" placeholder="۰۲۱-۱۲۳۴۵۶۷۸" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">آدرس</label>
            <input value={form.address} onChange={set('address')} className="input" placeholder="تهران، خیابان ولیعصر..." />
          </div>
        </div>
      </SectionCard>

      {/* Shipping */}
      <SectionCard title="ارسال" icon={Truck}>
        <div className="p-5 divide-y divide-gray-50">
          <Row title="ارسال رایگان" desc="فعال‌سازی ارسال رایگان بالای حد مشخص">
            <Toggle on={form.free_shipping_enabled} onChange={setB('free_shipping_enabled')} />
          </Row>
          <Row title="حد ارسال رایگان (تومان)" desc="حداقل مبلغ خرید برای ارسال رایگان">
            <input
              type="number"
              value={form.free_shipping_over}
              onChange={set('free_shipping_over')}
              className="input w-40"
              dir="ltr"
              min="0"
            />
          </Row>
          <Row title="ارسال اکسپرس" desc="امکان ارسال سریع برای مشتریان">
            <Toggle on={form.express_enabled} onChange={setB('express_enabled')} />
          </Row>
        </div>
      </SectionCard>

      {/* Payment */}
      <SectionCard title="روش‌های پرداخت" icon={CreditCard}>
        <div className="p-5 divide-y divide-gray-50">
          <Row title="پرداخت آنلاین" desc="درگاه پرداخت اینترنتی">
            <Toggle on={form.payment_online} onChange={setB('payment_online')} />
          </Row>
          <Row title="پرداخت در محل" desc="پرداخت هنگام تحویل کالا">
            <Toggle on={form.payment_cod} onChange={setB('payment_cod')} />
          </Row>
          <Row title="خرید اقساطی" desc="پرداخت اقساطی برای محصولات منتخب">
            <Toggle on={form.payment_installment} onChange={setB('payment_installment')} />
          </Row>
        </div>
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="اعلان‌ها" icon={Bell}>
        <div className="p-5 divide-y divide-gray-50">
          <Row title="سفارش جدید" desc="اطلاع‌رسانی هنگام ثبت سفارش">
            <Toggle on={form.notify_new_order} onChange={setB('notify_new_order')} />
          </Row>
          <Row title="موجودی کم" desc="هشدار هنگام کاهش موجودی">
            <Toggle on={form.notify_low_stock} onChange={setB('notify_low_stock')} />
          </Row>
          <Row title="کاربر جدید" desc="اطلاع‌رسانی عضویت کاربر جدید">
            <Toggle on={form.notify_new_user} onChange={setB('notify_new_user')} />
          </Row>
        </div>
      </SectionCard>

      {/* E-Namad */}
      <SectionCard title="نماد اعتماد الکترونیکی (اینماد)" icon={Shield}>
        <div className="p-5 space-y-3">
          <p className="text-xs text-gray-500">
            از سایت <span dir="ltr" className="font-mono">enamad.ir</span> کد HTML نماد خود را دریافت کرده و اینجا paste کنید.
            این badge در فوتر سایت نمایش داده می‌شود.
          </p>
          <textarea
            value={form.enamad_html}
            onChange={set('enamad_html')}
            className="input resize-none font-mono text-xs"
            rows={5}
            dir="ltr"
            placeholder={'<a referrerpolicy=\'origin\' target=\'_blank\' href=\'https://trustseal.enamad.ir/...\'>\n  <img ... />\n</a>'}
          />
          {form.enamad_html && (
            <div className="flex items-center gap-3">
              <p className="text-xs text-gray-400">پیش‌نمایش:</p>
              <div
                className="inline-block"
                dangerouslySetInnerHTML={{ __html: form.enamad_html }}
              />
            </div>
          )}
        </div>
      </SectionCard>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving}
          className={`btn-primary justify-center min-w-[160px] ${saved ? '!from-emerald-600 !to-emerald-500' : ''}`}>
          {saving
            ? <Loader2 size={17} className="animate-spin" />
            : saved
              ? <><Check size={17} /> ذخیره شد</>
              : <><Save size={17} /> ذخیره تنظیمات</>
          }
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {saved && <p className="text-emerald-600 text-sm font-medium">تنظیمات با موفقیت ذخیره شد</p>}
      </div>
    </form>
  )
}
