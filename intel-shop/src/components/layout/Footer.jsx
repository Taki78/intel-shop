import { Link } from 'react-router-dom'
import { Cpu, Phone, MapPin, Mail, Share2, Send } from 'lucide-react'
import useShopSettings from '../../utils/useShopSettings'
import { useCategories } from '../../context/CategoryContext'

const staticQuickLinks = [
  { label: 'بلاگ', to: '/blog' },
  { label: 'درباره ما', to: '/about' },
  { label: 'تماس با ما', to: '/contact' },
]

const userLinks = [
  { label: 'حساب کاربری', to: '/account' },
  { label: 'سبد خرید', to: '/cart' },
  { label: 'علاقه‌مندی‌ها', to: '/wishlist' },
  { label: 'پیگیری سفارش', to: '/account' },
]

export default function Footer() {
  const settings = useShopSettings()
  const { categories } = useCategories()
  const storeName = settings?.store_name || 'اینتل شاپ'
  const phone     = settings?.phone     || '۰۲۱-۱۲۳۴۵۶۷۸'
  const email     = settings?.email     || 'info@intelshop.ir'
  const address   = settings?.address   || 'تهران، خیابان ولیعصر، بازار رایانه'

  const quickLinks = [
    ...categories.map((c) => ({
      label: c.name,
      to: `/shop?category=${encodeURIComponent(c.slug)}`,
    })),
    ...staticQuickLinks,
  ]

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 mt-16">
      <div className="container-custom">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                <Cpu size={20} className="text-white" />
              </div>
              <div>
                <span className="text-white font-black text-lg block leading-none">Intel</span>
                <span className="text-gray-400 text-xs">Shop</span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              فروشگاه تخصصی لپ‌تاپ و قطعات کامپیوتر. ارائه بهترین محصولات با مناسب‌ترین قیمت.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                <Share2 size={16} />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors">
                <Send size={16} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-bold mb-4">دسترسی سریع</h4>
            <ul className="space-y-2">
              {quickLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* User links */}
          <div>
            <h4 className="text-white font-bold mb-4">حساب کاربری</h4>
            <ul className="space-y-2">
              {userLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-gray-400 hover:text-primary-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-4">تماس با ما</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin size={15} className="text-primary-400 mt-0.5 shrink-0" />
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Phone size={15} className="text-primary-400 shrink-0" />
                <span>{phone}</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Mail size={15} className="text-primary-400 shrink-0" />
                <span>{email}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-800 pt-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div>
              <h4 className="text-white font-bold mb-1">خبرنامه {storeName}</h4>
              <p className="text-sm text-gray-400">از آخرین تخفیفات و محصولات جدید باخبر شوید</p>
            </div>
            <form className="flex gap-2 w-full sm:w-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="ایمیل شما"
                className="input bg-gray-800 border-gray-700 text-white placeholder-gray-500 flex-1 sm:w-64"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">عضویت</button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
          <p>© ۱۴۰۳ {storeName}. تمامی حقوق محفوظ است.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300 transition-colors">قوانین و مقررات</a>
            <a href="#" className="hover:text-gray-300 transition-colors">حریم خصوصی</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
