import { useState, useEffect, useRef } from 'react'
import API_URL from '../config'

/**
 * EngineStatus — Proactive Backend Wake-Up & Status Pill
 *
 * On mount, fires a background fetch to /api/health to wake the Render
 * free-tier backend. Shows a gorgeous floating indicator in the bottom-right
 * corner that transitions through: connecting → online → dismissed.
 */

const STATUS = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  ONLINE: 'online',
  ERROR: 'error',
}

export default function EngineStatus() {
  const [status, setStatus] = useState(STATUS.IDLE)
  const [elapsed, setElapsed] = useState(0)
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const timerRef = useRef(null)
  const startRef = useRef(null)
  const attemptRef = useRef(0)

  useEffect(() => {
    let cancelled = false

    const ping = async () => {
      // Small delay before showing UI — if backend responds fast (<1.5s),
      // the user never even sees the pill (no distraction needed)
      const showTimeout = setTimeout(() => {
        if (!cancelled && status !== STATUS.ONLINE) {
          setVisible(true)
        }
      }, 1500)

      setStatus(STATUS.CONNECTING)
      startRef.current = Date.now()

      // Start elapsed timer
      timerRef.current = setInterval(() => {
        if (startRef.current) {
          setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
        }
      }, 1000)

      // Retry logic — Render can take 30-60s to spin up
      const maxAttempts = 5
      const retryDelays = [0, 5000, 10000, 15000, 15000]

      for (let i = 0; i < maxAttempts; i++) {
        if (cancelled) break
        attemptRef.current = i + 1

        if (i > 0) {
          await new Promise(r => setTimeout(r, retryDelays[i]))
        }

        try {
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 20000)

          const res = await fetch(`${API_URL}/api/health`, {
            signal: controller.signal,
          })
          clearTimeout(timeout)

          if (res.ok) {
            if (!cancelled) {
              clearTimeout(showTimeout)
              setStatus(STATUS.ONLINE)
              setVisible(true) // Ensure visible for the success flash
              clearInterval(timerRef.current)

              // Auto-dismiss after showing success for 3s
              setTimeout(() => {
                if (!cancelled) {
                  setExiting(true)
                  setTimeout(() => {
                    if (!cancelled) setVisible(false)
                  }, 500)
                }
              }, 3000)
            }
            return
          }
        } catch {
          // Network error or timeout — retry
        }
      }

      // All retries exhausted
      if (!cancelled) {
        clearTimeout(showTimeout)
        setStatus(STATUS.ERROR)
        setVisible(true)
        clearInterval(timerRef.current)

        // Auto-dismiss error after 8s
        setTimeout(() => {
          if (!cancelled) {
            setExiting(true)
            setTimeout(() => {
              if (!cancelled) setVisible(false)
            }, 500)
          }
        }, 8000)
      }
    }

    ping()

    return () => {
      cancelled = true
      clearInterval(timerRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] transition-all duration-500 ${
        exiting
          ? 'opacity-0 translate-y-4 scale-95'
          : 'opacity-100 translate-y-0 scale-100'
      }`}
      style={{ animation: !exiting ? 'engineSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both' : undefined }}
    >
      {status === STATUS.CONNECTING && (
        <div className="relative group">
          {/* Outer glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-sage-400/30 via-sage-300/20 to-sage-500/30 rounded-2xl blur-lg opacity-80 animate-pulse" />

          <div className="relative flex items-center gap-3.5 px-5 py-3.5 bg-charcoal-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/20">
            {/* Orbital spinner */}
            <div className="relative w-8 h-8 shrink-0">
              {/* Outer ring */}
              <svg className="absolute inset-0 w-8 h-8 animate-spin" style={{ animationDuration: '3s' }} viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="13" fill="none" stroke="url(#engine-grad)" strokeWidth="2" strokeDasharray="20 62" strokeLinecap="round" />
                <defs>
                  <linearGradient id="engine-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#5e9e6e" />
                    <stop offset="100%" stopColor="#3d8550" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Inner ring (counter-rotate) */}
              <svg className="absolute inset-1 w-6 h-6 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" fill="none" stroke="url(#engine-grad-inner)" strokeWidth="1.5" strokeDasharray="14 42" strokeLinecap="round" />
                <defs>
                  <linearGradient id="engine-grad-inner" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8bb896" />
                    <stop offset="100%" stopColor="#5e9e6e" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Center dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-sage-400 animate-pulse" />
              </div>
            </div>

            {/* Text content */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-white tracking-wide">Waking ML Engine</span>
                {/* Shimmer dots */}
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-sage-400 animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.4s' }} />
                  <span className="w-1 h-1 rounded-full bg-sage-400 animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1.4s' }} />
                  <span className="w-1 h-1 rounded-full bg-sage-400 animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1.4s' }} />
                </span>
              </div>
              <span className="text-[11px] text-charcoal-300 mt-0.5 leading-tight">
                {elapsed < 5
                  ? 'Connecting to server...'
                  : elapsed < 15
                    ? `Cold start in progress — ${elapsed}s`
                    : elapsed < 30
                      ? `Render is spinning up — ${elapsed}s (usually ~45s)`
                      : `Almost there — ${elapsed}s`
                }
              </span>
            </div>

            {/* Elapsed badge */}
            <div className="ml-1 px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg">
              <span className="text-[11px] font-mono text-sage-300">{elapsed}s</span>
            </div>
          </div>
        </div>
      )}

      {status === STATUS.ONLINE && (
        <div className="relative">
          {/* Success glow burst */}
          <div className="absolute -inset-2 bg-sage-400/25 rounded-2xl blur-xl animate-pulse" />
          <div className="absolute -inset-1 bg-gradient-to-r from-sage-500/20 to-sage-400/10 rounded-2xl blur-md" />

          <div className="relative flex items-center gap-3 px-5 py-3 bg-charcoal-900/95 backdrop-blur-xl rounded-2xl border border-sage-500/30 shadow-2xl shadow-sage-900/20">
            {/* Animated check circle */}
            <div className="relative w-7 h-7 shrink-0">
              <svg className="w-7 h-7" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="12" fill="#2f7d4a" fillOpacity="0.15" stroke="#5e9e6e" strokeWidth="1.5" />
                <path
                  d="M9 14.5L12.5 18L19 11"
                  stroke="#8bb896"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: 20,
                    strokeDashoffset: 0,
                    animation: 'engineCheckDraw 0.5s ease-out both',
                  }}
                />
              </svg>
              {/* Ping ring */}
              <div className="absolute inset-0 rounded-full border border-sage-400/50 animate-ping" style={{ animationDuration: '1.5s' }} />
            </div>

            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-sage-300 tracking-wide">ML Engine Online</span>
              <span className="text-[11px] text-charcoal-400 mt-0.5">
                Ready in {elapsed}s — All systems operational
              </span>
            </div>
          </div>
        </div>
      )}

      {status === STATUS.ERROR && (
        <div className="relative">
          {/* Error glow */}
          <div className="absolute -inset-1 bg-coral-500/15 rounded-2xl blur-lg" />

          <div className="relative flex items-center gap-3 px-5 py-3 bg-charcoal-900/95 backdrop-blur-xl rounded-2xl border border-coral-500/25 shadow-2xl">
            {/* Warning icon */}
            <div className="w-7 h-7 rounded-full bg-coral-500/10 border border-coral-500/20 flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef836e" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-coral-300 tracking-wide">Engine Unavailable</span>
              <span className="text-[11px] text-charcoal-400 mt-0.5">
                Backend may be cold — try refreshing in a minute
              </span>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="ml-1 px-2.5 py-1 text-[11px] font-medium text-coral-300 bg-coral-500/10 border border-coral-500/20 rounded-lg hover:bg-coral-500/20 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
