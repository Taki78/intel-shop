import { useState } from 'react'
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Cpu, Eye, EyeOff, ShieldAlert } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const { user, login, loading, error } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const adminOnly = location.state?.adminOnly
  const next      = location.state?.next

  if (user) return <Navigate to="/account" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    const res = await login(identifier, password)
    if (res.success) {
      navigate(adminOnly ? '/admin' : next ?? '/account')
    }
  }

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {adminOnly && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-right">
            <ShieldAlert size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800">دسترسی محدود به ادمین</p>
              <p className="text-xs text-amber-700 mt-0.5">
                برای ورود به پنل مدیریت باید با حساب ادمین وارد شوید.
              </p>
            </div>
          </div>
        )}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 justify-center mb-4">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Cpu size={22} className="text-white" />
            </div>
            <span className="text-primary-700 font-black text-xl">Intel Shop</span>
          </Link>
          <h1 className="text-2xl font-black text-gray-800">ورود به حساب</h1>
          <p className="text-gray-500 text-sm mt-1">خوش برگشتید!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">شماره موبایل یا ایمیل</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder=""
              className="input"
              dir="ltr"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">رمز عبور</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور"
                className="input pl-10"
                dir="ltr"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 rounded-lg p-3">{error}</p>
          )}

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline">
              فراموشی رمز عبور؟
            </Link>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          حساب ندارید؟{' '}
          <Link to="/register" className="text-primary-600 font-semibold hover:underline">ثبت‌نام کنید</Link>
        </p>
      </div>
    </div>
  )
}
