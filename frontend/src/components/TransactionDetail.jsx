import { useState, useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import { GaugeChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import { TooltipComponent } from 'echarts/components'

echarts.use([GaugeChart, CanvasRenderer, TooltipComponent])

function MiniGauge({ value }) {
  const chartRef = useRef(null)

  useEffect(() => {
    if (!chartRef.current) return
    const chart = echarts.init(chartRef.current)

    const color = value >= 80 ? '#d94332' : value >= 50 ? '#d97706' : '#2f7d4a'
    chart.setOption({
      series: [{
        type: 'gauge', startAngle: 200, endAngle: -20,
        min: 0, max: 100, radius: '100%',
        pointer: { show: false },
        progress: { show: true, width: 12, itemStyle: { color } },
        axisLine: { lineStyle: { width: 12, color: [[1, '#e8e4db']] } },
        axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false },
        detail: {
          fontSize: 22, fontFamily: 'Jost', fontWeight: 600, color,
          formatter: `${value.toFixed(1)}%`, offsetCenter: [0, '10%'],
        },
        data: [{ value }],
      }],
    })
    return () => chart.dispose()
  }, [value])

  return <div ref={chartRef} style={{ width: '160px', height: '128px' }} />
}

export default function TransactionDetail({ transactionId, inlineResult }) {
  const [detail, setDetail] = useState(inlineResult || null)

  useEffect(() => {
    if (inlineResult) setDetail(inlineResult)
  }, [inlineResult])

  if (!detail) return <div className="p-6 text-sm text-charcoal-400 text-center">No details available.</div>

  const prob = detail.fraud_probability
  const probPct = prob * 100
  const isRisky = detail.risk_level === 'high_risk' || detail.risk_level === 'medium_risk'
  const topFeatures = detail.explainability?.top_features || []
  const explanation = detail.explanation || null

  return (
    <div className="p-4 space-y-4">
      {/* Top row: Gauge + Explanation summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Gauge */}
        <div className="flex flex-col items-center">
          <p className="text-xs font-medium text-charcoal-500 mb-1">Fraud Score</p>
          <MiniGauge value={probPct} />
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${
            isRisky ? 'bg-coral-100 text-coral-700' : 'bg-sage-100 text-sage-700'
          }`}>
            {detail.risk_level?.replace('_', ' ')}
          </span>
        </div>

        {/* Key Contributing Factors — feature importance bars */}
        <div>
          <p className="text-xs font-medium text-charcoal-500 mb-2">Key Contributing Factors</p>
          <div className="space-y-1.5">
            {topFeatures.slice(0, 5).map((f, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-0.5">
                  <span className="text-charcoal-600 truncate">{f.feature?.replace(/_/g, ' ')}</span>
                  <span className="text-charcoal-400 font-mono">{(f.importance * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 bg-sand-200 rounded-full">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      f.importance > 0.2 ? 'bg-coral-400' : f.importance > 0.1 ? 'bg-amber-400' : 'bg-sage-400'
                    }`}
                    style={{ width: `${Math.min(f.importance * 300, 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {topFeatures.length === 0 && <p className="text-xs text-charcoal-300">No feature data available.</p>}
          </div>
        </div>
      </div>

      {/* Human-readable explanation */}
      {explanation && (
        <div className={`rounded-xl p-4 border ${
          isRisky ? 'bg-coral-50/50 border-coral-200' : 'bg-sage-50/50 border-sage-200'
        }`}>
          <div className="flex items-start gap-2 mb-3">
            {isRisky ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-coral-500 shrink-0 mt-0.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sage-500 shrink-0 mt-0.5">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            )}
            <p className={`text-sm leading-relaxed ${isRisky ? 'text-coral-800' : 'text-sage-800'}`}>
              {explanation.summary}
            </p>
          </div>

          {/* Individual reasons */}
          {explanation.reasons && explanation.reasons.length > 0 && (
            <div className="space-y-2 mt-3 pt-3 border-t border-sand-200/60">
              <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400">Detailed Breakdown</p>
              {explanation.reasons.map((reason, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className={`shrink-0 mt-1 w-1.5 h-1.5 rounded-full ${
                    reason.is_risk_factor ? 'bg-coral-400' : 'bg-sage-400'
                  }`} />
                  <div>
                    <span className={`text-xs font-semibold ${
                      reason.is_risk_factor ? 'text-coral-700' : 'text-sage-700'
                    }`}>
                      {reason.feature}:
                    </span>{' '}
                    <span className="text-xs text-charcoal-500">{reason.explanation}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input Data */}
      {detail.input_data && (
        <div>
          <p className="text-xs font-medium text-charcoal-500 mb-2">Transaction Data</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(detail.input_data).map(([k, v]) => (
              <div key={k} className="px-2.5 py-1.5 bg-sand-50 rounded-lg">
                <span className="text-[10px] text-charcoal-400 block">{k.replace(/_/g, ' ')}</span>
                <span className="text-xs font-medium text-charcoal-700">{k === 'amount' ? `₹${v}` : String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
