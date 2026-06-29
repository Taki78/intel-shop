import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Cpu, Eye, EyeOff, CheckCircle, ArrowRight, Loader2, RefreshCw } from 'lucide-react'
import api from '../utils/api'

const RESEND_SECONDS = 600

function Logo() {
  return (
    <Link to="/" className="inline-flex items-center gap-2 justify-center mb-6">
      <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
        <Cpu size={22} className="text-white" />
      </div>
      <span className="text-primary-700 font-black text-xl">Intel Shop</span>
    </Link>
  )
}

function StepDots({ step }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map(n => (
        <div key={n} className={`rounded-full transition-all duration-300 ${
          n === step ? 'w-6 h-2.5 bg-primary-600' : n < step ? 'w-2.5 h-2.5 bg-primary-300' : 'w-2.5 h-2.5 bg-gray-200'
        }`} />
      ))}
    </div>
  )
}

function OTPInput({ value, onChange, disabled }) {
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()]

  function handleChange(i, e) {
    const ch = e.target.value.replace(/\D/g, '').slice(-1)
    const arr = (value || '      ').split('')
    arr[i] = ch || ' '
    onChange(arr.join(''))
    if (ch && i < 5) refs[i + 1].current?.focus()
  }

  function handleKey(i, e) {
    if (e.key === 'Backspace') {
      const arr = (value || '      ').split('')
      if (arr[i]?.trim()) {
        arr[i] = ' '
        onChange(arr.join(''))
      } else if (i > 0) {
        refs[i - 1].current?.focus()
      }
    }
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(text.padEnd(6, ' ').slice(0, 6))
    refs[Math.min(text.length, 5)].current?.focus()
    e.preventDefault()
  }

  const digits = (value || '      ').split('').slice(0, 6)

  return (
    <div className="flex gap-2.5 justify-center" dir="ltr">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`w-11 h-13 text-center text-xl font-black border-2 rounded-xl transition-colors outline-none
            ${d.trim() ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-800'}
            focus:border-primary-500 focus:bg-primary-50 disabled:opacity-50`}
          style={{ height: '52px' }}
        />
      ))}
    </div>
  )
}

