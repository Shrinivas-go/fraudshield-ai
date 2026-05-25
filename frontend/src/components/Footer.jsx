export default function Footer() {
  return (
    <footer className="border-t border-sand-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Top row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-md bg-sage-600 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none" className="text-white">
                  <path d="M9 1L2 5v4c0 4.42 2.98 8.56 7 9.6 4.02-1.04 7-5.18 7-9.6V5L9 1z" fill="currentColor" opacity="0.9"/>
                  <path d="M8 8.5L6.5 10L8 11.5L11.5 8L10 6.5L8 8.5z" fill="white" opacity="0.6"/>
                </svg>
              </div>
              <span className="text-[15px] font-semibold text-charcoal-800">FraudShield</span>
            </div>
            <p className="text-sm text-charcoal-400 leading-relaxed max-w-xs">
              Enterprise-grade fraud detection powered by machine learning. Protecting businesses from financial threats in real-time.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-bold text-charcoal-500 uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2">
              {['Real-time Detection', 'Batch Analysis', 'Risk Scoring', 'API Integration'].map(item => (
                <li key={item}>
                  <a href="#analyze" className="text-sm text-charcoal-400 hover:text-sage-600 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold text-charcoal-500 uppercase tracking-wider mb-3">Company</h4>
            <ul className="space-y-2">
              {['About Us', 'Security', 'Privacy Policy', 'Contact'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-charcoal-400 hover:text-sage-600 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-sand-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-charcoal-300">
            © {new Date().getFullYear()} FraudShield Security. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-charcoal-300 hover:text-sage-500 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
              </svg>
            </a>
            <a href="#" className="text-charcoal-300 hover:text-sage-500 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
            <a href="#" className="text-charcoal-300 hover:text-sage-500 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
