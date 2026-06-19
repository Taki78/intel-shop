import { useState } from 'react'
import { Tag, CheckCircle, XCircle, Loader2, X } from 'lucide-react'
import { useCart } from '../../context/CartContext'

export default function DiscountInput() {
  const [code, setCode]     = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const { applyDiscount, discount, clearDiscount } = useCart()

  async function handleApply(e) {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    setResult(null)
    const res = await applyDiscount(code.trim())
    setResult(res)
    setLoading(false)
    if (res.valid) setCode('')
  }

  if (discount) {
    return (
      <div className="flex items-center justify-between gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="shrink-0" />
          <span>کد <strong dir="ltr">{discount.code}</strong> — {discount.label} تخفیف اعمال شد</span>
        </div>
        <button
          onClick={() => { clearDiscount(); setResult(null) }}
          className="p-0.5 rounded text-green-400 hover:text-red-500 transition-colors"
          title="حذف کد تخفیف"
        >
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleApply} className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="کد تخفیف"
            className="input pr-9 text-sm"
            dir="ltr"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="btn-outline py-2 px-4 text-sm whitespace-nowrap disabled:opacity-60"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : 'اعمال'}
        </button>
      </div>
      {result && !result.valid && (
        <div className="flex items-center gap-1.5 text-red-500 text-xs">
          <XCircle size={13} className="shrink-0" />
          <span>{result.message || 'کد تخفیف معتبر نیست'}</span>
        </div>
      )}
    </form>
  )
}
