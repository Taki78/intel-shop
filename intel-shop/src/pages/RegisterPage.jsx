import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Cpu, Mail, Smartphone, ArrowRight, ArrowLeft, Loader2, ShieldCheck,
} from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

const STEPS = { CHANNEL: 1, CODE: 2, DETAILS: 3 }

const P_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const toFa = (n) => String(n).replace(/\d/g, (d) => P_DIGITS[d])

function StepIndicator({ step }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex items-center">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
            step >= n ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
          }`}>{toFa(n)}</div>
          {n < 3 && <div className={`w-8 h-0.5 ${step > n ? 'bg-primary-600' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  )
}

function StepChannel({ method, setMethod, value, setValue, onSubmit, loading, error }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-gray-500 text-center mb-4">روش تأیید را انتخاب کنید</p>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setMethod('email')}
          className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${
            method === 'email' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
          }`}>
          <Mail size={18} />
          <span className="text-sm font-semibold">ایمیل</span>
        </button>
        <button type="button" onClick={() => setMethod('phone')}
          className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${
            method === 'phone' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
          }`}>
          <Smartphone size={18} />
          <span className="text-sm font-semibold">پیامک</span>
        </button>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          {method === 'email' ? 'ایمیل' : 'شماره موبایل'}
        </label>
        <input
          type={method === 'email' ? 'email' : 'tel'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={method === 'email' ? 'example@email.com' : '09123456789'}
          className="input"
          dir="ltr"
          required
        />
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg p-3">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 gap-2">
        {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowLeft size={18} />}
        ارسال کد تأیید
      </button>
    </form>
  )
}

function StepCode({ method, value, code, setCode, onSubmit, onResend, onBack, loading, resending, error, expiresIn, debugCode }) {
  const inputs = useRef([])
  const [secondsLeft, setSecondsLeft] = useState(expiresIn || 120)
  useEffect(() => {
    if (secondsLeft <= 0) return
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [secondsLeft])

  function setDigit(i, v) {
    const d = v.replace(/\D/g, '').slice(-1)
    const next = code.split('')
    next[i] = d || ''
    const joined = next.join('').padEnd(6, '').slice(0, 6)
    setCode(joined.replace(/ /g, ''))
    if (d && inputs.current[i + 1]) inputs.current[i + 1].focus()
  }

  function onPaste(e) {
    const text = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6)
    if (text.length) {
      e.preventDefault()
      setCode(text)
      inputs.current[Math.min(text.length, 5)]?.focus()
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-gray-500 text-center">
        کد ۶ رقمی به {method === 'email' ? 'ایمیل' : 'شماره'}{' '}
        <span dir="ltr" className="font-semibold text-gray-700">{value}</span> ارسال شد
      </p>

      {debugCode && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-center">
          🔑 کد debug (فقط در حالت توسعه): <span className="font-mono font-bold">{debugCode}</span>
        </p>
      )}

      <div className="flex justify-center gap-2" dir="ltr" onPaste={onPaste}>
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            ref={(el) => (inputs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={code[i] || ''}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Backspace' && !code[i] && inputs.current[i - 1]) inputs.current[i - 1].focus() }}
            className="w-11 h-12 text-center text-lg font-bold border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
          />
        ))}
      </div>

      <div className="text-center text-sm">
        {secondsLeft > 0 ? (
          <span className="text-gray-500">
            انقضای کد: <span className="font-mono font-bold text-primary-600">{toFa(Math.floor(secondsLeft / 60))}:{toFa(String(secondsLeft % 60).padStart(2, '0'))}</span>
          </span>
        ) : (
          <button type="button" onClick={onResend} disabled={resending}
            className="text-primary-600 font-semibold hover:underline disabled:opacity-50">
            {resending ? 'در حال ارسال...' : 'ارسال مجدد کد'}
          </button>
        )}
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg p-3">{error}</p>}

      <button type="submit" disabled={loading || code.length !== 6} className="btn-primary w-full justify-center py-3 gap-2">
        {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
        تأیید کد
      </button>

      <button type="button" onClick={onBack} className="w-full text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1.5">
        <ArrowRight size={14} /> تغییر روش
      </button>
    </form>
  )
}

