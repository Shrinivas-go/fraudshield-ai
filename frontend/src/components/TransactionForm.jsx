import { useState } from 'react'

const CATEGORIES = ['Electronics', 'Travel', 'Grocery', 'Food', 'Clothing']

const DEFAULTS = {
  amount: '',
  transaction_hour: '',
  merchant_category: 'Electronics',
  foreign_transaction: 0,
  location_mismatch: 0,
  device_trust_score: '',
  velocity_last_24h: '',
  cardholder_age: '',
}

export default function TransactionForm({ onSubmit, loading }) {
  const [form, setForm] = useState({ ...DEFAULTS })

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      amount: parseFloat(form.amount),
      transaction_hour: parseInt(form.transaction_hour),
      merchant_category: form.merchant_category,
      foreign_transaction: form.foreign_transaction,
      location_mismatch: form.location_mismatch,
      device_trust_score: parseInt(form.device_trust_score),
      velocity_last_24h: parseInt(form.velocity_last_24h),
      cardholder_age: parseInt(form.cardholder_age),
    })
  }

  const inputCls = "w-full px-3 py-2 text-sm bg-sand-50 border border-sand-200 rounded-lg outline-none focus:border-sage-400 focus:ring-1 focus:ring-sage-200 text-charcoal-800 placeholder:text-charcoal-300 transition-colors"
  const labelCls = "block text-xs font-medium text-charcoal-500 mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Amount + Hour */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Amount (₹)</label>
          <input type="number" step="0.01" min="0" required value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="150.00" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Hour (0-23)</label>
          <input type="number" min="0" max="23" required value={form.transaction_hour} onChange={e => set('transaction_hour', e.target.value)} placeholder="14" className={inputCls} />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className={labelCls}>Merchant Category</label>
        <select value={form.merchant_category} onChange={e => set('merchant_category', e.target.value)} className={inputCls}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2 px-3 py-2 bg-sand-50 border border-sand-200 rounded-lg cursor-pointer hover:bg-sand-100 transition-colors">
          <input type="checkbox" checked={form.foreign_transaction === 1} onChange={e => set('foreign_transaction', e.target.checked ? 1 : 0)} className="accent-sage-600" />
          <span className="text-xs text-charcoal-600">Foreign Transaction</span>
        </label>
        <label className="flex items-center gap-2 px-3 py-2 bg-sand-50 border border-sand-200 rounded-lg cursor-pointer hover:bg-sand-100 transition-colors">
          <input type="checkbox" checked={form.location_mismatch === 1} onChange={e => set('location_mismatch', e.target.checked ? 1 : 0)} className="accent-coral-500" />
          <span className="text-xs text-charcoal-600">Location Mismatch</span>
        </label>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Device Trust</label>
          <input type="number" min="0" max="100" required value={form.device_trust_score} onChange={e => set('device_trust_score', e.target.value)} placeholder="75" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Velocity 24h</label>
          <input type="number" min="0" required value={form.velocity_last_24h} onChange={e => set('velocity_last_24h', e.target.value)} placeholder="3" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Age</label>
          <input type="number" min="18" max="120" required value={form.cardholder_age} onChange={e => set('cardholder_age', e.target.value)} placeholder="35" className={inputCls} />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 text-sm font-medium text-white bg-sage-600 rounded-lg hover:bg-sage-700 disabled:opacity-50 transition-all mt-2 cursor-pointer"
      >
        {loading ? 'Analyzing...' : 'Analyze Transaction'}
      </button>
    </form>
  )
}
