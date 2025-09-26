import React from 'react'

function scoreColor(score){
  if (score == null) return 'text-slate-300'
  if (score >= 67) return 'text-emerald-400'
  if (score >= 34) return 'text-amber-400'
  return 'text-rose-400'
}

function areaKm2(geometry){
  try {
    // Very rough area indicator based on bbox (visual hint only)
    const coords = geometry?.coordinates?.[0] || []
    if (coords.length < 3) return null
    const lats = coords.map(c=>c[1]); const lngs = coords.map(c=>c[0])
    const dLat = Math.max(...lats)-Math.min(...lats)
    const dLng = Math.max(...lngs)-Math.min(...lngs)
    const approx = Math.abs(dLat * dLng) * 12300 // rough km^2 scaling for display
    return approx.toFixed(2)
  } catch { return null }
}

export default function FieldSnapshots({ fields = [], onOpen }) {
  if (!fields?.length) return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-slate-400 text-sm">No fields yet. Map your first field to see snapshots here.</div>
  )
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {fields.slice(0, 6).map((f) => {
        const area = areaKm2(f.geometry)
        return (
          <button
            key={f._id}
            onClick={() => onOpen?.(f)}
            className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 text-left p-4 hover:bg-slate-900/70 transition-colors"
          >
            <div className="absolute inset-0 opacity-70 pointer-events-none [background:radial-gradient(400px_180px_at_10%_-20%,rgba(59,130,246,0.12),transparent),radial-gradient(400px_180px_at_120%_10%,rgba(34,197,94,0.1),transparent)]" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <div className="text-slate-200 font-semibold leading-tight truncate max-w-[220px]">{f.name || 'Unnamed Field'}</div>
                <div className="text-slate-400 text-xs mt-0.5">{f.location || '—'}</div>
              </div>
              <div className={`text-lg font-semibold ${scoreColor(f.latestClimaScore)}`}>{f.latestClimaScore ?? '—'}</div>
            </div>
            <div className="relative mt-3 h-24 rounded-lg border border-slate-800 bg-gradient-to-br from-slate-900/60 to-slate-900/30 grid place-items-center">
              <svg width="100%" height="100%" viewBox="0 0 320 120" className="opacity-40">
                <defs>
                  <pattern id={`p-${f._id}`} width="8" height="8" patternUnits="userSpaceOnUse">
                    <path d="M0 8 L8 0" stroke="rgba(100,116,139,0.25)" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect x="0" y="0" width="320" height="120" fill={`url(#p-${f._id})`} />
                <circle cx="40" cy="60" r="8" fill="rgba(59,130,246,0.7)" />
                <circle cx="120" cy="40" r="6" fill="rgba(34,197,94,0.7)" />
                <circle cx="220" cy="75" r="5" fill="rgba(234,179,8,0.7)" />
                <circle cx="280" cy="50" r="7" fill="rgba(56,189,248,0.7)" />
              </svg>
            </div>
            <div className="relative mt-2 flex items-center justify-between text-xs text-slate-400">
              <div className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span> snapshot</div>
              <div>{area ? `${area} km² approx` : ''}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
