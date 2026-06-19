import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Cpu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const { register, loading, error } = useAuth()
  const navigate = useNavigate()

  function update(key, val) {
    setForm((p) => ({ ...p, [key]: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirm) return alert('رمز عبور مطابقت ندارد')
    const res = await register(form.name, form.email, form.phone, form.password)
    if (res.success) navigate('/account')
  }

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 justify-center mb-4">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Cpu size={22} className="text-white" />
            </div>
            <span className="text-primary-700 font-black text-xl">Intel Shop</span>
          </Link>
          <h1 className="text-2xl font-black text-gray-800">ایجاد حساب کاربری</h1>
          <p className="text-gray-500 text-sm mt-1">به اینتل شاپ خوش آمدید</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'name', label: 'نام و نام خانوادگی', placeholder: 'نام کامل', type: 'text' },
            { key: 'email', label: 'ایمیل', placeholder: 'example@email.com', type: 'email', dir: 'ltr' },
            { key: 'phone', label: 'شماره موبایل', placeholder: '09...', type: 'tel', dir: 'ltr' },
            { key: 'password', label: 'رمز عبور', placeholder: 'حداقل ۶ کاراکتر (نه فقط عدد)', type: 'password', dir: 'ltr' },
            { key: 'confirm', label: 'تکرار رمز عبور', placeholder: 'تکرار رمز', type: 'password', dir: 'ltr' },
          ].map(({ key, label, placeholder, type, dir }) => (
            <div key={key}>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => update(key, e.target.value)}
                placeholder={placeholder}
                className="input"
                dir={dir}
                required
              />
            </div>
          ))}

          {error && (
            <p className="text-red-500 text-sm bg-red-50 rounded-lg p-3">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          حساب دارید؟{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">وارد شوید</Link>
        </p>
      </div>
    </div>
  )
}
