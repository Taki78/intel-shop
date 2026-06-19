import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Heart, GitCompare, Shield, Truck, MessageSquare, Loader2 } from 'lucide-react'
import Breadcrumb from '../components/common/Breadcrumb'
import ImageGallery from '../components/product/ImageGallery'
import SpecsTable from '../components/product/SpecsTable'
import ReviewSection from '../components/product/ReviewSection'
import ProductCard from '../components/common/ProductCard'
import StarRating from '../components/common/StarRating'
import QuantityPicker from '../components/common/QuantityPicker'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useCompare } from '../context/CompareContext'
import { formatPrice, formatPriceShort } from '../utils/price'
import api from '../utils/api'
import useShopSettings from '../utils/useShopSettings'
import { useCategories } from '../context/CategoryContext'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const shopSettings = useShopSettings()
  const { getName } = useCategories()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const { addItem } = useCart()
  const { toggle, isWished } = useWishlist()
  const { addToCompare, isComparing } = useCompare()

  useEffect(() => {
    setLoading(true)
    setProduct(null)
    setQty(1)
    api.get(`/products/${slug}/`)
      .then(({ data }) => {
        setProduct(data)
        api.get('/products/', { params: { category: data.category, page_size: 5 } })
          .then(({ data: rel }) => {
            const items = (rel.results ?? rel)
            setRelated(items.filter(p => p.slug !== slug).slice(0, 4))
          })
          .catch(() => {})
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={28} className="animate-spin text-primary-400" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container-custom py-20 text-center">
        <p className="text-gray-500">محصول یافت نشد</p>
        <Link to="/shop" className="btn-primary mt-4">بازگشت به فروشگاه</Link>
      </div>
    )
  }

  const discount = product.discount_percent || 0

  function handleAddToCart() {
    for (let i = 0; i < qty; i++) addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="py-8">
      <div className="container-custom">
        <Breadcrumb
          items={[
            { label: 'فروشگاه', href: '/shop' },
            { label: getName(product.category), href: `/shop?category=${encodeURIComponent(product.category)}` },
            { label: product.name },
          ]}
        />

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Gallery */}
          <div>
            <ImageGallery images={product.images} name={product.name} />
          </div>

          {/* Info */}
          <div>
            {/* Badges */}
            <div className="flex gap-2 mb-3">
              {product.condition === 'new' ? (
                <span className="badge-new">نو</span>
              ) : (
                <span className="badge-used">دست دوم</span>
              )}
              {discount > 0 && <span className="badge-sale">{discount}٪ تخفیف</span>}
            </div>

            <h1 className="text-2xl font-black text-gray-900 mb-2 leading-tight">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={product.rating} size={16} />
              <span className="text-sm text-gray-500">{product.rating} ({product.reviews_count} نظر)</span>
              <a href="#reviews" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                <MessageSquare size={12} /> مشاهده نظرات
              </a>
            </div>

            {/* Price */}
            <div className="bg-primary-50 rounded-2xl p-4 mb-5">
              {product.discount_price ? (
                <div>
                  <span className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</span>
                  <p className="text-3xl font-black text-primary-700">{formatPrice(product.discount_price)}</p>
                </div>
              ) : (
                <p className="text-3xl font-black text-primary-700">{formatPrice(product.price)}</p>
              )}
            </div>

            {/* Warranty & condition */}
            <div className="flex flex-wrap gap-2 mb-5">
              {product.warranty && (
                <span className="flex items-center gap-1.5 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
                  <Shield size={14} /> {product.warranty}
                </span>
              )}
              {product.condition_detail && (
                <span className="text-sm text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg">
                  {product.condition_detail}
                </span>
              )}
            </div>

            {/* Stock */}
            {product.stock === 0 ? (
              <p className="text-red-500 font-semibold mb-4">ناموجود</p>
            ) : product.stock <= 3 ? (
              <p className="text-amber-500 text-sm font-semibold mb-4">فقط {product.stock} عدد در انبار</p>
            ) : (
              <p className="text-green-600 text-sm font-semibold mb-4">موجود در انبار</p>
            )}

            {/* Qty + Add to cart */}
            {product.stock > 0 && (
              <div className="flex gap-3 mb-4">
                <QuantityPicker
                  qty={qty}
                  onInc={() => setQty((q) => Math.min(q + 1, product.stock))}
                  onDec={() => setQty((q) => Math.max(q - 1, 1))}
                  max={product.stock}
                />
                <button
                  onClick={handleAddToCart}
                  className={`btn-primary flex-1 justify-center ${added ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                  <ShoppingCart size={18} />
                  {added ? 'اضافه شد!' : 'افزودن به سبد خرید'}
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => toggle(product)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${
                  isWished(product.id)
                    ? 'border-red-400 text-red-500 bg-red-50'
                    : 'border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-500'
                }`}
              >
                <Heart size={16} fill={isWished(product.id) ? 'currentColor' : 'none'} />
                {isWished(product.id) ? 'در علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
              </button>
              <button
                onClick={() => addToCompare(product)}
                className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${
                  isComparing(product.id)
                    ? 'border-primary-600 text-primary-600 bg-primary-50'
                    : 'border-gray-200 text-gray-600 hover:border-primary-400'
                }`}
              >
                <GitCompare size={16} />
              </button>
            </div>

            {/* Delivery note */}
            <div className="mt-5 flex items-start gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl p-3">
              <Truck size={16} className="text-primary-500 mt-0.5 shrink-0" />
              <span>
                ارسال به سراسر ایران
                {shopSettings?.free_shipping_enabled && shopSettings?.free_shipping_over > 0 &&
                  ` | رایگان برای خریدهای بالای ${formatPriceShort(shopSettings.free_shipping_over)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Specs */}
        {product.specs && (
          <div className="mb-12">
            <SpecsTable specs={product.specs} />
          </div>
        )}

        {/* Reviews */}
        <div id="reviews" className="mb-12">
          <ReviewSection
            slug={slug}
            initialReviews={product.reviews ?? []}
            rating={product.rating}
            reviews_count={product.reviews_count}
          />
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h2 className="section-title">محصولات مشابه</h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
