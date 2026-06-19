import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart, Heart, User, Search, Menu, X, Cpu, GitCompare, ChevronDown,
} from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useAuth } from '../../context/AuthContext'
import { useCompare } from '../../context/CompareContext'
import { useCategories } from '../../context/CategoryContext'
import CartDrawer from '../cart/CartDrawer'
import MobileMenu from './MobileMenu'

function buildNavLinks(categories) {
  return [
    { label: 'خانه', to: '/' },
    {
      label: 'فروشگاه',
      to: '/shop',
      children: [
        { label: 'همه محصولات', to: '/shop' },
        ...categories.map((c) => ({
          label: c.name,
          to: `/shop?category=${encodeURIComponent(c.slug)}`,
        })),
      ],
    },
    { label: 'بلاگ', to: '/blog' },
    { label: 'درباره ما', to: '/about' },
    { label: 'تماس', to: '/contact' },
  ]
}

export default function Header() {
  const [cartOpen, setCartOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(null)
  const navigate = useNavigate()
  const navRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setDropdownOpen(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const { totalItems } = useCart()
  const { items: wishlistItems } = useWishlist()
  const { user } = useAuth()
  const { items: compareItems } = useCompare()
  const { categories } = useCategories()
  const navLinks = buildNavLinks(categories)

  function handleSearch(e) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <>
      {/* Main header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container-custom">
          <div className="flex items-center gap-4 py-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                <Cpu size={20} className="text-white" />
              </div>
              <div className="leading-tight">
                <span className="text-primary-700 font-black text-lg block leading-none">Intel</span>
                <span className="text-gray-500 text-xs block">Shop</span>
              </div>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 hidden sm:flex">
              <div className="relative w-full max-w-lg">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجوی محصول، برند..."
                  className="input pr-10 pl-4 text-sm"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600">
                  <Search size={16} />
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-1 mr-auto sm:mr-0">
              {compareItems.length > 0 && (
                <Link to="/compare" className="relative p-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                  <GitCompare size={20} />
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {compareItems.length}
                  </span>
                </Link>
              )}
              <Link to="/wishlist" className="relative p-2 rounded-lg text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors">
                <Heart size={20} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
              <Link to={user ? '/account' : '/login'} className="p-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                <User size={20} />
              </Link>
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>
              <button
                className="sm:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                onClick={() => setMobileOpen(true)}
              >
                <Menu size={22} />
              </button>
            </div>
          </div>

          {/* Nav */}
          <nav ref={navRef} className="hidden sm:flex items-center gap-1 pb-2 border-t border-gray-100 pt-2">
            {navLinks.map((link) =>
              link.children ? (
                <div
                  key={link.to}
                  className="relative"
                >
                  <button
                    onClick={() => setDropdownOpen(dropdownOpen === link.to ? null : link.to)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-medium"
                  >
                    {link.label}
                    <ChevronDown size={14} className={`transition-transform ${dropdownOpen === link.to ? 'rotate-180' : ''}`} />
                  </button>
                  {dropdownOpen === link.to && (
                    <div className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[160px] z-50">
                      {link.children.map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          onClick={() => setDropdownOpen(null)}
                          className="block px-4 py-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-medium"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} navLinks={navLinks} />
    </>
  )
}
