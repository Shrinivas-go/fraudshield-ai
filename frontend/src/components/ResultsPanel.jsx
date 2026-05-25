import { useState } from 'react'
import TransactionDetail from './TransactionDetail'

function RiskBadge({ level }) {
  const styles = {
    high_risk: 'bg-coral-100 text-coral-700 border-coral-200',
    medium_risk: 'bg-amber-50 text-amber-700 border-amber-200',
    low_risk: 'bg-sage-50 text-sage-700 border-sage-200',
  }
  const labels = { high_risk: 'High Risk', medium_risk: 'Medium', low_risk: 'Safe' }
  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${styles[level] || styles.low_risk}`}>
      {labels[level] || level}
    </span>
  )
}

function ResultRow({ result }) {
  const [expanded, setExpanded] = useState(false)
  const prob = (result.fraud_probability * 100).toFixed(1)
  const isRisky = result.risk_level === 'high_risk' || result.risk_level === 'medium_risk'

  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${
      isRisky ? 'border-coral-200 bg-coral-50/30' : 'border-sand-200 bg-white'
    }`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-sand-50/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Risk indicator dot */}
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            result.risk_level === 'high_risk' ? 'bg-coral-500' :
            result.risk_level === 'medium_risk' ? 'bg-amber-400' : 'bg-sage-400'
          }`} />
          <div className="min-w-0">
            <span className="text-sm font-medium text-charcoal-800 block truncate">
              {result.transaction_id?.slice(0, 8)}...
            </span>
            <span className="text-xs text-charcoal-400">
              {result.timestamp ? new Date(result.timestamp).toLocaleTimeString() : 'Just now'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Probability bar */}
          <div className="hidden sm:flex items-center gap-2 w-28">
            <div className="flex-1 h-1.5 bg-sand-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  result.risk_level === 'high_risk' ? 'bg-coral-500' :
                  result.risk_level === 'medium_risk' ? 'bg-amber-400' : 'bg-sage-400'
                }`}
                style={{ width: `${prob}%` }}
              />
            </div>
            <span className="text-xs font-mono text-charcoal-500 w-10 text-right">{prob}%</span>
          </div>
          <RiskBadge level={result.risk_level} />
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`text-charcoal-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-sand-200 animate-slide-down">
          <TransactionDetail transactionId={result.transaction_id} inlineResult={result} />
        </div>
      )}
    </div>
  )
}

export default function ResultsPanel({ fraudResults, safeResults }) {
  const [activeList, setActiveList] = useState('fraud')
  const total = fraudResults.length + safeResults.length

  if (total === 0) {
    return (
      <div className="bg-white rounded-xl border border-sand-200 p-12 text-center">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-charcoal-200 mb-4">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <p className="text-base font-medium text-charcoal-500">No results yet</p>
        <p className="text-sm text-charcoal-300 mt-1">Submit a transaction or upload a CSV to see analysis results here.</p>
      </div>
    )
  }

  const currentList = activeList === 'fraud' ? fraudResults : safeResults

  return (
    <div className="bg-white rounded-xl border border-sand-200 overflow-hidden">
      {/* Toggle: Fraud / Safe */}
      <div className="flex items-center justify-between border-b border-sand-200 px-4 py-3">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveList('fraud')}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              activeList === 'fraud' ? 'bg-coral-50 text-coral-700' : 'text-charcoal-400 hover:bg-sand-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-coral-400" />
            Flagged ({fraudResults.length})
          </button>
          <button
            onClick={() => setActiveList('safe')}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              activeList === 'safe' ? 'bg-sage-50 text-sage-700' : 'text-charcoal-400 hover:bg-sand-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sage-400" />
            Safe ({safeResults.length})
          </button>
        </div>
        <span className="text-xs text-charcoal-400">{total} total</span>
      </div>

      {/* List */}
      <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
        {currentList.length === 0 ? (
          <p className="text-sm text-charcoal-300 text-center py-8">
            No {activeList === 'fraud' ? 'flagged' : 'safe'} transactions.
          </p>
        ) : (
          currentList.map((r, i) => <ResultRow key={r.transaction_id || i} result={r} />)
        )}
      </div>
    </div>
  )
}
