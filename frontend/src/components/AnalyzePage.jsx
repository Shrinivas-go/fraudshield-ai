import { useState, useRef } from 'react'
import { useAuth } from './AuthContext'
import TransactionForm from './TransactionForm'
import ResultsPanel from './ResultsPanel'
import API_URL from '../config'

const API_BASE = `${API_URL}/api/demo`

/* 15 realistic sample transactions — mix of fraud and safe */
const SAMPLE_DATA = [
  { amount: 12500, transaction_hour: 1, merchant_category: 'Electronics', foreign_transaction: 1, location_mismatch: 1, device_trust_score: 18, velocity_last_24h: 14, cardholder_age: 22 },
  { amount: 85.50, transaction_hour: 10, merchant_category: 'Grocery', foreign_transaction: 0, location_mismatch: 0, device_trust_score: 88, velocity_last_24h: 2, cardholder_age: 45 },
  { amount: 3200, transaction_hour: 2, merchant_category: 'Travel', foreign_transaction: 1, location_mismatch: 1, device_trust_score: 32, velocity_last_24h: 9, cardholder_age: 30 },
  { amount: 45.00, transaction_hour: 14, merchant_category: 'Food', foreign_transaction: 0, location_mismatch: 0, device_trust_score: 92, velocity_last_24h: 1, cardholder_age: 38 },
  { amount: 8900, transaction_hour: 0, merchant_category: 'Electronics', foreign_transaction: 1, location_mismatch: 0, device_trust_score: 25, velocity_last_24h: 11, cardholder_age: 19 },
  { amount: 150.00, transaction_hour: 16, merchant_category: 'Clothing', foreign_transaction: 0, location_mismatch: 0, device_trust_score: 78, velocity_last_24h: 3, cardholder_age: 52 },
  { amount: 6700, transaction_hour: 3, merchant_category: 'Travel', foreign_transaction: 1, location_mismatch: 1, device_trust_score: 12, velocity_last_24h: 15, cardholder_age: 25 },
  { amount: 220.00, transaction_hour: 11, merchant_category: 'Grocery', foreign_transaction: 0, location_mismatch: 0, device_trust_score: 85, velocity_last_24h: 2, cardholder_age: 60 },
  { amount: 4500, transaction_hour: 23, merchant_category: 'Electronics', foreign_transaction: 1, location_mismatch: 1, device_trust_score: 22, velocity_last_24h: 8, cardholder_age: 27 },
  { amount: 35.00, transaction_hour: 9, merchant_category: 'Food', foreign_transaction: 0, location_mismatch: 0, device_trust_score: 95, velocity_last_24h: 1, cardholder_age: 41 },
  { amount: 1800, transaction_hour: 1, merchant_category: 'Clothing', foreign_transaction: 1, location_mismatch: 0, device_trust_score: 40, velocity_last_24h: 6, cardholder_age: 33 },
  { amount: 95.00, transaction_hour: 15, merchant_category: 'Grocery', foreign_transaction: 0, location_mismatch: 0, device_trust_score: 90, velocity_last_24h: 2, cardholder_age: 55 },
  { amount: 15000, transaction_hour: 2, merchant_category: 'Travel', foreign_transaction: 1, location_mismatch: 1, device_trust_score: 10, velocity_last_24h: 18, cardholder_age: 21 },
  { amount: 320.00, transaction_hour: 13, merchant_category: 'Food', foreign_transaction: 0, location_mismatch: 0, device_trust_score: 82, velocity_last_24h: 3, cardholder_age: 47 },
  { amount: 7200, transaction_hour: 0, merchant_category: 'Electronics', foreign_transaction: 1, location_mismatch: 1, device_trust_score: 15, velocity_last_24h: 12, cardholder_age: 24 },
]

function parseError(d) {
  if (typeof d.detail === 'string') return d.detail
  if (d.detail?.message) return d.detail.message
  if (d.detail?.error) return d.detail.error + (d.detail.missing_columns ? ': ' + d.detail.missing_columns.join(', ') : '')
  return JSON.stringify(d.detail || d)
}

