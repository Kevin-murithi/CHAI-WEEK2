import { useEffect, useMemo, useState } from 'react'
import { AIIcon } from '../advisory/AdvisoryIcons.jsx'

export default function AILoader({ minSeconds = 6, running = true }) {
  // Cycle status messages to simulate AI phases
  const messages = useMemo(() => ([
    'Waking up the models…',
    'Fetching satellite layers…',
    'Crunching field signals…',
    'Evaluating risk factors…',
    'Optimizing recommendations…',
    'Finalizing insights…',
  ]), [])
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setIdx(i => (i + 1) % messages.length), 1200)
    return () => clearInterval(t)
  }, [running, messages.length])

  return (
    <div className="w-full rounded-xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col items-center justify-center text-center select-none">
      <div className="relative">
        <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center animate-pulse">
          <AIIcon className="w-6 h-6 text-blue-300" />
        </div>
        <div className="absolute -inset-2 rounded-full border border-blue-500/20 animate-[ping_2s_ease-in-out_infinite]" />
      </div>
      <div className="mt-4 text-slate-200 font-medium">Generating personalized insights</div>
      <div className="mt-1 text-slate-400 text-sm h-5 transition-colors">{messages[idx]}</div>
      <div className="mt-4 w-full max-w-md h-2 rounded bg-slate-800 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-blue-500 animate-[progress_2.2s_linear_infinite]" style={{ width: '40%' }} />
      </div>
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(30%); }
          100% { transform: translateX(120%); }
        }
      `}</style>
      <div className="mt-3 text-[11px] uppercase tracking-wide text-slate-500">Minimum runtime {minSeconds}s</div>
    </div>
  )
}
