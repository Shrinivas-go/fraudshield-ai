import { useState, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'

export default function Navbar() {
  const { user, logout, setShowAuthModal } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
          : 'bg-white'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-sage-600 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-white">
              <path d="M9 1L2 5v4c0 4.42 2.98 8.56 7 9.6 4.02-1.04 7-5.18 7-9.6V5L9 1z" fill="currentColor" opacity="0.9"/>
              <path d="M8 8.5L6.5 10L8 11.5L11.5 8L10 6.5L8 8.5z" fill="white" opacity="0.6"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[17px] font-semibold tracking-tight text-charcoal-900 leading-none">FraudShield</span>
            <span className="text-[11px] font-medium text-sage-500 tracking-widest uppercase leading-none mt-0.5">Security</span>
          </div>
        </a>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#analyze"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[14px] font-medium text-sage-700 bg-sage-50 border border-sage-200 rounded-lg hover:bg-sage-100 hover:border-sage-300 transition-all duration-150"
          >
            Try Demo
          </a>

          {user ? (
            /* Logged in — profile dropdown */
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="inline-flex items-center gap-2 px-4 py-2 text-[14px] font-medium text-charcoal-700 bg-sand-50 border border-sand-200 rounded-lg hover:bg-sand-100 transition-all duration-150 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-sage-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{user.name}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={`transition-transform ${profileOpen ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-sand-200 py-2 animate-slide-down z-50">
                  <div className="px-4 py-2 border-b border-sand-100">
                    <p className="text-sm font-medium text-charcoal-800">{user.name}</p>
                    <p className="text-xs text-charcoal-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { logout(); setProfileOpen(false) }}
                    className="w-full text-left px-4 py-2.5 text-sm text-coral-600 hover:bg-coral-50 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center px-5 py-2 text-[14px] font-medium text-white bg-sage-600 rounded-lg hover:bg-sage-700 transition-all duration-150 shadow-sm hover:shadow cursor-pointer"
            >
              Log In
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg text-charcoal-500 hover:bg-sand-100 transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="16" y2="12"/><line x1="4" y1="17" x2="12" y2="17"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`md:hidden overflow-hidden transition-all duration-250 ease-in-out ${
        mobileOpen ? 'max-h-[250px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="border-t border-sand-200 bg-white px-4 pb-4 pt-3">
          <div className="flex flex-col gap-2">
            <a
              href="#analyze"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-[14px] font-medium text-sage-700 bg-sage-50 border border-sage-200 rounded-lg"
            >
              Try Demo
            </a>
            {user ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-600">
                  <div className="w-6 h-6 rounded-full bg-sage-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.name}</span>
                </div>
                <button
                  onClick={() => { logout(); setMobileOpen(false) }}
                  className="flex items-center justify-center px-4 py-2.5 text-[14px] font-medium text-coral-600 bg-coral-50 border border-coral-200 rounded-lg cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => { setShowAuthModal(true); setMobileOpen(false) }}
                className="flex items-center justify-center px-4 py-2.5 text-[14px] font-medium text-white bg-sage-600 rounded-lg cursor-pointer"
              >
                Log In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
