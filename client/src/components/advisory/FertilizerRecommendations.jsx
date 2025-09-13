import PropTypes from 'prop-types'
import { useState, useMemo } from 'react'
import Card from '../ui/Card.jsx'
import { FertilizerIcon } from './AdvisoryIcons.jsx'

function priorityBg(priority) {
  switch (priority) {
    case 'high': return 'bg-rose-500'
    case 'medium': return 'bg-amber-500'
    case 'low': return 'bg-emerald-500'
    default: return 'bg-slate-500'
  }
}

export default function FertilizerRecommendations({ data }) {
  const hasRecs = data?.recommendations?.length > 0
  if (!hasRecs) return null
  // Group schedules by product name (best-effort match by first token)
  const schedulesByProduct = useMemo(() => {
    const map = {}
    const list = data.applicationSchedule || []
    list.forEach((s) => {
      const key = (s.product || '').split(' ')[0]
      if (!map[key]) map[key] = []
      map[key].push(s)
    })
    return map
  }, [data])
  const [open, setOpen] = useState({})
  const toggle = (key) => setOpen((p) => ({ ...p, [key]: !p[key] }))
  return (
    <Card
      title={<span className="flex items-center gap-2"><FertilizerIcon className="w-4 h-4" /> <span>Fertilizer Recommendations</span></span>}
      subtitle={
        <span>
          Total Estimated Cost: ${data.totalEstimatedCost} • Expected Yield Increase: +{data.expectedYieldIncrease}%
        </span>
      }
      className="mb-4"
    >
      <div className="flex flex-wrap -mx-1 lg:-mx-1.5">
        {data.recommendations.map((rec, idx) => {
          const key = (rec.product || '').split(' ')[0]
          const productSchedules = schedulesByProduct[key] || []
          const isOpen = !!open[key]
          return (
            <div key={idx} className="basis-full sm:basis-1/2 lg:basis-1/3 grow-0 shrink-0 px-1 lg:px-1.5 mb-3">
              <div className="h-full rounded-xl border border-slate-800 bg-slate-900/60 p-3 hover:bg-slate-900/70 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-slate-200 text-sm font-semibold">{rec.product}</div>
                    <div className="text-slate-400 text-xs">{rec.reason}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded bg-slate-800 text-slate-200 text-xs px-2 py-1">{rec.amount} {rec.unit}</span>
                      <span className="inline-flex items-center rounded bg-blue-900/40 text-blue-200 text-xs px-2 py-1">${rec.cost}</span>
                      {rec.timing && (
                        <span className="inline-flex items-center rounded bg-slate-800 text-slate-300 text-xs px-2 py-1">{rec.timing}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex mt-0.5 text-white text-xs px-2 py-1 rounded ${priorityBg(rec.priority)}`}>{rec.priority}</div>
                  </div>
                </div>

                {productSchedules.length > 0 && (
                  <div className="mt-3">
                    <button
                      onClick={() => toggle(key)}
                      className="text-xs inline-flex items-center gap-2 rounded border border-slate-700 px-2 py-1 text-slate-200 hover:bg-slate-800"
                      aria-expanded={isOpen}
                      aria-controls={`schedule-${key}`}
                    >
                      {isOpen ? 'Hide Application Schedule' : 'Show Application Schedule'}
                      <svg className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    {isOpen && (
                      <div id={`schedule-${key}`} className="mt-2 grid grid-cols-1 gap-2">
                        {productSchedules.map((s, i) => (
                          <div key={i} className="rounded-lg border border-slate-800 bg-slate-900/50 p-2 flex items-center justify-between">
                            <div className="text-slate-300 text-xs">{s.timing}</div>
                            <div className="text-slate-400 text-xs">{s.amount}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

FertilizerRecommendations.propTypes = { data: PropTypes.object }
