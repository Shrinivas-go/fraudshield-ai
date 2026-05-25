import { useEffect, useRef, useState } from 'react'

const STORY_PANELS = [
  {
    chapter: 'Chapter 3',
    title: 'The Shock',
    image: '/comics/panel3.png',
    narrative: 'Then it hit. ₹2.3 Crore in fraudulent transactions in a single week. Chargebacks flooded in, payment processors froze the accounts, and customers lost trust overnight.',
    align: 'left',
  },
  {
    chapter: 'Chapter 4',
    title: 'The Fall',
    image: '/comics/panel4.png',
    narrative: 'QuickPay couldn\'t absorb the losses. Ravi watched helplessly as his dream crumbled — the office emptied, the servers went dark, and the doors closed. Forever.',
    align: 'right',
  },
  {
    chapter: 'Chapter 5',
    title: 'The Shield',
    image: '/comics/panel5.png',
    narrative: 'But what if Ravi had FraudShield? Our AI detects suspicious patterns before the damage is done — blocking fraud in real-time, so businesses like QuickPay never have to close their doors.',
    align: 'center',
    isFinal: true,
  },
]

function StoryPanel({ panel, index, panelNumber }) {
  const panelRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )
    if (panelRef.current) observer.observe(panelRef.current)
    return () => observer.disconnect()
  }, [])

  const isCenter = panel.align === 'center'
  const isLeft = panel.align === 'left'

  return (
    <div
      ref={panelRef}
      className={`relative transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Connecting line */}
      {index > 0 && (
        <div className="absolute left-1/2 -top-12 sm:-top-14 w-px h-12 sm:h-14 bg-gradient-to-b from-transparent via-charcoal-200 to-charcoal-300" />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {isCenter ? (
          <div className="text-center">
            <span className="inline-block px-3 py-1 text-[11px] font-bold tracking-widest uppercase text-sage-600 bg-sage-100 rounded-full mb-4">
              {panel.chapter}
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-display text-charcoal-900 mb-6">{panel.title}</h3>
            <div className="relative max-w-sm mx-auto mb-8">
              <div className="absolute inset-0 bg-sage-200/30 rounded-2xl blur-xl" />
              <img src={panel.image} alt={panel.title} className="relative w-full rounded-2xl shadow-lg border-2 border-sage-200" loading="eager" />
            </div>
            <p className="text-base sm:text-lg text-charcoal-500 max-w-xl mx-auto leading-relaxed mb-8">
              {panel.narrative}
            </p>
            <a
              href="#analyze"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-semibold text-white bg-sage-600 rounded-xl hover:bg-sage-700 transition-all duration-200 shadow-lg shadow-sage-600/20 hover:shadow-xl hover:-translate-y-0.5"
            >
              Try FraudShield Now
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
          </div>
        ) : (
          <div className={`flex flex-col ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-12`}>
            <div className="w-full md:w-5/12 shrink-0">
              <div className={`relative ${isLeft ? 'md:-rotate-1' : 'md:rotate-1'} transition-transform duration-500 hover:rotate-0`}>
                <div className="absolute inset-2 bg-charcoal-200/40 rounded-xl blur-md" />
                <div className="relative bg-white rounded-xl p-3 border border-sand-200 shadow-md">
                  <img src={panel.image} alt={panel.title} className="w-full rounded-lg" loading="eager" />
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-charcoal-800 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                    {panelNumber}
                  </div>
                </div>
              </div>
            </div>
            <div className={`w-full md:w-7/12 ${isLeft ? 'md:pl-4' : 'md:pr-4'}`}>
              <span className={`inline-block px-3 py-1 text-[11px] font-bold tracking-widest uppercase rounded-full mb-3 ${
                panel.chapter === 'Chapter 4' ? 'text-coral-600 bg-coral-50' : 'text-charcoal-500 bg-charcoal-50'
              }`}>
                {panel.chapter}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-charcoal-900 mb-3">
                {panel.title}
              </h3>
              <div className={`relative bg-white rounded-2xl p-5 border border-sand-200 shadow-sm`}>
                <p className="text-sm sm:text-base text-charcoal-500 leading-relaxed">
                  {panel.narrative}
                </p>
                <div className={`absolute top-6 ${isLeft ? '-left-2' : '-right-2'} w-4 h-4 bg-white border-b border-l border-sand-200 ${isLeft ? 'rotate-45' : '-rotate-[135deg]'}`} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ComicStory() {
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      {/* Subtle texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative">
        <div className="text-center mb-14 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-charcoal-50 border border-charcoal-200 rounded-full mb-6">
            <span className="text-xs font-medium text-charcoal-600 tracking-wide">The Story of QuickPay</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-charcoal-900 mb-3">
            What Happens Without Protection?
          </h2>
          <p className="text-sm text-charcoal-400 max-w-md mx-auto">
            The story began in the hero section above — here's how it ended.
          </p>
        </div>

        <div className="space-y-16 sm:space-y-24">
          {STORY_PANELS.map((panel, i) => (
            <StoryPanel key={i} panel={panel} index={i} panelNumber={i + 3} />
          ))}
        </div>
      </div>
    </section>
  )
}