function StepDetails({ method, form, setField, onSubmit, loading, error }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-gray-500 text-center mb-4">اطلاعات حساب را تکمیل کنید</p>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">نام و نام خانوادگی</label>
        <input value={form.name} onChange={(e) => setField('name', e.target.value)}
          className="input" placeholder="نام کامل" required />
      </div>

      {method === 'phone' && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">ایمیل (الزامی)</label>
          <input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)}
            className="input" dir="ltr" placeholder="example@email.com" required />
        </div>
      )}
      {method === 'email' && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">شماره موبایل (اختیاری)</label>
          <input type="tel" value={form.phone} onChange={(e) => setField('phone', e.target.value)}
            className="input" dir="ltr" placeholder="09123456789" />
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">رمز عبور</label>
        <input type="password" value={form.password} onChange={(e) => setField('password', e.target.value)}
          className="input" dir="ltr" placeholder="حداقل ۸ کاراکتر" required />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">تکرار رمز عبور</label>
        <input type="password" value={form.confirm} onChange={(e) => setField('confirm', e.target.value)}
          className="input" dir="ltr" placeholder="تکرار رمز" required />
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg p-3">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 gap-2">
        {loading ? <Loader2 size={18} className="animate-spin" /> : null}
        ثبت‌نام نهایی
      </button>
    </form>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { adoptSession } = useAuth()

  const [step, setStep] = useState(STEPS.CHANNEL)
  const [method, setMethod] = useState('email')
  const [value, setValue] = useState('')
  const [code, setCode] = useState('')
  const [registrationToken, setRegistrationToken] = useState('')
  const [debugCode, setDebugCode] = useState('')
  const [expiresIn, setExpiresIn] = useState(120)

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')

  async function submitChannel(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/register/request/', { method, value: value.trim() })
      setExpiresIn(data.expires_in_seconds || 120)
      setDebugCode(data.debug_code || '')
      setCode('')
      setStep(STEPS.CODE)
    } catch (err) {
      setError(err.response?.data?.detail || 'خطا در ارسال کد')
    } finally { setLoading(false) }
  }

  async function resendCode() {
    setResending(true); setError('')
    try {
      const { data } = await api.post('/auth/register/request/', { method, value: value.trim() })
      setExpiresIn(data.expires_in_seconds || 120)
      setDebugCode(data.debug_code || '')
      setCode('')
    } catch (err) {
      setError(err.response?.data?.detail || 'خطا در ارسال مجدد')
    } finally { setResending(false) }
  }

  async function submitCode(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/register/verify/', {
        method, value: value.trim(), code,
      })
      setRegistrationToken(data.registration_token)
      // Pre-fill the verified channel into form
      if (method === 'email') setField('email', value.trim())
      else setField('phone', value.trim())
      setStep(STEPS.DETAILS)
    } catch (err) {
      setError(err.response?.data?.detail || 'کد نامعتبر است')
    } finally { setLoading(false) }
  }

  async function submitDetails(e) {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('رمز عبور و تکرار آن مطابقت ندارند'); return
    }
    setLoading(true); setError('')
    try {
      const payload = {
        registration_token: registrationToken,
        name: form.name,
        password: form.password,
        confirm: form.confirm,
      }
      if (method === 'phone') payload.email = form.email
      if (method === 'email' && form.phone) payload.phone = form.phone
      const { data } = await api.post('/auth/register/complete/', payload)
      adoptSession(data)
      navigate('/account')
    } catch (err) {
      setError(err.response?.data?.detail || 'خطا در ثبت‌نام')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 justify-center mb-4">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <Cpu size={22} className="text-white" />
            </div>
            <span className="text-primary-700 font-black text-xl">Intel Shop</span>
          </Link>
          <h1 className="text-2xl font-black text-gray-800">ایجاد حساب کاربری</h1>
        </div>

        <StepIndicator step={step} />

        {step === STEPS.CHANNEL && (
          <StepChannel
            method={method} setMethod={setMethod}
            value={value} setValue={setValue}
            onSubmit={submitChannel} loading={loading} error={error}
          />
        )}
        {step === STEPS.CODE && (
          <StepCode
            method={method} value={value} code={code} setCode={setCode}
            onSubmit={submitCode} onResend={resendCode}
            onBack={() => { setStep(STEPS.CHANNEL); setError(''); setCode('') }}
            loading={loading} resending={resending} error={error}
            expiresIn={expiresIn} debugCode={debugCode}
          />
        )}
        {step === STEPS.DETAILS && (
          <StepDetails method={method} form={form} setField={setField}
            onSubmit={submitDetails} loading={loading} error={error}
          />
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          حساب دارید؟{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">وارد شوید</Link>
        </p>
      </div>
    </div>
  )
}
