import { Star } from 'lucide-react'

export default function StarRating({ rating, interactive = false, onRate, size = 16 }) {
  const stars = [1, 2, 3, 4, 5]

  return (
    <div className="flex gap-0.5">
      {stars.map((star) => (
        <button
          key={star}
          type={interactive ? 'button' : undefined}
          onClick={interactive ? () => onRate?.(star) : undefined}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
          disabled={!interactive}
        >
          <Star
            size={size}
            className={star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
          />
        </button>
      ))}
    </div>
  )
}
