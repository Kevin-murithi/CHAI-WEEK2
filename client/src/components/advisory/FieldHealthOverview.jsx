import PropTypes from 'prop-types'
import Card from '../ui/Card.jsx'
import { OverviewIcon, AlertIcon, CalendarIcon } from './AdvisoryIcons.jsx'

export default function FieldHealthOverview({ data }) {
  if (!data) return null
  const kpiColor = (score) => score > 80 ? 'text-emerald-400' : score > 60 ? 'text-amber-400' : 'text-rose-400'
  return (
    <Card title={<span className="flex items-center gap-2"><OverviewIcon className="w-4 h-4" /> <span>Field Health Overview</span></span>} className="mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.fieldHealthScore && (
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <div className="text-slate-400 text-sm">Overall Health Score</div>
            <div className={`text-2xl font-semibold ${kpiColor(data.fieldHealthScore.overallScore)}`}>{data.fieldHealthScore.overallScore}/100</div>
            <div className="text-slate-400 text-xs">Status: {data.fieldHealthScore.status}</div>
          </div>
        )}
        {data.yieldPrediction && (
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <div className="text-slate-400 text-sm">Predicted Yield</div>
            <div className="text-2xl font-semibold text-slate-200">{data.yieldPrediction.estimatedYield} {data.yieldPrediction.unit}</div>
            <div className="text-slate-400 text-xs">Range: {data.yieldPrediction.confidenceRange?.min} - {data.yieldPrediction.confidenceRange?.max} tons</div>
          </div>
        )}
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-slate-400 text-sm">Risk Warnings</div>
          <div className="text-2xl font-semibold text-slate-200">{data.riskWarnings?.length || 0}</div>
          <div className="text-slate-400 text-xs">Active alerts</div>
        </div>
      </div>

      {(data.riskWarnings?.length || data.timingRecommendations?.length) ? (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.riskWarnings?.length > 0 && (
            <section>
              <h4 className="text-slate-300 font-medium mb-2 inline-flex items-center gap-2"><AlertIcon /> <span>Risk Warnings</span></h4>
              <div className="space-y-2">
                {data.riskWarnings.map((warning, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 flex items-center justify-between">
                    <div>
                      <div className="text-slate-200 text-sm font-semibold">{warning.type.toUpperCase()} - {warning.severity}</div>
                      <div className="text-slate-400 text-xs">{warning.message}</div>
                    </div>
                    <div className="text-slate-400 text-xs">{warning.timeframe}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.timingRecommendations?.length > 0 && (
            <section>
              <h4 className="text-slate-300 font-medium mb-2 inline-flex items-center gap-2"><CalendarIcon /> <span>Timing Recommendations</span></h4>
              <div className="space-y-2">
                {data.timingRecommendations.map((rec, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 flex items-center justify-between">
                    <div>
                      <div className="text-slate-200 text-sm font-semibold">{rec.activity.replace('_', ' ').toUpperCase()}</div>
                      <div className="text-slate-400 text-xs">{rec.description}</div>
                    </div>
                    <div className="text-slate-400 text-xs">{new Date(rec.recommendedDate).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : null}
    </Card>
  )
}

FieldHealthOverview.propTypes = { data: PropTypes.object }
