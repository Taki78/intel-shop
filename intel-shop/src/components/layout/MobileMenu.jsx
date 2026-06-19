import { X, ChevronDown, Cpu, Heart, User, GitCompare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function MobileMenu({ open, onClose, navLinks }) {
  const [expanded, setExpanded] = useState('/shop')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] sm:hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />

      {/* Drawer — right side */}
      <div className="absolute top-0 right-0 bottom-0 bg-white w-[82%] max-w-xs shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-l from-primary-700 to-primary-600 text-white">
          <Link to="/" onClick={onClose} className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white/15 backdrop-blur rounded-lg flex items-center justify-center">
              <Cpu size={20} />
            </div>
            <div className="leading-tight">
              <span className="font-black text-lg block leading-none">Intel</span>
              <span className="text-white/70 text-xs">Shop</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            aria-label="بستن منو"
            className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3">
          {navLinks.map((link) => (
            <div key={link.to}>
              {link.children ? (
                <>
                  <button
                    onClick={() => setExpanded(expanded === link.to ? null : link.to)}
                    className="w-full flex items-center justify-between px-3 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors font-medium"
                  >
                    {link.label}
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 ${expanded === link.to ? 'rotate-180 text-primary-600' : 'text-gray-400'}`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${expanded === link.to ? 'max-h-60' : 'max-h-0'}`}
                  >
                    <div className="mr-4 border-r-2 border-primary-100 pr-3 my-1 space-y-0.5">
                      {link.children.map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          onClick={onClose}
                          className="block py-2 px-2 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50/60 rounded-lg transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  to={link.to}
                  onClick={onClose}
                  className="block px-3 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors font-medium"
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Quick actions footer */}
        <div className="border-t border-gray-100 p-3">
          <div className="grid grid-cols-3 gap-2">
            <Link
              to="/account"
              onClick={onClose}
              className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-gray-50 hover:bg-primary-50 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <User size={18} />
              <span className="text-[11px]">حساب من</span>
            </Link>
            <Link
              to="/wishlist"
              onClick={onClose}
              className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-500 transition-colors"
            >
              <Heart size={18} />
              <span className="text-[11px]">علاقه‌مندی</span>
            </Link>
            <Link
              to="/compare"
              onClick={onClose}
              className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-gray-50 hover:bg-primary-50 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <GitCompare size={18} />
              <span className="text-[11px]">مقایسه</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
