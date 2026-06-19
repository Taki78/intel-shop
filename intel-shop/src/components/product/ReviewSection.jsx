import { useState } from 'react'
import { Star, ThumbsUp, LogIn, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import StarRating from '../common/StarRating'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

export default function ReviewSection({ slug, initialReviews = [], rating, reviews_count }) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState(initialReviews)
  const [formOpen, setFormOpen] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [likingIds, setLikingIds] = useState(new Set())

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    setSubmitError('')
    try {
      await api.post(`/products/${slug}/reviews/`, { rating: newRating, text: text.trim() })
      setSubmitSuccess(true)
      setText('')
      setNewRating(5)
      setFormOpen(false)
    } catch (err) {
      const msg = err.response?.data?.detail || 'خطا در ثبت نظر'
      setSubmitError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLike(reviewId) {
    if (!user) return
    if (likingIds.has(reviewId)) return
    setLikingIds((prev) => new Set(prev).add(reviewId))
    try {
      const { data } = await api.post(`/products/reviews/${reviewId}/like/`)
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, likes_count: data.likes_count, user_liked: data.liked } : r
        )
      )
    } catch { /* ignore */ } finally {
      setLikingIds((prev) => { const s = new Set(prev); s.delete(reviewId); return s })
    }
  }

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : parseFloat(rating) || 0
  const counts = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: reviews.filter((r) => r.rating === s).length,
  }))
  const totalForBar = reviews.length || reviews_count || 1

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-800 text-lg">نظرات کاربران</h3>
          {user ? (
            !submitSuccess && (
              <button onClick={() => setFormOpen(!formOpen)} className="btn-outline text-sm py-2">
                {formOpen ? 'بستن فرم' : 'ثبت نظر'}
              </button>
            )
          ) : (
            <Link to="/login" className="flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:underline">
              <LogIn size={14} /> برای ثبت نظر وارد شوید
            </Link>
          )}
        </div>

        {/* Summary */}
        <div className="flex flex-col sm:flex-row gap-6 p-4 bg-primary-50 rounded-xl mb-5">
          <div className="text-center">
            <div className="text-4xl font-black text-primary-700 mb-1">
              {avgRating.toFixed(1)}
            </div>
            <StarRating rating={avgRating} size={18} />
            <p className="text-xs text-gray-500 mt-1">{reviews_count ?? reviews.length} نظر</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {counts.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-4 text-gray-600">{star}</span>
                <Star size={11} className="text-amber-400 fill-amber-400" />
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-amber-400 h-1.5 rounded-full transition-all"
                    style={{ width: `${(count / totalForBar) * 100}%` }}
                  />
                </div>
                <span className="text-gray-500 w-4">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Success message after submit */}
        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5 text-sm text-green-700">
            نظر شما با موفقیت ثبت شد و پس از تأیید مدیریت نمایش داده می‌شود.
          </div>
        )}

        {/* Add review form */}
        {formOpen && user && !submitSuccess && (
          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4 mb-5 space-y-3">
            <h4 className="font-semibold text-gray-700">نظر شما</h4>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">امتیاز</label>
              <StarRating rating={newRating} interactive onRate={setNewRating} size={24} />
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="نظر خود را بنویسید..."
              rows={3}
              className="input text-sm resize-none"
              required
            />
            {submitError && <p className="text-red-500 text-xs">{submitError}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="btn-primary text-sm py-2 min-w-[80px]">
                {submitting ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'ثبت نظر'}
              </button>
              <button type="button" onClick={() => setFormOpen(false)} className="btn-ghost text-sm py-2">انصراف</button>
            </div>
          </form>
        )}

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">هنوز نظری ثبت نشده است</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">
                      {(r.user_name || '؟').charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{r.user_name || 'کاربر'}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(r.created_at).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={r.rating} size={13} />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{r.text}</p>
                <div className="flex items-center gap-2 mt-2">
                  {user ? (
                    <button
                      onClick={() => handleLike(r.id)}
                      disabled={likingIds.has(r.id)}
                      className={`flex items-center gap-1 text-xs transition-colors ${
                        r.user_liked
                          ? 'text-primary-600 font-semibold'
                          : 'text-gray-400 hover:text-primary-600'
                      }`}
                    >
                      <ThumbsUp size={12} fill={r.user_liked ? 'currentColor' : 'none'} />
                      مفید بود ({r.likes_count ?? 0})
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <ThumbsUp size={12} /> مفید بود ({r.likes_count ?? 0})
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
