import PropTypes from 'prop-types'
import Card from '../ui/Card.jsx'
import { AIIcon, DropIcon, LeafIcon, SunCloudIcon, BugIcon, ClipboardIcon, SoilIcon, PlantingIcon, HarvestIcon } from './AdvisoryIcons.jsx'

function priorityBg(priority) {
  switch (priority) {
    case 'high': return 'bg-rose-500'
    case 'medium': return 'bg-amber-500'
    case 'low': return 'bg-emerald-500'
    default: return 'bg-slate-500'
  }
}

function typeIcon(type) {
  switch (type) {
    case 'irrigation': return <DropIcon />
    case 'fertilizer': return <LeafIcon />
    case 'weather': return <SunCloudIcon />
    case 'pest': return <BugIcon />
    case 'soil': return <SoilIcon />
    case 'planting': return <PlantingIcon />
    case 'harvest': return <HarvestIcon />
    case 'general':
    default:
      return <ClipboardIcon />
  }
}

export default function AIRecommendations({ advisory, loading, onRefresh }) {
  return (
    <Card
      title={<span className="flex items-center gap-2"><AIIcon className="w-4 h-4" /> <span>AI Recommendations</span></span>}
      subtitle={advisory ? (
        <span>
          Generated {new Date(advisory.generatedAt).toLocaleString()} • Confidence: {Math.round(advisory.confidence * 100)}%
        </span>
      ) : null}
      className="mb-4"
      headerRight={
        <button
          onClick={onRefresh}
          disabled={loading}
          className={`inline-flex items-center gap-2 rounded-md bg-blue-600 text-white px-3 py-1.5 text-sm transition hover:bg-blue-500 disabled:opacity-60`}
        >
          {loading ? 'Refreshing…' : 'Refresh Insights'}
        </button>
      }
    >
      {loading && <div className="text-slate-400 text-sm">Generating personalized recommendations…</div>}
      {advisory?.recommendations?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {advisory.recommendations.map(rec => (
            <div key={rec.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex items-start gap-3">
                <div className="leading-none text-slate-300">{typeIcon(rec.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-slate-200 font-semibold text-sm flex items-center gap-2">
                      <span>{rec.title}</span>
                      <span className={`inline-flex text-white text-xs px-2 py-0.5 rounded ${priorityBg(rec.priority)}`}>{rec.priority}</span>
                    </div>
                    {rec.confidence && (
                      <div className="text-slate-400 text-xs">{Math.round(rec.confidence * 100)}% confidence</div>
                    )}
                  </div>
                  <div className="text-slate-400 text-sm mt-1">{rec.description}</div>
                  {rec.actionItems?.length > 0 && (
                    <div className="mt-2">
                      <div className="text-slate-300 text-xs font-semibold">Action Items:</div>
                      <ul className="list-disc list-inside text-slate-300 text-sm space-y-0.5">
                        {rec.actionItems.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !loading && (
        <div className="text-slate-400 text-sm">No recommendations available. Try refreshing or add more field data.</div>
      )}
    </Card>
  )
}

AIRecommendations.propTypes = {
  advisory: PropTypes.object,
  loading: PropTypes.bool,
  onRefresh: PropTypes.func,
}
