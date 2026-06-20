import { useState } from 'react'
import { Phone, Mail, MapPin, Clock, CheckCircle, Loader2 } from 'lucide-react'
import api from '../utils/api'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true); setErrorMsg('')
    try {
      await api.post('/content/contact/', form)
      setSent(true)
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      const d = err.response?.data || {}
      setErrorMsg(d.email?.[0] || d.detail || 'خطا در ارسال پیام')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="py-8">
      <div className="container-custom">
        <h1 className="text-2xl font-black text-gray-800 mb-2">تماس با ما</h1>
        <p className="text-gray-500 text-sm mb-8">پاسخ‌گوی سوالات و نظرات شما هستیم</p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Info */}
          <div className="space-y-5">
            {[
              { icon: Phone, title: 'تلفن تماس', lines: ['۰۲۱-۱۲۳۴۵۶۷۸', '۰۹۱۲-۳۴۵۶۷۸۹'] },
              { icon: Mail, title: 'ایمیل', lines: ['info@intelshop.ir', 'support@intelshop.ir'] },
              { icon: MapPin, title: 'آدرس', lines: ['تهران، خیابان ولیعصر،', 'بازار رایانه، پلاک ۱۲'] },
              { icon: Clock, title: 'ساعات کاری', lines: ['شنبه تا پنج‌شنبه: ۹ تا ۱۸', 'جمعه: ۱۰ تا ۱۵'] },
            ].map(({ icon: Icon, title, lines }) => (
              <div key={title} className="card p-4 flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-primary-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm mb-1">{title}</p>
                  {lines.map((l, i) => <p key={i} className="text-gray-500 text-sm">{l}</p>)}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="card p-6">
            {sent ? (
              <div className="text-center py-8">
                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">پیام شما ارسال شد!</h3>
                <p className="text-gray-500 text-sm mb-4">به زودی با شما تماس خواهیم گرفت</p>
                <button onClick={() => setSent(false)} className="btn-outline text-sm">ارسال پیام جدید</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="font-bold text-gray-800 text-lg mb-4">ارسال پیام</h2>
                {errorMsg && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{errorMsg}</p>}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">نام</label>
                    <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="input" placeholder="نام شما" required />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">ایمیل</label>
                    <input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} className="input" placeholder="ایمیل" dir="ltr" required />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">موضوع</label>
                  <input value={form.subject} onChange={e => setForm(p => ({...p, subject: e.target.value}))} className="input" placeholder="موضوع پیام" required />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">پیام</label>
                  <textarea value={form.message} onChange={e => setForm(p => ({...p, message: e.target.value}))} className="input resize-none" rows={5} placeholder="پیام خود را بنویسید..." required />
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3 gap-2">
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {submitting ? 'در حال ارسال...' : 'ارسال پیام'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
