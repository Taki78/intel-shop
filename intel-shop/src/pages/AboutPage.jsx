import { useEffect, useState } from 'react'
import {
  Shield, Award, Users, ThumbsUp, Trophy, Star, Truck, Package, Loader2,
} from 'lucide-react'
import api from '../utils/api'

const ICON_MAP = {
  shield: Shield, award: Award, users: Users, 'thumbs-up': ThumbsUp,
  trophy: Trophy, star: Star, truck: Truck, package: Package,
}

export default function AboutPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/content/about/')
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    )
  }
  if (!data) return null

  const paragraphs = (data.story_body || '').split(/\n\s*\n/).filter(p => p.trim())

  return (
    <div className="py-8">
      <div className="container-custom">
        {/* Hero */}
        <div className="bg-gradient-to-l from-primary-700 to-primary-500 rounded-3xl p-10 text-white text-center mb-12">
          <h1 className="text-3xl font-black mb-3">{data.hero_title}</h1>
          {data.hero_subtitle && (
            <p className="text-white/80 max-w-xl mx-auto whitespace-pre-wrap">{data.hero_subtitle}</p>
          )}
        </div>

        {/* Stats */}
        {data.stats?.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {data.stats.map((s, i) => {
              const Icon = ICON_MAP[s.icon] || Star
              return (
                <div key={i} className="card p-6 text-center hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon size={22} className="text-primary-600" />
                  </div>
                  <p className="text-3xl font-black text-primary-700 mb-1">{s.value}</p>
                  <p className="text-sm text-gray-500">{s.label}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* Story + Why */}
        <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
          <div>
            <h2 className="text-2xl font-black text-gray-800 mb-4">{data.story_title}</h2>
            {paragraphs.map((p, i) => (
              <p key={i} className="text-gray-600 leading-relaxed mb-4 whitespace-pre-wrap">{p}</p>
            ))}
          </div>

          {data.why_items?.length > 0 && (
            <div className="bg-primary-50 rounded-2xl p-8">
              <h3 className="font-bold text-gray-800 mb-4">{data.why_title}</h3>
              <ul className="space-y-3">
                {data.why_items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