export default function AnalyzePage() {
  const { user, setShowAuthModal } = useAuth()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('sample')
  const [selectedFile, setSelectedFile] = useState(null)
  const [csvStats, setCsvStats] = useState(null)
  const [sampleAnalyzed, setSampleAnalyzed] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef(null)
  const dragCounter = useRef(0)

  const handleDragEnter = (e) => {
    e.preventDefault(); e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }
  const handleDragLeave = (e) => {
    e.preventDefault(); e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }
  const handleDragOver = (e) => {
    e.preventDefault(); e.stopPropagation()
  }
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation()
    setIsDragging(false)
    dragCounter.current = 0
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.name.endsWith('.csv')) {
        setSelectedFile(file)
        setError('')
        setCsvStats(null)
      } else {
        setError('Please drop a .csv file.')
      }
    }
  }

  const handlePredict = async (transaction) => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(parseError(d)) }
      const data = await res.json()
      setResults(prev => [data, ...prev])
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError('')
      setCsvStats(null)
    }
  }

  const handleCSV = async (e) => {
    e.preventDefault()
    const file = selectedFile || fileRef.current?.files?.[0]
    if (!file) { setError('Please select a CSV file first.'); return }
    setLoading(true); setError(''); setCsvStats(null)
    try {
      // Read user file as text, then create a Blob+File — same as handleSampleAnalyze
      const csvText = await file.text()
      const blob = new Blob([csvText], { type: 'text/csv' })
      const csvFile = new File([blob], file.name, { type: 'text/csv' })
      const form = new FormData()
      form.append('file', csvFile)
      const res = await fetch(`${API_BASE}/upload-csv`, { method: 'POST', body: form })
      if (!res.ok) { const d = await res.json(); throw new Error(parseError(d)) }
      const data = await res.json()
      const mapped = data.predictions.filter(p => p.status === 'success').map(p => ({
        transaction_id: p.transaction_id,
        fraud_probability: p.fraud_probability,
        risk_level: p.risk_level,
        timestamp: new Date().toISOString(),
        input_data: p.input_data,
        explainability: p.explainability,
        explanation: p.explanation,
        _csv_row: p.row_index,
      }))
      setResults(prev => [...mapped, ...prev])
      setCsvStats({ total: data.total_rows, success: data.successful, failed: data.failed })
      setSelectedFile(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setCsvStats(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSampleAnalyze = async () => {
    setLoading(true); setError(''); setCsvStats(null)
    try {
      const header = Object.keys(SAMPLE_DATA[0]).join(',')
      const rows = SAMPLE_DATA.map(r => Object.values(r).join(','))
      const csv = [header, ...rows].join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const file = new File([blob], 'sample_transactions.csv', { type: 'text/csv' })
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${API_BASE}/upload-csv`, { method: 'POST', body: form })
      if (!res.ok) { const d = await res.json(); throw new Error(parseError(d)) }
      const data = await res.json()
      const mapped = data.predictions.filter(p => p.status === 'success').map(p => ({
        transaction_id: p.transaction_id,
        fraud_probability: p.fraud_probability,
        risk_level: p.risk_level,
        timestamp: new Date().toISOString(),
        input_data: p.input_data,
        explainability: p.explainability,
        explanation: p.explanation,
        _csv_row: p.row_index,
      }))
      setResults(mapped)
      setCsvStats({ total: data.total_rows, success: data.successful, failed: data.failed })
      setSampleAnalyzed(true)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleTabClick = (key) => {
    if (key === 'csv' && !user) {
      setShowAuthModal(true)
      return
    }
    setActiveTab(key)
  }

  const fraudResults = results.filter(r => r.risk_level === 'high_risk' || r.risk_level === 'medium_risk')
  const safeResults = results.filter(r => r.risk_level === 'low_risk')

  return (
    <section id="analyze" className="scroll-mt-20 bg-sand-50 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-charcoal-900">Analyze Transactions</h2>
          <p className="mt-2 text-base text-charcoal-400 max-w-xl mx-auto">Submit individual transactions or upload a CSV file for batch analysis.</p>
        </div>

        {error && (
          <div className="mb-4 max-w-7xl mx-auto px-4 py-3 bg-coral-50 border border-coral-200 rounded-lg text-sm text-coral-700 flex items-center gap-2 animate-slide-down">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            {error}
            <button onClick={() => setError('')} className="ml-auto text-coral-500 hover:text-coral-700 cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}

        {csvStats && (
          <div className="mb-4 max-w-7xl mx-auto px-4 py-3 bg-sage-50 border border-sage-200 rounded-lg text-sm text-sage-700 flex items-center gap-2 animate-slide-down">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Processed {csvStats.total} rows — {csvStats.success} successful{csvStats.failed > 0 ? `, ${csvStats.failed} failed` : ''}
            <button onClick={() => setCsvStats(null)} className="ml-auto text-sage-500 hover:text-sage-700 cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Input (2 cols) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-sand-200 overflow-hidden shadow-sm">
              {/* Tabs */}
              <div className="flex border-b border-sand-200">
                {[['sample', '✦ Sample Data'], ['single', 'Single Transaction'], ['csv', 'CSV Upload']].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => handleTabClick(key)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors cursor-pointer relative ${
                      activeTab === key
                        ? 'text-sage-700 bg-sage-50 border-b-2 border-sage-500'
                        : key === 'csv' && !user
                          ? 'text-charcoal-300 hover:text-charcoal-400 hover:bg-sand-50'
                          : 'text-charcoal-400 hover:text-charcoal-600 hover:bg-sand-50'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      {label}
                      {key === 'csv' && !user && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-charcoal-300">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                        </svg>
                      )}
                    </span>
                  </button>
                ))}
              </div>

              <div className="p-5">
                {activeTab === 'sample' ? (
                  /* Sample Data Panel */
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-charcoal-800">15 Pre-built Transactions</p>
                      <p className="text-xs text-charcoal-400 mt-0.5">Mix of suspicious and legitimate — see the model in action.</p>
                    </div>
                    <div className="overflow-x-auto max-h-[320px] overflow-y-auto border border-sand-200 rounded-lg">
                      <table className="w-full text-left">
                        <thead className="sticky top-0 bg-sand-50 z-10">
                          <tr>
                            <th className="px-2 py-1.5 text-[10px] font-semibold text-charcoal-500 uppercase">#</th>
                            <th className="px-2 py-1.5 text-[10px] font-semibold text-charcoal-500 uppercase">Amount</th>
                            <th className="px-2 py-1.5 text-[10px] font-semibold text-charcoal-500 uppercase">Hour</th>
                            <th className="px-2 py-1.5 text-[10px] font-semibold text-charcoal-500 uppercase">Category</th>
                            <th className="px-2 py-1.5 text-[10px] font-semibold text-charcoal-500 uppercase">Foreign</th>
                            <th className="px-2 py-1.5 text-[10px] font-semibold text-charcoal-500 uppercase">Trust</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-sand-100">
                          {SAMPLE_DATA.map((tx, i) => (
                            <tr key={i} className={`text-xs ${
                              tx.foreign_transaction && tx.device_trust_score < 30 ? 'bg-coral-50/40' : ''
                            }`}>
                              <td className="px-2 py-1.5 text-charcoal-400">{i + 1}</td>
                              <td className="px-2 py-1.5 font-medium text-charcoal-800">₹{tx.amount.toLocaleString('en-IN')}</td>
                              <td className="px-2 py-1.5 text-charcoal-600">{String(tx.transaction_hour).padStart(2,'0')}:00</td>
                              <td className="px-2 py-1.5 text-charcoal-600">{tx.merchant_category}</td>
                              <td className="px-2 py-1.5">{tx.foreign_transaction ? <span className="text-coral-600 font-medium">Yes</span> : <span className="text-charcoal-300">No</span>}</td>
                              <td className="px-2 py-1.5">
                                <span className={`font-mono ${tx.device_trust_score < 30 ? 'text-coral-600 font-semibold' : tx.device_trust_score < 50 ? 'text-amber-600' : 'text-sage-600'}`}>{tx.device_trust_score}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button
                      onClick={handleSampleAnalyze}
                      disabled={loading}
                      className="w-full py-3 text-sm font-medium text-white bg-sage-600 rounded-lg hover:bg-sage-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Analyzing 15 transactions...</>
                      ) : sampleAnalyzed ? (
                        <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>Re-analyze Sample Data</>
                      ) : (
                        <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="5 12 12 5 19 12"/><line x1="12" y1="19" x2="12" y2="5"/></svg>Analyze Sample Data</>
                      )}
                    </button>
                  </div>
                ) : activeTab === 'single' ? (
                  <TransactionForm onSubmit={handlePredict} loading={loading} />
                ) : (
                  <form onSubmit={handleCSV} className="space-y-4">
                    <div
                      onDragEnter={handleDragEnter}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                        isDragging
                          ? 'border-sage-500 bg-sage-50/70 scale-[1.02] shadow-lg shadow-sage-200/50'
                          : selectedFile
                            ? 'border-sage-400 bg-sage-50/50'
                            : 'border-sand-300 hover:border-sage-400'
                      }`}
                    >
                      {isDragging ? (
                        <div className="py-4">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-sage-500 mb-3 animate-bounce">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                          <p className="text-sm font-semibold text-sage-600">Release to upload</p>
                          <p className="text-xs text-sage-400 mt-1">Drop your CSV file here</p>
                        </div>
                      ) : selectedFile ? (
                        <div>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-sage-500 mb-3">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                          </svg>
                          <p className="text-sm font-medium text-charcoal-800">{selectedFile.name}</p>
                          <p className="text-xs text-charcoal-400 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                          <button
                            type="button"
                            onClick={clearFile}
                            className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-coral-600 bg-coral-50 border border-coral-200 rounded-lg hover:bg-coral-100 cursor-pointer"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-charcoal-300 mb-3">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                          <p className="text-sm text-charcoal-500 mb-1">Drop your CSV file here or</p>
                          <label className="inline-block px-4 py-2 text-sm font-medium text-sage-700 bg-sage-50 border border-sage-200 rounded-lg cursor-pointer hover:bg-sage-100">
                            Browse Files
                            <input
                              ref={fileRef}
                              type="file"
                              accept=".csv"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="text-xs text-charcoal-300 mt-3">Required: amount, transaction_hour, merchant_category, foreign_transaction, location_mismatch, device_trust_score, velocity_last_24h, cardholder_age</p>
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !selectedFile}
                      className="w-full py-3 text-sm font-medium text-white bg-sage-600 rounded-lg hover:bg-sage-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                          Processing... (this may take a moment)
                        </>
                      ) : (
                        selectedFile ? 'Upload & Analyze' : 'Select a file first'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Right: Results (3 cols) */}
          <div className="lg:col-span-3">
            <ResultsPanel fraudResults={fraudResults} safeResults={safeResults} />
          </div>
        </div>
      </div>
    </section>
  )
}
