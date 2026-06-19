import { Heart } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'
import ProductCard from '../components/common/ProductCard'
import EmptyState from '../components/common/EmptyState'

export default function WishlistPage() {
  const { items } = useWishlist()

  return (
    <div className="py-8">
      <div className="container-custom">
        <h1 className="text-2xl font-black text-gray-800 mb-6">علاقه‌مندی‌ها ({items.length})</h1>
        {items.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="لیست علاقه‌مندی‌ها خالی است"
            description="محصولاتی که دوست دارید را ذخیره کنید"
            actionLabel="مشاهده فروشگاه"
            actionTo="/shop"
          />
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
