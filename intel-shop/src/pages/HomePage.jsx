import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, TrendingUp } from 'lucide-react'
import HeroSlider from '../components/home/HeroSlider'
import TrustBar from '../components/home/TrustBar'
import CategoryGrid from '../components/home/CategoryGrid'
import FeaturedProducts from '../components/home/FeaturedProducts'
import ProductCard from '../components/common/ProductCard'
import api from '../utils/api'

export default function HomePage() {
  const [bestSellers, setBestSellers] = useState([])

  useEffect(() => {
    api.get('/products/', { params: { page_size: 4, ordering: '-rating' } })
      .then(({ data }) => setBestSellers(data.results ?? []))
      .catch(() => {})
  }, [])

  return (
    <div>
      <HeroSlider />
      <TrustBar />
      <CategoryGrid />
      <FeaturedProducts title="محصولات پیشنهادی" />

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="py-10">
          <div className="container-custom">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp size={22} className="text-primary-600" />
                <div>
                  <h2 className="section-title mb-0">پرفروش‌ترین‌ها</h2>
                  <p className="text-gray-500 text-sm mt-0.5">محصولات محبوب کاربران</p>
                </div>
              </div>
              <Link to="/shop" className="flex items-center gap-1 text-sm text-primary-600 font-semibold hover:gap-2 transition-all">
                مشاهده همه <ArrowLeft size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {bestSellers.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
