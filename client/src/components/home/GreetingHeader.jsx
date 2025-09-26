import React, { useMemo } from 'react'

export default function GreetingHeader({ user, aiSummary }) {
  const now = new Date()
  const hours = now.getHours()
  const greeting = useMemo(() => {
    if (hours < 5) return 'Good night'
    if (hours < 12) return 'Good morning'
    if (hours < 17) return 'Good afternoon'
    if (hours < 21) return 'Good evening'
    return 'Good night'
  }, [hours])

  const subtitle = useMemo(() => {
    if (!aiSummary) return 'Welcome back'
    const healthy = aiSummary?.vegetationSummary?.healthPercentage
    if (typeof healthy === 'number') return `${healthy}% of analyzed fields look healthy today`
    return 'Portfolio insights are ready'
  }, [aiSummary])

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:p-6">
      <div className="absolute inset-0 pointer-events-none opacity-60 [background:radial-gradient(1200px_300px_at_-10%_0,rgba(59,130,246,0.12),transparent),radial-gradient(1200px_300px_at_120%_50%,rgba(34,197,94,0.1),transparent)]" />
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-slate-300 text-sm">{new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' }).format(now)}</div>
          <h1 className="mt-0.5 text-2xl md:text-3xl font-semibold text-slate-100">
            {greeting}{user?.firstName ? `, ${user.firstName}` : ''}
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
            <span className="text-emerald-300 text-sm">Overall health</span>
            <span className="text-emerald-400 font-semibold text-lg">
              {aiSummary?.fieldHealthScore?.overallScore ?? '—'}
            </span>
            <span className="text-emerald-300 text-xs">/100</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2">
            <span className="text-blue-300 text-sm">Yield</span>
            <span className="text-blue-300 font-semibold text-lg">
              {aiSummary?.yieldPrediction?.estimatedYield ?? '—'}
            </span>
            <span className="text-blue-300 text-xs">t</span>
          </div>
        </div>
      </div>
    </div>
  )
}
