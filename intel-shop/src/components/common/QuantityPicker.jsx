import { Minus, Plus } from 'lucide-react'

export default function QuantityPicker({ qty, onInc, onDec, max }) {
  const maxed = max !== undefined && qty >= max

  return (
    <div className="inline-flex items-center rounded-xl bg-gray-50 border border-gray-200 p-1 select-none">
      {/* Plus — first child = right side in RTL */}
      <button
        onClick={onInc}
        disabled={maxed}
        aria-label="افزایش تعداد"
        className="w-8 h-8 flex items-center justify-center rounded-lg text-primary-600 hover:bg-primary-600 hover:text-white active:scale-90 transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-primary-600"
      >
        <Plus size={15} strokeWidth={2.5} />
      </button>

      <span className="px-3 min-w-[2.25rem] text-center text-sm font-bold text-gray-800 tabular-nums">
        {qty}
      </span>

      {/* Minus — last child = left side in RTL */}
      <button
        onClick={onDec}
        aria-label="کاهش تعداد"
        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-red-500 hover:text-white active:scale-90 transition-all"
      >
        <Minus size={15} strokeWidth={2.5} />
      </button>
    </div>
  )
}
