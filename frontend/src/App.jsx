import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ComicStory from './components/ComicStory'
import AnalyzePage from './components/AnalyzePage'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import { AuthProvider } from './components/AuthContext'

export default function App() {
  useEffect(() => {
    const handleAnchorClick = (e) => {
      const targetHref = e.target.closest('a')?.getAttribute('href')
      if (targetHref === '#analyze') {
        e.preventDefault()
        const targetElement = document.getElementById('analyze')
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    }
    document.addEventListener('click', handleAnchorClick)
    return () => document.removeEventListener('click', handleAnchorClick)
  }, [])

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-sand-50">
        <Navbar />
        <main className="flex-1">

          {/* ── HERO + Comic Panels 1 & 2 ── */}
          <section className="relative overflow-hidden bg-gradient-to-br from-sand-50 via-white to-sage-50">
            <Hero />

            {/* ── Desktop: Panels float on sides (xl+) ── */}
            {/* Comic Panel 1 — right side */}
            <div className="hidden xl:block absolute top-28 right-6 2xl:right-14 w-64 2xl:w-72 opacity-80 hover:opacity-100 transition-opacity duration-300 z-10">
              <div className="relative -rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="absolute inset-2 bg-charcoal-200/40 rounded-xl blur-md" />
                <div className="relative bg-white rounded-xl p-2.5 border border-sand-200 shadow-md">
                  <img src="/comics/panel1.png" alt="The Rise" className="w-full rounded-lg" loading="eager" />
                  <div className="absolute -top-3 -left-3 w-7 h-7 bg-charcoal-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">1</div>
                </div>
                <div className="mt-2.5 bg-white/90 backdrop-blur rounded-lg px-3 py-2 border border-sand-200 shadow-sm">
                  <p className="text-[10px] font-bold text-sage-600 uppercase tracking-wider">Chapter 1 · The Rise</p>
                  <p className="text-[11px] text-charcoal-400 leading-snug mt-0.5">QuickPay was booming — thousands of transactions, happy investors...</p>
                </div>
              </div>
            </div>

            {/* Comic Panel 2 — left side */}
            <div className="hidden xl:block absolute top-36 left-6 2xl:left-14 w-60 2xl:w-68 opacity-75 hover:opacity-100 transition-opacity duration-300 z-10">
              <div className="relative rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="absolute inset-2 bg-charcoal-200/30 rounded-xl blur-md" />
                <div className="relative bg-white rounded-xl p-2.5 border border-sand-200 shadow-md">
                  <img src="/comics/panel2.png" alt="The Shadow" className="w-full rounded-lg" loading="eager" />
                  <div className="absolute -top-3 -left-3 w-7 h-7 bg-charcoal-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">2</div>
                </div>
                <div className="mt-2.5 bg-white/90 backdrop-blur rounded-lg px-3 py-2 border border-sand-200 shadow-sm">
                  <p className="text-[10px] font-bold text-charcoal-500 uppercase tracking-wider">Chapter 2 · The Shadow</p>
                  <p className="text-[11px] text-charcoal-400 leading-snug mt-0.5">But fraudsters had found their weakness — zero detection...</p>
                </div>
              </div>
            </div>

            {/* ── Mobile/Tablet: Panels shown inline below hero ── */}
            <div className="xl:hidden pb-12 px-4 sm:px-6">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="h-px flex-1 bg-charcoal-200/50" />
                  <span className="text-[11px] font-bold text-charcoal-400 uppercase tracking-widest">The QuickPay Story Begins</span>
                  <div className="h-px flex-1 bg-charcoal-200/50" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Panel 1 */}
                  <div className="bg-white rounded-xl p-3 border border-sand-200 shadow-sm">
                    <img src="/comics/panel1.png" alt="The Rise" className="w-full rounded-lg mb-2.5" loading="eager" />
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 shrink-0 bg-charcoal-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center">1</div>
                      <div>
                        <p className="text-xs font-bold text-sage-600 uppercase tracking-wider">Chapter 1 · The Rise</p>
                        <p className="text-[12px] text-charcoal-400 leading-snug mt-0.5">QuickPay was booming — thousands of transactions, happy investors, bright future ahead.</p>
                      </div>
                    </div>
                  </div>
                  {/* Panel 2 */}
                  <div className="bg-white rounded-xl p-3 border border-sand-200 shadow-sm">
                    <img src="/comics/panel2.png" alt="The Shadow" className="w-full rounded-lg mb-2.5" loading="eager" />
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 shrink-0 bg-charcoal-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center">2</div>
                      <div>
                        <p className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">Chapter 2 · The Shadow</p>
                        <p className="text-[12px] text-charcoal-400 leading-snug mt-0.5">But fraudsters found their weakness — zero detection. ₹500 here, ₹1,200 there. Nobody noticed.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── HOW IT WORKS — with 3D isometric background ── */}
          <section id="how-it-works" className="scroll-mt-20 relative py-16 sm:py-20 border-t border-sand-200 overflow-hidden">
            {/* 3D Isometric grid background */}
            <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900 via-charcoal-800 to-charcoal-900" />

            {/* Animated perspective grid */}
            <div className="absolute inset-0 overflow-hidden opacity-20">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(47,125,74,0.4) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(47,125,74,0.4) 1px, transparent 1px)
                  `,
                  backgroundSize: '60px 60px',
                  transform: 'perspective(500px) rotateX(60deg)',
                  transformOrigin: 'center top',
                  height: '200%',
                  top: '-20%',
                }}
              />
            </div>

            {/* Floating glow orbs */}
            <div className="absolute top-10 left-1/4 w-64 h-64 bg-sage-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-coral-500/8 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sage-400/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Floating hexagon decorations */}
            <svg className="absolute top-8 right-12 w-16 h-16 text-sage-500/10 animate-pulse" viewBox="0 0 100 100" fill="currentColor">
              <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" />
            </svg>
            <svg className="absolute bottom-12 left-16 w-12 h-12 text-coral-500/10 animate-pulse" style={{animationDelay: '1s'}} viewBox="0 0 100 100" fill="currentColor">
              <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" />
            </svg>
            <svg className="hidden sm:block absolute top-1/3 left-8 w-8 h-8 text-sage-400/15 animate-pulse" style={{animationDelay: '2s'}} viewBox="0 0 100 100" fill="currentColor">
              <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" />
            </svg>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sage-500/10 border border-sage-500/20 rounded-full mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-sage-400 animate-pulse" />
                  <span className="text-xs font-medium text-sage-300 tracking-wide">Powered by Machine Learning</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
                  How It Works
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {[
                  {
                    step: '01',
                    title: 'Input Transaction',
                    desc: 'Enter transaction details manually or upload a CSV batch — amount, time, merchant, device trust, and more.',
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sage-400">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    ),
                  },
                  {
                    step: '02',
                    title: 'ML Analysis',
                    desc: 'Our RandomForest model (trained on 10K+ samples with SMOTE balancing) evaluates 16 engineered features in under a second.',
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sage-400">
                        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                      </svg>
                    ),
                  },
                  {
                    step: '03',
                    title: 'Actionable Results',
                    desc: 'Get a fraud probability score, risk classification, and the top features driving the prediction — instantly.',
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sage-400">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                    ),
                  },
                ].map(({ step, title, desc, icon }) => (
                  <div key={step} className="relative group">
                    <div className="bg-white/[0.04] backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10 transition-all duration-300 hover:bg-white/[0.08] hover:border-sage-500/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-sage-500/5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-sage-500/10 border border-sage-500/20 flex items-center justify-center">
                          {icon}
                        </div>
                        <span className="text-xs font-bold text-sage-500/60 tracking-widest uppercase">Step {step}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-2">{title}</h3>
                      <p className="text-sm text-charcoal-300 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Comic Story (Panels 3, 4, 5) ── */}
          <ComicStory />

          {/* ── Analyze Section ── */}
          <AnalyzePage />
        </main>
        <Footer />
        <AuthModal />
      </div>
    </AuthProvider>
  )
}
