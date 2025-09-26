import React from 'react'
import {
  SparklesIcon,
  ArrowRightIcon,
  ChartBarIcon,
  GlobeAltIcon,
  RocketLaunchIcon,
  ClipboardDocumentListIcon,
  BoltIcon,
  LightBulbIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid'

function MetricCard({ tone = 'blue', icon, label, value, unit, status }) {
  const tones = {
    green: {
      border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-300', value: 'text-emerald-400'
    },
    blue: {
      border: 'border-sky-500/30', bg: 'bg-sky-500/10', text: 'text-sky-300', value: 'text-sky-400'
    },
    amber: {
      border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-300', value: 'text-amber-400'
    },
    violet: {
      border: 'border-violet-500/30', bg: 'bg-violet-500/10', text: 'text-violet-300', value: 'text-violet-400'
    }
  }[tone]

  return (
    <div className={`relative overflow-hidden rounded-xl border ${tones.border} ${tones.bg} p-3`}> 
      <div className="absolute inset-0 opacity-60 pointer-events-none [background:radial-gradient(400px_180px_at_10%_-20%,rgba(59,130,246,0.12),transparent)]" />
      <div className="relative flex items-start gap-3">
        <div className="leading-none text-slate-200">
          {icon}
        </div>
        <div>
          <div className={`text-xs ${tones.text}`}>{label}</div>
          <div className={`text-2xl font-semibold ${tones.value}`}>
            {value}{unit && <span className="text-sm opacity-80 ml-0.5">{unit}</span>}
          </div>
          {status && <div className="text-xs text-slate-400 mt-0.5">{status}</div>}
        </div>
      </div>
    </div>
  )
}

export default function AiPortfolioInsights({ aiSummary, onView, compact = false }) {
  if (!aiSummary) return null
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 ${compact ? 'p-3' : 'p-4'}`}>
      <div className="absolute inset-0 pointer-events-none opacity-70 [background:radial-gradient(900px_300px_at_0%_-10%,rgba(56,189,248,0.12),transparent),radial-gradient(900px_300px_at_120%_10%,rgba(59,130,246,0.1),transparent),radial-gradient(900px_300px_at_0%_110%,rgba(34,197,94,0.08),transparent)]" />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-sky-300" />
          <div>
            <div className="text-slate-100 font-semibold">AI Portfolio Insights</div>
            <div className="text-slate-400 text-xs">Powered by field analytics</div>
          </div>
        </div>
        <button onClick={onView} className="inline-flex items-center gap-1 rounded-md border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-sky-200 text-sm hover:bg-sky-500/15">
          View Details <ArrowRightIcon className="w-4 h-4" />
        </button>
      </div>
      <div className={`relative grid ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'} gap-3 mt-3`}>
        {aiSummary.fieldHealthScore && (
          <MetricCard 
            tone="green"
            icon={<GlobeAltIcon className="w-5 h-5 text-emerald-300" />}
            label="Portfolio Health"
            value={aiSummary.fieldHealthScore.overallScore}
            unit="/100"
            status={aiSummary.fieldHealthScore.status}
          />
        )}
        {aiSummary.yieldPrediction && (
          <MetricCard 
            tone="blue"
            icon={<ChartBarIcon className="w-5 h-5 text-sky-300" />}
            label="Expected Yield"
            value={aiSummary.yieldPrediction.estimatedYield}
            unit="t"
            status="Total across portfolio"
          />
        )}
        {aiSummary.vegetationSummary && (
          <MetricCard 
            tone="amber"
            icon={<RocketLaunchIcon className="w-5 h-5 text-amber-300" />}
            label="Vegetation Health"
            value={`${aiSummary.vegetationSummary.healthyFields}/${aiSummary.vegetationSummary.totalAnalyzed}`}
            status={`${aiSummary.vegetationSummary.healthPercentage}% healthy`}
          />
        )}
        {aiSummary.soilAnalysis && (
          <MetricCard 
            tone="violet"
            icon={<GlobeAltIcon className="w-5 h-5 text-violet-300" />}
            label="Soil Quality"
            value={aiSummary.soilAnalysis.overallHealth}
            unit="/100"
            status={aiSummary.soilAnalysis.status}
          />
        )}
      </div>
      {(aiSummary.fertilizerRecommendations?.totalRecommendations > 0 || aiSummary.plantingWindowAdvice?.nextBestWindow || aiSummary.riskWarnings?.length > 0) && (
        <div className="relative mt-3 flex flex-wrap items-center gap-2">
          {aiSummary.isAggregated && aiSummary.analyzedFields && (
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300"><ClipboardDocumentListIcon className="w-3.5 h-3.5"/> {aiSummary.analyzedFields}/{aiSummary.totalFields} fields analyzed</span>
          )}
          {aiSummary.fertilizerRecommendations?.highPriority > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs text-rose-200"><BoltIcon className="w-3.5 h-3.5"/> {aiSummary.fertilizerRecommendations.highPriority} urgent</span>
          )}
          {aiSummary.fertilizerRecommendations?.totalRecommendations > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-200"><LightBulbIcon className="w-3.5 h-3.5"/> {aiSummary.fertilizerRecommendations.totalRecommendations} recs</span>
          )}
          {aiSummary.plantingWindowAdvice?.nextBestWindow && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-200"><GlobeAltIcon className="w-3.5 h-3.5"/> Next window in {aiSummary.plantingWindowAdvice.nextBestWindow.daysUntil} days</span>
          )}
          {aiSummary.riskWarnings?.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1 text-xs text-yellow-200"><ExclamationTriangleIcon className="w-3.5 h-3.5"/> {aiSummary.riskWarnings.length} risk</span>
          )}
        </div>
      )}
    </div>
  )
}
