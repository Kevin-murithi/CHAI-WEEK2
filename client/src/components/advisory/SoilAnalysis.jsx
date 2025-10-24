import PropTypes from 'prop-types'
import Card from '../ui/Card.jsx'
import { SoilIcon, LeafIcon } from './AdvisoryIcons.jsx'

export default function SoilAnalysis({ data }) {
  if (!data) return null
  const scoreColor = (v) => v > 80 ? 'text-emerald-400' : v > 60 ? 'text-amber-400' : 'text-rose-400'
  const pct = (v, max=100) => Math.max(0, Math.min(100, Math.round((Number(v||0)/max)*100)))
  return (
    <Card title={<span className="flex items-center gap-2"><SoilIcon className="w-4 h-4" /> <span>Soil Analysis</span></span>} className="mb-4">
      {/* Core Properties */}
      <h4 className="text-slate-300 font-medium mb-2">Core Properties</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="group rounded-xl border border-slate-800/50 bg-gradient-to-br from-slate-900/70 to-slate-800/50 backdrop-blur-sm p-4">
          <div className="text-slate-400 text-sm">Soil Health</div>
          <div className={`text-2xl font-semibold ${scoreColor(data.overallHealth)}`}>{data.overallHealth}/100</div>
          <div className="text-slate-400 text-xs">Overall score</div>
        </div>
        <div className="group rounded-xl border border-slate-800/50 bg-gradient-to-br from-slate-900/70 to-slate-800/50 backdrop-blur-sm p-4">
          <div className="text-slate-400 text-sm">pH Level</div>
          <div className="text-2xl font-semibold text-slate-200">{data.ph}</div>
          <div className="text-slate-400 text-xs">Temp: {data.temperature}°C</div>
        </div>
        <div className="group rounded-xl border border-slate-800/50 bg-gradient-to-br from-slate-900/70 to-slate-800/50 backdrop-blur-sm p-4">
          <div className="text-slate-400 text-sm">Organic Matter</div>
          <div className="text-2xl font-semibold text-slate-200">{data.organicMatter}%</div>
          <div className="text-slate-400 text-xs">Drainage: {data.drainage}</div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-xl border border-slate-800/50 bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-sm p-4">
          <h4 className="text-slate-300 font-medium mb-2 inline-flex items-center gap-2"><LeafIcon /> <span>Nutrient Levels</span></h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Nitrogen */}
            <div className="rounded-xl border border-slate-800/50 bg-slate-900/60 p-3">
              <div className="flex items-center justify-between">
                <div className="text-slate-200 text-sm font-semibold">Nitrogen (N)</div>
                <div className={`text-xs ${data.nutrients?.nitrogen > 50 ? 'text-emerald-400' : 'text-amber-400'}`}>{data.nutrients?.nitrogen || 0}%</div>
              </div>
              <div className="mt-2 h-2 rounded bg-slate-800 overflow-hidden" aria-label="Nitrogen level">
                <div className={`h-full ${data.nutrients?.nitrogen > 50 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: pct(data.nutrients?.nitrogen)+'%' }} />
              </div>
            </div>
            {/* Phosphorus */}
            <div className="rounded-xl border border-slate-800/50 bg-slate-900/60 p-3">
              <div className="flex items-center justify-between">
                <div className="text-slate-200 text-sm font-semibold">Phosphorus (P)</div>
                <div className={`text-xs ${data.nutrients?.phosphorus > 30 ? 'text-emerald-400' : 'text-amber-400'}`}>{data.nutrients?.phosphorus || 0}%</div>
              </div>
              <div className="mt-2 h-2 rounded bg-slate-800 overflow-hidden" aria-label="Phosphorus level">
                <div className={`${data.nutrients?.phosphorus > 30 ? 'bg-emerald-500' : 'bg-amber-500'} h-full`} style={{ width: pct(data.nutrients?.phosphorus)+'%' }} />
              </div>
            </div>
            {/* Potassium */}
            <div className="rounded-xl border border-slate-800/50 bg-slate-900/60 p-3">
              <div className="flex items-center justify-between">
                <div className="text-slate-200 text-sm font-semibold">Potassium (K)</div>
                <div className={`text-xs ${data.nutrients?.potassium > 40 ? 'text-emerald-400' : 'text-amber-400'}`}>{data.nutrients?.potassium || 0}%</div>
              </div>
              <div className="mt-2 h-2 rounded bg-slate-800 overflow-hidden" aria-label="Potassium level">
                <div className={`${data.nutrients?.potassium > 40 ? 'bg-emerald-500' : 'bg-amber-500'} h-full`} style={{ width: pct(data.nutrients?.potassium)+'%' }} />
              </div>
            </div>
          </div>
        </section>

        {data.recommendations?.length > 0 && (
          <section className="rounded-xl border border-slate-800/50 bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-sm p-4">
            <h4 className="text-slate-300 font-medium mb-2 inline-flex items-center gap-2"><LeafIcon /> <span>Soil Improvement Tips</span></h4>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm">
              {data.recommendations.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Card>
  )
}

SoilAnalysis.propTypes = { data: PropTypes.object }
