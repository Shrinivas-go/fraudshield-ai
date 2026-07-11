import { useState, useEffect, useRef, useCallback } from 'react'
import API_URL from '../config'

/**
 * EngineStatus — AI System Boot Card
 *
 * Displays a professional, recruiter-friendly initialization card while the
 * Render free-tier backend wakes from sleep. Polls /api/health every 2 seconds
 * and reflects actual backend state — no fake timers or percentages.
 *
 * States: CONNECTING → ONLINE → dismissed (auto-fade)
 *         CONNECTING → ERROR (after max retries)
 */

const STATUS = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  ONLINE: 'online',
  ERROR: 'error',
}

const BOOT_MESSAGES = [
  'Connecting to Secure Backend...',
  'Loading Fraud Detection Model...',
  'Initializing Prediction Engine...',
  'Verifying Security Modules...',
  'AI Engine is Starting...',
  'Almost Ready...',
]

export default function EngineStatus() {
  const [status, setStatus] = useState(STATUS.IDLE)
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [messageIndex, setMessageIndex] = useState(0)
  const [whyExpanded, setWhyExpanded] = useState(false)

  const pollRef = useRef(null)
  const messageTimerRef = useRef(null)
  const cancelledRef = useRef(false)

  // Rotate boot messages every 3.5 seconds
  useEffect(() => {
    if (status !== STATUS.CONNECTING) return

    messageTimerRef.current = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % BOOT_MESSAGES.length)
    }, 3500)

    return () => clearInterval(messageTimerRef.current)
  }, [status])

  // Dismiss: smooth exit animation then hide
  const dismiss = useCallback(() => {
    setExiting(true)
    setTimeout(() => {
      if (!cancelledRef.current) setVisible(false)
    }, 600)
  }, [])

  // Core: poll backend health every 2 seconds
  useEffect(() => {
    cancelledRef.current = false

    // Delay showing the card — if backend is fast (<1.5s), skip the card entirely
    const showTimeout = setTimeout(() => {
      if (!cancelledRef.current && status !== STATUS.ONLINE) {
        setVisible(true)
      }
    }, 1500)

    setStatus(STATUS.CONNECTING)

    let attemptCount = 0
    const MAX_ATTEMPTS = 45 // 45 × 2s = 90s max

    const poll = async () => {
      if (cancelledRef.current) return

      attemptCount++

      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 5000)

        const res = await fetch(`${API_URL}/api/health`, {
          signal: controller.signal,
        })
        clearTimeout(timeout)

        if (res.ok && !cancelledRef.current) {
          clearTimeout(showTimeout)
          setStatus(STATUS.ONLINE)
          setVisible(true) // Ensure visible for the success flash
          clearInterval(pollRef.current)
          clearInterval(messageTimerRef.current)

          // Auto-dismiss after 2.5s
          setTimeout(() => {
            if (!cancelledRef.current) dismiss()
          }, 2500)
          return
        }
      } catch {
        // Network error or timeout — continue polling
      }

      // After max attempts, show error
      if (attemptCount >= MAX_ATTEMPTS && !cancelledRef.current) {
        clearTimeout(showTimeout)
        clearInterval(pollRef.current)
        clearInterval(messageTimerRef.current)
        setStatus(STATUS.ERROR)
        setVisible(true)
      }
    }

    // First poll immediately, then every 2 seconds
    poll()
    pollRef.current = setInterval(poll, 2000)

    return () => {
      cancelledRef.current = true
      clearTimeout(showTimeout)
      clearInterval(pollRef.current)
      clearInterval(messageTimerRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={
        status === STATUS.CONNECTING
          ? 'AI Engine is initializing'
          : status === STATUS.ONLINE
            ? 'AI Engine is online'
            : 'AI Engine is unavailable'
      }
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${
        exiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundColor: 'rgba(26, 24, 21, 0.45)',
        backdropFilter: 'blur(4px)',
        animation: !exiting ? 'engineCardFadeIn 0.4s ease-out both' : undefined,
      }}
    >
      <div
        className={`w-full max-w-md transition-all duration-500 ${
          exiting ? 'translate-y-4' : 'translate-y-0'
        }`}
        style={{
          animation: !exiting ? 'engineCardSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both' : undefined,
        }}
      >
        {/* ── CONNECTING STATE ── */}
        {status === STATUS.CONNECTING && (
          <div className="bg-white rounded-2xl border border-charcoal-200 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg" role="img" aria-label="shield">🛡</span>
                  <h2 className="text-base font-semibold text-charcoal-800 tracking-tight font-display">
                    FraudShield AI Engine
                  </h2>
                </div>

                {/* Status badge */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-amber-500"
                    style={{ animation: 'enginePulse 2s ease-in-out infinite' }}
                  />
                  <span className="text-xs font-medium text-amber-700">
                    Initializing
                  </span>
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 bg-charcoal-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-sage-400"
                  style={{
                    animation: 'engineProgress 2.5s ease-in-out infinite',
                  }}
                />
              </div>

              {/* Rotating status message */}
              <p
                key={messageIndex}
                className="mt-4 text-sm text-charcoal-500 font-medium"
                style={{ animation: 'engineMessageFade 0.4s ease-out both' }}
              >
                {BOOT_MESSAGES[messageIndex]}
              </p>
            </div>

            {/* Footer info */}
            <div className="px-6 py-4 bg-charcoal-50/60 border-t border-charcoal-100">
              <div className="flex items-start gap-2">
                {/* Info icon */}
                <svg
                  className="w-4 h-4 mt-0.5 text-charcoal-400 shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-charcoal-500 leading-relaxed">
                    First visit may take up to one minute because the backend
                    automatically wakes after inactivity.{' '}
                    <button
                      type="button"
                      onClick={() => setWhyExpanded((prev) => !prev)}
                      className="text-sage-600 hover:text-sage-700 font-medium underline underline-offset-2 decoration-sage-300 hover:decoration-sage-500 transition-colors cursor-pointer"
                      aria-expanded={whyExpanded}
                      aria-controls="engine-why-details"
                    >
                      Why?
                    </button>
                  </p>

                  {/* Expandable explanation */}
                  <div
                    id="engine-why-details"
                    className="grid transition-all duration-300 ease-out"
                    style={{
                      gridTemplateRows: whyExpanded ? '1fr' : '0fr',
                      opacity: whyExpanded ? 1 : 0,
                    }}
                  >
                    <div className="overflow-hidden">
                      <p className="mt-2.5 text-xs text-charcoal-400 leading-relaxed">
                        This project is hosted on Render's free infrastructure.
                        After periods of inactivity, the backend automatically
                        sleeps to conserve resources. Your visit wakes it
                        automatically.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ONLINE STATE ── */}
        {status === STATUS.ONLINE && (
          <div
            className="bg-white rounded-2xl border border-sage-200 shadow-lg overflow-hidden"
            style={{ animation: 'engineOnlinePop 0.4s cubic-bezier(0.16, 1, 0.3, 1) both' }}
          >
            <div className="px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg" role="img" aria-label="green circle">🟢</span>
                  <h2 className="text-base font-semibold text-charcoal-800 tracking-tight font-display">
                    AI Engine Online
                  </h2>
                </div>

                {/* Online badge */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sage-50 border border-sage-200 ml-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage-500" />
                  <span className="text-xs font-medium text-sage-700">
                    Ready
                  </span>
                </span>
              </div>

              <p className="mt-2 text-sm text-charcoal-400">
                All systems operational — you're good to go.
              </p>
            </div>
          </div>
        )}

        {/* ── ERROR STATE ── */}
        {status === STATUS.ERROR && (
          <div className="bg-white rounded-2xl border border-coral-200 shadow-lg overflow-hidden">
            <div className="px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <svg
                    className="w-5 h-5 text-coral-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <h2 className="text-base font-semibold text-charcoal-800 tracking-tight font-display">
                    Engine Unavailable
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 text-xs font-medium text-coral-700 bg-coral-50 border border-coral-200 rounded-lg hover:bg-coral-100 transition-colors cursor-pointer"
                >
                  Retry
                </button>
              </div>

              <p className="mt-2 text-sm text-charcoal-400">
                The backend didn't respond in time. Try refreshing in a moment.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