export default function ForgotPasswordPage() {
  const [step, setStep]         = useState(1)
  const method                  = 'phone'
  const [value, setValue]       = useState('')
  const [otp, setOtp]           = useState('      ')
  const [resetToken, setToken]  = useState('')
  const [newPass, setNewPass]   = useState('')
  const [confirmPass, setConf]  = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [testCode, setTestCode] = useState('')
  const [countdown, setCD]      = useState(0)
  const [done, setDone]         = useState(false)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCD(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const mmss = `${String(Math.floor(countdown / 60)).padStart(2, '0')}:${String(countdown % 60).padStart(2, '0')}`
  const otpFilled = otp.trim().length === 6

  async function sendOTP() {
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/password-reset/request/', { method, value })
      setTestCode(data.debug_code || '')
      setOtp('      ')
      setCD(RESEND_SECONDS)
      setStep(2)
    } catch (e) {
      setError(e.response?.data?.detail || 'خطا در ارسال کد')
    } finally {
      setLoading(false)
    }
  }

  async function verifyOTP() {
    if (!otpFilled) { setError('کد ۶ رقمی را کامل وارد کنید'); return }
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/password-reset/verify/', { method, value, code: otp.trim() })
      setToken(data.reset_token)
      setStep(3)
    } catch (e) {
      setError(e.response?.data?.detail || 'کد اشتباه یا منقضی شده است')
    } finally {
      setLoading(false)
    }
  }

  async function confirmReset() {
    if (newPass !== confirmPass) { setError('تکرار رمز عبور مطابقت ندارد'); return }
    if (newPass.length < 6) { setError('رمز عبور حداقل ۶ کاراکتر باشد'); return }
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/password-reset/confirm/', { reset_token: resetToken, new_password: newPass })
      setDone(true)
    } catch (e) {
      setError(e.response?.data?.detail || 'خطا در تغییر رمز عبور')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <Logo />
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-black text-gray-800 mb-2">رمز عبور تغییر کرد!</h2>
          <p className="text-gray-500 text-sm mb-6">اکنون می‌توانید با رمز جدید وارد شوید.</p>
          <Link to="/login" className="btn-primary justify-center w-full py-3 block text-center">
            ورود به حساب
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center">
          <Logo />
        </div>

        <StepDots step={step} />

        {/* ── Step 1: انتخاب روش ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="text-center">
              <h1 className="text-2xl font-black text-gray-800">بازیابی رمز عبور</h1>
              <p className="text-gray-500 text-sm mt-1">روش تأیید هویت را انتخاب کنید</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">شماره موبایل ثبت‌شده</label>
              <input
                type="tel"
                value={value}
                onChange={e => { setValue(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && value && sendOTP()}
                placeholder="09xxxxxxxxx"
                className="input"
                dir="ltr"
                autoFocus
              />
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl p-3">{error}</p>}

            <button
              type="button"
              onClick={sendOTP}
              disabled={loading || !value.trim()}
              className="btn-primary w-full justify-center py-3"
            >
              {loading ? <Loader2 size={17} className="animate-spin" /> : 'ارسال کد تأیید'}
            </button>

            <p className="text-center text-sm text-gray-500">
              <Link to="/login" className="text-primary-600 font-semibold hover:underline inline-flex items-center gap-1">
                <ArrowRight size={14} /> بازگشت به ورود
              </Link>
            </p>
          </div>
        )}

        {/* ── Step 2: وارد کردن کد ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center">
              <h1 className="text-2xl font-black text-gray-800">کد تأیید</h1>
              <p className="text-gray-500 text-sm mt-1">
                کد ارسال‌شده به{' '}
                <span className="font-semibold text-gray-700 font-mono" dir="ltr">{value}</span>
                {' '}را وارد کنید
              </p>
            </div>

            {testCode && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                <p className="text-xs text-amber-600 font-medium mb-1">🔧 کد تستی (فقط در حالت توسعه)</p>
                <p className="text-3xl font-black text-amber-700 tracking-[0.3em] font-mono" dir="ltr">
                  {testCode}
                </p>
              </div>
            )}

            <OTPInput value={otp} onChange={setOtp} disabled={loading} />

            {countdown > 0 && (
              <p className="text-center text-sm text-gray-400">
                اعتبار کد:{' '}
                <span className="font-mono font-semibold text-gray-600">{mmss}</span>
              </p>
            )}

            {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl p-3 text-center">{error}</p>}

            <button
              type="button"
              onClick={verifyOTP}
              disabled={loading || !otpFilled}
              className="btn-primary w-full justify-center py-3"
            >
              {loading ? <Loader2 size={17} className="animate-spin" /> : 'تأیید کد'}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => { setStep(1); setOtp('      '); setError('') }}
                className="text-gray-500 hover:text-gray-700 inline-flex items-center gap-1"
              >
                <ArrowRight size={14} /> تغییر روش
              </button>
              <button
                type="button"
                onClick={sendOTP}
                disabled={loading || countdown > 0}
                className={`inline-flex items-center gap-1 font-semibold transition-colors ${
                  countdown > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-primary-600 hover:text-primary-700'
                }`}
              >
                <RefreshCw size={14} />
                {countdown > 0 ? `ارسال مجدد (${mmss})` : 'ارسال مجدد کد'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: رمز جدید ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="text-center">
              <h1 className="text-2xl font-black text-gray-800">رمز عبور جدید</h1>
              <p className="text-gray-500 text-sm mt-1">رمز عبور جدید خود را تعیین کنید</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">رمز عبور جدید</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={newPass}
                  onChange={e => { setNewPass(e.target.value); setError('') }}
                  placeholder="حداقل ۶ کاراکتر"
                  className="input pl-10"
                  dir="ltr"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">تکرار رمز عبور</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={confirmPass}
                onChange={e => { setConf(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && confirmReset()}
                placeholder="رمز عبور را مجدداً وارد کنید"
                className="input"
                dir="ltr"
              />
              {confirmPass && newPass !== confirmPass && (
                <p className="text-xs text-red-500 mt-1">رمز عبور مطابقت ندارد</p>
              )}
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl p-3">{error}</p>}

            <button
              type="button"
              onClick={confirmReset}
              disabled={loading || !newPass || !confirmPass}
              className="btn-primary w-full justify-center py-3"
            >
              {loading ? <Loader2 size={17} className="animate-spin" /> : 'ذخیره رمز عبور'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
