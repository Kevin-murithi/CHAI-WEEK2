import PropTypes from 'prop-types'
import { useState } from 'react'
import Card from '../ui/Card.jsx'
import { PlantingIcon, CalendarIcon, AlertIcon } from './AdvisoryIcons.jsx'

export default function PlantingWindowAdvice({ data }) {
  if (!data) return null
  const [showWindows, setShowWindows] = useState(true)
  const [showRisks, setShowRisks] = useState(true)
  return (
    <Card
      title={<span className="flex items-center gap-2"><PlantingIcon className="w-4 h-4" /> <span>Optimal Planting Windows</span></span>}
      subtitle={<span>Current Season: {data.currentSeason} • Soil Readiness: {data.soilReadiness?.status?.replace('_',' ')}</span>}
      className="mb-4"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="space-y-4">
          {data.nextBestWindow && (
            <div className="rounded-lg border border-sky-700/40 bg-sky-900/20 p-4">
              <div className="text-slate-200 text-sm font-semibold inline-flex items-center gap-2"><CalendarIcon /> <span>Next Recommended Window</span></div>
              <div className="mt-1 flex items-center justify-between">
                <div>
                  <div className="text-slate-300 text-sm">{data.nextBestWindow.start} - {data.nextBestWindow.end}</div>
                  <div className="text-slate-400 text-xs">Risk Level: {data.nextBestWindow.riskLevel}</div>
                </div>
                <div>
                  <div className="text-sky-300 text-lg font-semibold">{data.nextBestWindow.daysUntil} days</div>
                  <div className="text-slate-400 text-xs">until window</div>
                </div>
              </div>
            </div>
          )}

          {data.optimalWindows?.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-slate-300 font-medium inline-flex items-center gap-2"><CalendarIcon /> <span>All Planting Windows</span></h4>
                <button onClick={()=>setShowWindows(v=>!v)} className="text-xs rounded border border-slate-700 px-2 py-1 text-slate-200 hover:bg-slate-800">
                  {showWindows ? 'Hide' : 'Show'}
                </button>
              </div>
              {showWindows && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                  {data.optimalWindows.map((window, idx) => (
                    <div key={idx} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                      <div className="text-slate-200 text-sm font-semibold">{window.start} - {window.end}</div>
                      <div className="text-slate-400 text-xs">Risk: {window.riskLevel}</div>
                      <div className="text-slate-400 text-xs">Confidence: {window.confidence}%</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {data.riskFactors?.length > 0 && (
          <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-slate-300 font-medium inline-flex items-center gap-2"><AlertIcon /> <span>Planting Risk Factors</span></h4>
              <button onClick={()=>setShowRisks(v=>!v)} className="text-xs rounded border border-slate-700 px-2 py-1 text-slate-200 hover:bg-slate-800">
                {showRisks ? 'Hide' : 'Show'}
              </button>
            </div>
            {showRisks && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.riskFactors.map((risk, idx) => (
                  <div key={idx} className="rounded-lg border border-amber-700/40 bg-amber-900/10 p-3 flex items-center justify-between">
                    <div>
                      <div className="text-slate-200 text-sm font-semibold">{risk.type.toUpperCase()}</div>
                      <div className="text-slate-400 text-xs">{risk.mitigation}</div>
                    </div>
                    <div className="inline-flex items-center bg-amber-100/10 text-amber-200 text-xs px-2 py-1 rounded">{risk.probability}% chance</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </Card>
  )
}

PlantingWindowAdvice.propTypes = { data: PropTypes.object }
