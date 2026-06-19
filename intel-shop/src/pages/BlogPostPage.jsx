import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Clock, User, ArrowRight, Loader2 } from 'lucide-react'
import api from '../utils/api'
import Breadcrumb from '../components/common/Breadcrumb'

export default function BlogPostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/blog/${slug}/`)
      .then(({ data }) => setPost(data))
      .catch(() => setPost(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={28} className="animate-spin text-primary-400" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500 mb-4">مقاله یافت نشد</p>
        <Link to="/blog" className="btn-primary">بازگشت به بلاگ</Link>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="container-custom max-w-3xl">
        <Breadcrumb items={[{ label: 'بلاگ', href: '/blog' }, { label: post.title }]} />

        <img src={post.cover} alt={post.title} className="w-full h-64 object-cover rounded-2xl mb-6" />

        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
          <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs font-bold">{post.category}</span>
          <span className="flex items-center gap-1"><User size={13} />{post.author}</span>
          <span className="flex items-center gap-1"><Clock size={13} />{post.read_time}</span>
          <span>{post.jalali_date}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">{post.title}</h1>
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">{post.excerpt}</p>

        <div className="prose prose-sm max-w-none text-gray-700 leading-loose whitespace-pre-line">
          {post.content}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100">
          <Link to="/blog" className="flex items-center gap-2 text-primary-600 font-semibold text-sm hover:gap-3 transition-all">
            <ArrowRight size={16} /> بازگشت به همه مقالات
          </Link>
        </div>
      </div>
    </div>
  )
}
