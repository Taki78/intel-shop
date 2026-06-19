import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import ProductCard from '../common/ProductCard'
import api from '../../utils/api'

export default function FeaturedProducts({ title = 'محصولات پیشنهادی', categoryLink = '/shop' }) {
  const [products, setProducts] = useState([])

  useEffect(() => {
    api.get('/products/', { params: { featured: true, page_size: 6 } })
      .then(({ data }) => setProducts(data.results ?? []))
      .catch(() => {})
  }, [])

  if (!products.length) return null

  return (
    <section className="py-10 bg-white">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="section-title mb-0">{title}</h2>
            <p className="text-gray-500 text-sm mt-1">بهترین انتخاب‌های اینتل شاپ</p>
          </div>
          <Link to={categoryLink} className="flex items-center gap-1 text-sm text-primary-600 font-semibold hover:gap-2 transition-all">
            مشاهده همه <ArrowLeft size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  )
}
