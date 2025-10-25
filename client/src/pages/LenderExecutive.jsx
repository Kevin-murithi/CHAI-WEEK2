import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QueueListIcon, ChartBarIcon, Cog6ToothIcon, ArrowRightIcon } from '@heroicons/react/24/solid'

export default function LenderExecutive() {
  const navigate = useNavigate()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const resp = await fetch('http://localhost:3000/api/lender/applications', { credentials: 'include' })
        if (!resp.ok) throw new Error('Failed to load applications')
        const data = await resp.json()
        setApps(data.applications || [])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const kpis = useMemo(() => {
    const total = apps.length
    const approved = apps.filter(a=>a.status==='approved').length
    const pending = apps.filter(a=>a.status==='pending').length
    const denied = apps.filter(a=>a.status==='denied').length
    return { total, approved, pending, denied }
  }, [apps])

  function ScoreBadge({ score }) {
    const color = score == null ? 'text-slate-300 border-slate-600' : score >= 67 ? 'text-emerald-300 border-emerald-500/50' : score >= 34 ? 'text-amber-300 border-amber-500/50' : 'text-rose-300 border-rose-500/50'
    return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs border ${color}`}>{score ?? 'NA'}</span>
  }
  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Executive Overview</h1>
        <p className="text-slate-400 text-sm">Jump into lender workflows quickly.</p>
      </div>
{/* 
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="text-slate-400 text-[11px] uppercase tracking-wide">Total</div>
          <div className="text-slate-100 text-xl font-semibold">{kpis.total}</div>
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="text-amber-300 text-[11px] uppercase tracking-wide">Pending</div>
          <div className="text-amber-100 text-xl font-semibold">{kpis.pending}</div>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="text-emerald-300 text-[11px] uppercase tracking-wide">Approved</div>
          <div className="text-emerald-100 text-xl font-semibold">{kpis.approved}</div>
        </div>
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
          <div className="text-rose-300 text-[11px] uppercase tracking-wide">Denied</div>
          <div className="text-rose-100 text-xl font-semibold">{kpis.denied}</div>
        </div>
      </div> */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/dashboard/lender/queue')}
          className="group text-left rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 p-5 transition-all duration-200 hover:scale-[1.02]"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300">
              <QueueListIcon className="w-6 h-6" />
            </div>
            <div className="text-slate-200 font-semibold">Application Queue</div>
            <ArrowRightIcon className="ml-auto w-4 h-4 text-emerald-300 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="text-slate-400 text-sm">Filter, review, and make decisions</div>
        </button>

        <button
          onClick={() => navigate('/dashboard/lender/portfolio')}
          className="group text-left rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/15 p-5 transition-all duration-200 hover:scale-[1.02]"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-300">
              <ChartBarIcon className="w-6 h-6" />
            </div>
            <div className="text-slate-200 font-semibold">Portfolio Management</div>
            <ArrowRightIcon className="ml-auto w-4 h-4 text-sky-300 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="text-slate-400 text-sm">Analytics, risk, and performance</div>
        </button>

        <button
          onClick={() => navigate('/dashboard/lender/admin')}
          className="group text-left rounded-xl border border-slate-700/60 bg-slate-800/60 hover:bg-slate-800 p-5 transition-all duration-200 hover:scale-[1.02]"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-slate-700/60 flex items-center justify-center text-slate-300">
              <Cog6ToothIcon className="w-6 h-6" />
            </div>
            <div className="text-slate-200 font-semibold">Admin & Reporting</div>
            <ArrowRightIcon className="ml-auto w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="text-slate-400 text-sm">Users, reports, and exports</div>
        </button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/70">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="text-slate-200 font-medium">Recent Applications</div>
          <button onClick={() => navigate('/dashboard/lender/queue')} className="text-sm text-blue-400 hover:text-blue-300">Open Queue →</button>
        </div>
        {error && <div className="px-4 py-3 text-sm text-rose-300">{error}</div>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-400">
              <tr className="text-left">
                <th className="px-4 py-2">Farmer</th>
                <th className="px-4 py-2">Field</th>
                <th className="px-4 py-2">Crop</th>
                <th className="px-4 py-2">Score</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(apps||[]).slice(0,5).map(a => (
                <tr key={a._id} className="border-t border-slate-800">
                  <td className="px-4 py-2 text-slate-200">{a.farmer?.firstName} {a.farmer?.lastName}</td>
                  <td className="px-4 py-2 text-slate-300">{a.field?.name}</td>
                  <td className="px-4 py-2 text-slate-300">{a.crop}</td>
                  <td className="px-4 py-2"><ScoreBadge score={a.field?.latestClimaScore} /></td>
                  <td className="px-4 py-2 capitalize text-slate-300">{a.status}</td>
                  <td className="px-4 py-2 text-slate-300">${a.requestedAmount}</td>
                </tr>
              ))}
              {!loading && !(apps||[]).length && (
                <tr>
                  <td className="px-4 py-4 text-slate-400" colSpan={6}>No applications yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
