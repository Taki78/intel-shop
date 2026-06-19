import { Link } from 'react-router-dom'
import { GitCompare, X } from 'lucide-react'
import { useCompare } from '../../context/CompareContext'

export default function CompareFloatingBar() {
  const { items, removeFromCompare, clear } = useCompare()
  if (items.length === 0) return null

  return (
    <div className="fixed bottom-0 right-0 left-0 z-50 bg-primary-700 text-white px-4 py-3 shadow-2xl">
      <div className="container-custom flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm font-bold">
          <GitCompare size={18} />
          <span>مقایسه ({items.length}/3)</span>
        </div>
        <div className="flex gap-2 flex-1 flex-wrap">
          {items.map((p) => (
            <div key={p.id} className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1.5 text-sm">
              <span className="line-clamp-1 max-w-[120px]">{p.name}</span>
              <button onClick={() => removeFromCompare(p.id)} className="hover:text-red-300 transition-colors">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mr-auto">
          <button onClick={clear} className="text-xs text-white/70 hover:text-white transition-colors">
            پاک کردن
          </button>
          {items.length >= 2 && (
            <Link to="/compare" className="bg-white text-primary-700 font-bold text-sm px-4 py-1.5 rounded-lg hover:bg-primary-50 transition-colors">
              مقایسه کن
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
