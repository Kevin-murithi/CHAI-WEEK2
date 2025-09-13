import PropTypes from 'prop-types'
import Card from '../ui/Card.jsx'
import { SatelliteIcon, AlertIcon } from './AdvisoryIcons.jsx'

export default function SatelliteAnalysis({ data }) {
  if (!data) return null
  const ndviColor = (v) => v > 0.6 ? 'text-emerald-400' : v > 0.4 ? 'text-amber-400' : 'text-rose-400'
  return (
    <Card title={<span className="flex items-center gap-2"><SatelliteIcon className="w-4 h-4" /> <span>Satellite Analysis</span></span>} className="mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-slate-400 text-sm">NDVI Index</div>
          <div className={`text-2xl font-semibold ${ndviColor(data.ndvi)}`}>{data.ndvi}</div>
          <div className="text-slate-400 text-xs">Vegetation: {data.vegetationHealth}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-slate-400 text-sm">Crop Stage</div>
          <div className="text-2xl font-semibold text-slate-200">{data.cropStage?.replace('_', ' ')}</div>
          <div className="text-slate-400 text-xs">Coverage: {data.coveragePercentage}%</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-slate-400 text-sm">Stress Indicators</div>
          <div className="text-2xl font-semibold text-slate-200">{data.stressIndicators?.length || 0}</div>
          <div className="text-slate-400 text-xs">Detected issues</div>
        </div>
      </div>

      {data.stressIndicators?.length > 0 && (
        <div className="mt-4">
          <h4 className="text-slate-300 font-medium mb-2 inline-flex items-center gap-2"><AlertIcon /> <span>Stress Indicators</span></h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.stressIndicators.map((indicator, idx) => (
              <div key={idx} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <div className="text-slate-200 text-sm font-semibold">{indicator.type.replace('_', ' ').toUpperCase()} - {indicator.severity}</div>
                <div className="text-slate-400 text-xs">{indicator.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

SatelliteAnalysis.propTypes = { data: PropTypes.object }
