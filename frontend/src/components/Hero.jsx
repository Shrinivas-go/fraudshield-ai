import { useEffect, useRef } from 'react'

export default function Hero() {
  const sectionRef = useRef(null)

  useEffect(() => {
    // Parallax-lite: shift decorative blobs on scroll
    const handleScroll = () => {
      if (!sectionRef.current) return
      const y = window.scrollY
      const blobs = sectionRef.current.querySelectorAll('.hero-blob')
      blobs.forEach((blob, i) => {
        const speed = 0.04 + i * 0.02
        blob.style.transform = `translateY(${y * speed}px)`
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-br from-sand-50 via-white to-sage-50 pt-20 pb-24 sm:pt-28 sm:pb-32"
    >
      {/* Decorative blobs */}
      <div className="hero-blob absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-sage-200/30 blur-3xl pointer-events-none" />
      <div className="hero-blob absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-coral-200/20 blur-3xl pointer-events-none" />
      <div className="hero-blob absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-sage-300/15 blur-2xl pointer-events-none" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 bg-sage-50 border border-sage-200 rounded-full mb-8">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-sage-400 opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sage-500" />
          </span>
          <span className="text-xs font-medium text-sage-700 tracking-wide">AI-Powered Detection Active</span>
        </div>

        {/* Heading */}
        <h1 className="animate-fade-in-up animation-delay-100 font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-charcoal-900 leading-[1.1]">
          Detect Fraud{' '}
          <span className="relative">
            <span className="text-sage-600">Before</span>
            <svg className="absolute -bottom-1 left-0 w-full h-2 text-sage-300" viewBox="0 0 200 8" preserveAspectRatio="none">
              <path d="M0 6 C50 0, 150 0, 200 6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </span>{' '}
          It Happens
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-in-up animation-delay-200 mt-6 text-lg sm:text-xl text-charcoal-400 max-w-2xl mx-auto leading-relaxed">
          Our machine learning model analyzes transaction patterns in real&#8209;time, 
          flagging suspicious activity with <span className="text-charcoal-600 font-medium">99.3% accuracy</span> — 
          so you can act fast and protect what matters.
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-in-up animation-delay-300 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#analyze"
            className="group inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-semibold text-white bg-sage-600 rounded-xl hover:bg-sage-700 transition-all duration-200 shadow-lg shadow-sage-600/20 hover:shadow-xl hover:shadow-sage-600/30 hover:-translate-y-0.5"
          >
            Analyze a Transaction
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-6 py-3.5 text-[15px] font-medium text-charcoal-600 bg-white border border-sand-300 rounded-xl hover:bg-sand-50 hover:border-charcoal-200 transition-all duration-200"
          >
            How It Works
          </a>
        </div>

        {/* Stats row */}
        <div className="animate-fade-in-up animation-delay-400 mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { value: '99.3%', label: 'Accuracy' },
            { value: '10K+', label: 'Trained Samples' },
            { value: '<1s', label: 'Response Time' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold font-display text-charcoal-900">{stat.value}</p>
              <p className="text-xs sm:text-sm text-charcoal-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
