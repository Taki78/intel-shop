import { useState } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'

export default function ImageGallery({ images = [], name = '' }) {
  const [active, setActive] = useState(0)

  function prev() {
    setActive((i) => (i === 0 ? images.length - 1 : i - 1))
  }
  function next() {
    setActive((i) => (i === images.length - 1 ? 0 : i + 1))
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative bg-gray-50 rounded-2xl overflow-hidden aspect-[4/3]">
        <img
          src={images[active]}
          alt={name}
          className="w-full h-full object-contain p-4"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={next}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                active === i ? 'border-primary-600' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img src={img} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
