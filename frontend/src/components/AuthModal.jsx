import { useState, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, login, signup, authLoading } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const modalRef = useRef(null)
  const emailRef = useRef(null)

  // Focus email on open
  useEffect(() => {
    if (showAuthModal) {
      setTimeout(() => emailRef.current?.focus(), 150)
      setError('')
      setName('')
      setEmail('')
      setPassword('')
    }
  }, [showAuthModal, mode])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setShowAuthModal(false) }
    if (showAuthModal) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [showAuthModal, setShowAuthModal])

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === modalRef.current) setShowAuthModal(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    let result
    if (mode === 'signup') {
      result = await signup(name, email, password)
    } else {
      result = await login(email, password)
    }

    if (!result.success) {
      setError(result.error)
    }
  }

  if (!showAuthModal) return null

  const inputCls = "w-full px-4 py-3 text-sm bg-sand-50 border border-sand-200 rounded-xl outline-none focus:border-sage-400 focus:ring-2 focus:ring-sage-100 text-charcoal-800 placeholder:text-charcoal-300 transition-all"

  return (
    <div
      ref={modalRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal-900/40 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Close button */}
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-charcoal-400 hover:bg-sand-100 hover:text-charcoal-600 transition-colors cursor-pointer z-10"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-2">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-lg bg-sage-600 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-white">
                <path d="M9 1L2 5v4c0 4.42 2.98 8.56 7 9.6 4.02-1.04 7-5.18 7-9.6V5L9 1z" fill="currentColor" opacity="0.9"/>
                <path d="M8 8.5L6.5 10L8 11.5L11.5 8L10 6.5L8 8.5z" fill="white" opacity="0.6"/>
              </svg>
            </div>
            <span className="text-lg font-semibold text-charcoal-900">FraudShield</span>
          </div>

          <h2 className="text-2xl font-bold font-display text-charcoal-900">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm text-charcoal-400 mt-1">
            {mode === 'login'
              ? 'Sign in to access batch CSV analysis and all features.'
              : 'Get started with FraudShield — it only takes a moment.'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pt-4 pb-8 space-y-4">
          {error && (
            <div className="px-4 py-2.5 bg-coral-50 border border-coral-200 rounded-xl text-sm text-coral-700 flex items-center gap-2 animate-slide-down">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {error}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-charcoal-500 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ravi Kumar"
                className={inputCls}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-charcoal-500 mb-1.5">Email Address</label>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ravi@quickpay.com"
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-charcoal-500 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className={`${inputCls} pr-12`}
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600 transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full py-3.5 text-sm font-semibold text-white bg-sage-600 rounded-xl hover:bg-sage-700 disabled:opacity-50 transition-all shadow-sm hover:shadow cursor-pointer flex items-center justify-center gap-2"
          >
            {authLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>

          {/* Toggle mode */}
          <p className="text-center text-sm text-charcoal-400">
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <button type="button" onClick={() => { setMode('signup'); setError('') }} className="text-sage-600 font-medium hover:text-sage-700 cursor-pointer">
                  Sign up
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button type="button" onClick={() => { setMode('login'); setError('') }} className="text-sage-600 font-medium hover:text-sage-700 cursor-pointer">
                  Sign in
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  )
}
