import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, User, Loader2 } from 'lucide-react'
import api from '../utils/api'
import Breadcrumb from '../components/common/Breadcrumb'

export default function BlogPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/blog/')
      .then(({ data }) => setPosts(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={28} className="animate-spin text-primary-400" />
      </div>
    )
  }

  if (!posts.length) {
    return <div className="py-20 text-center text-gray-500">مقاله‌ای یافت نشد</div>
  }

  const [featured, ...rest] = posts

  return (
    <div className="py-8">
      <div className="container-custom">
        <Breadcrumb items={[{ label: 'بلاگ' }]} />
        <h1 className="text-2xl font-black text-gray-800 mb-6">بلاگ اینتل شاپ</h1>

        {/* Featured */}
        <Link to={`/blog/${featured.slug}`} className="card flex flex-col md:flex-row overflow-hidden group mb-8 hover:shadow-lg transition-shadow">
          <img src={featured.cover} alt={featured.title} className="w-full md:w-80 h-48 md:h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="p-6 flex flex-col justify-center">
            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-full w-fit mb-3">{featured.category}</span>
            <h2 className="text-xl font-black text-gray-800 mb-2 group-hover:text-primary-600 transition-colors">{featured.title}</h2>
            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{featured.excerpt}</p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1"><User size={12} />{featured.author}</span>
              <span className="flex items-center gap-1"><Clock size={12} />{featured.read_time}</span>
              <span>{featured.jalali_date}</span>
            </div>
          </div>
        </Link>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="card group hover:shadow-lg transition-shadow">
              <div className="overflow-hidden">
                <img src={post.cover} alt={post.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4">
                <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{post.category}</span>
                <h3 className="font-bold text-gray-800 mt-2 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">{post.title}</h3>
                <p className="text-gray-500 text-xs line-clamp-2 mb-3">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Clock size={11} />{post.read_time}</span>
                  <span>{post.jalali_date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
