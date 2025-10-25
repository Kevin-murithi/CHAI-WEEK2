import { useEffect, useMemo, useState } from 'react'

function useApplications() {
  const [apps, setApps] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  async function load(params = {}) {
    try {
      setLoading(true)
      const qs = new URLSearchParams(params).toString()
      const resp = await fetch(`http://localhost:3000/api/lender/applications${qs?`?${qs}`:''}`, { credentials: 'include' })
      if (!resp.ok) throw new Error('Failed to load applications')
      const data = await resp.json()
      setApps(data.applications || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])
  return { apps, error, loading, reload: load }
}

function ScoreBadge({ score }) {
  const color = score == null ? '#64748b' : score >= 67 ? '#22c55e' : score >= 34 ? '#eab308' : '#ef4444'
  return <span className="badge" style={{background:'#0e1729', borderColor: color, color}}>{score ?? 'NA'}</span>
}

export default function LenderConsole() {
  const { apps, error, loading, reload } = useApplications()
  const [filter, setFilter] = useState({ status: '', crop: '', band: '' })
  const [selected, setSelected] = useState(null)
  const [action, setAction] = useState({ action: 'approve', amount: '', interestRate: '', comments: '' })
  const [sensors, setSensors] = useState([])
  const [page, setPage] = useState(1)
  const pageSize = 10
  
  const filtered = useMemo(() => {
    return apps.filter(a => {
      if (filter.status && a.status !== filter.status) return false
      if (filter.crop && a.crop !== filter.crop) return false
      if (filter.band) {
        const s = a.field?.latestClimaScore
        const band = s == null ? 'unknown' : (s >= 67 ? 'green' : s >= 34 ? 'yellow' : 'red')
        if (band !== filter.band) return false
      }
      return true
    })
  }, [apps, filter])

  useEffect(() => { setPage(1) }, [filter, apps])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page])

  function StatusBadge({ status }) {
    const map = {
      approved: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10',
      pending: 'border-amber-500/40 text-amber-300 bg-amber-500/10',
      denied: 'border-rose-500/40 text-rose-300 bg-rose-500/10',
      needs_info: 'border-sky-500/40 text-sky-300 bg-sky-500/10'
    }
    const cls = map[status] || 'border-slate-600 text-slate-300 bg-slate-700/30'
    return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs border capitalize ${cls}`}>{status?.replace('_',' ')||'—'}</span>
  }

  function exportCSV() {
    const headers = ['Farmer','Field','Crop','Score','Status','Requested']
    const rows = filtered.map(a => [
      `${a.farmer?.firstName||''} ${a.farmer?.lastName||''}`.trim(),
      a.field?.name||'',
      a.crop||'',
      a.field?.latestClimaScore ?? '',
      a.status||'',
      a.requestedAmount ?? ''
    ])
    const csv = [headers, ...rows].map(r => r.map(v => typeof v==='string' && v.includes(',') ? `"${v}"` : v).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'applications.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  async function openReview(app) {
    try {
      const resp = await fetch(`http://localhost:3000/api/lender/applications/${app._id}`, { credentials: 'include' })
      if (!resp.ok) throw new Error('Failed to load application')
      const data = await resp.json()
      setSelected(data.application)
      setAction({ action: 'approve', amount: data.application?.requestedAmount || app.requestedAmount || '', interestRate: data.application?.climascoreSnapshot?.recommended_loan_terms?.interest_rate || '', comments: '' })
      // fetch sensors
      const sres = await fetch(`http://localhost:3000/api/lender/applications/${app._id}/sensors`, { credentials: 'include' })
      if (sres.ok) {
        const sdata = await sres.json(); setSensors(sdata.readings || [])
      } else { setSensors([]) }
      document.getElementById('lender-modal-backdrop').style.display = 'block'
      const el = document.getElementById('review-modal')
      if (el) el.showModal()
    } catch (e) {
      alert(e.message)
    }
  }

  async function submitDecision(e) {
    e.preventDefault()
    if (!selected) return
    try {
      const resp = await fetch(`http://localhost:3000/api/lender/applications/${selected._id}/decision`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(action)
      })
      if (!resp.ok) throw new Error('Failed to submit decision')
      document.getElementById('review-modal')?.close()
      document.getElementById('lender-modal-backdrop').style.display = 'none'
      setSelected(null)
      reload()
    } catch (e) {
      alert(e.message)
    }
  }

  const total = apps.length
  const approved = apps.filter(a => a.status==='approved').length
  const pending = apps.filter(a => a.status==='pending').length
  const denied = apps.filter(a => a.status==='denied').length

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 text-slate-200">
      <div className="px-4 py-3 border-b border-slate-800"><h3 className="text-slate-100 text-lg font-semibold">Portfolio Overview</h3></div>
      {error && <div className="error">{error}</div>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 min-w-[180px]"><div className="text-slate-400 text-[11px] uppercase tracking-wide">Total</div><div className="text-xl font-semibold">{total}</div></div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 min-w-[180px]"><div className="text-amber-300 text-[11px] uppercase tracking-wide">Pending</div><div className="text-xl font-semibold text-amber-100">{pending}</div></div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 min-w-[180px]"><div className="text-emerald-300 text-[11px] uppercase tracking-wide">Approved</div><div className="text-xl font-semibold text-emerald-100">{approved}</div></div>
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 min-w-[180px]"><div className="text-rose-300 text-[11px] uppercase tracking-wide">Denied</div><div className="text-xl font-semibold text-rose-100">{denied}</div></div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 text-slate-200 mx-4 mb-4 sticky top-2 z-10">
        <div className="p-3 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">Status</div>
            <select className="w-full rounded-md bg-slate-950/40 border border-slate-800 text-slate-200 text-sm p-2 outline-none focus:ring-2 focus:ring-blue-500/40" value={filter.status} onChange={e=>setFilter(prev=>({...prev, status: e.target.value}))}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="denied">Denied</option>
              <option value="needs_info">Needs Info</option>
            </select>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">Crop</div>
            <select className="w-full rounded-md bg-slate-950/40 border border-slate-800 text-slate-200 text-sm p-2 outline-none focus:ring-2 focus:ring-blue-500/40" value={filter.crop} onChange={e=>setFilter(prev=>({...prev, crop: e.target.value}))}>
              <option value="">All</option>
              <option value="maize">Maize</option>
              <option value="wheat">Wheat</option>
              <option value="sorghum">Sorghum</option>
            </select>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">Risk Band</div>
            <select className="w-full rounded-md bg-slate-950/40 border border-slate-800 text-slate-200 text-sm p-2 outline-none focus:ring-2 focus:ring-blue-500/40" value={filter.band} onChange={e=>setFilter(prev=>({...prev, band: e.target.value}))}>
              <option value="">All</option>
              <option value="green">Green</option>
              <option value="yellow">Yellow</option>
              <option value="red">Red</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button onClick={exportCSV} className="inline-flex items-center rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm px-3 py-2">Export CSV</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-400">
              <tr className="text-left">
                <th className="px-4 py-2">Farmer</th>
                <th className="px-4 py-2">Field</th>
                <th className="px-4 py-2">Crop</th>
                <th className="px-4 py-2">Score</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Requested</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length:5}).map((_,i)=>(
                  <tr key={i} className="border-t border-slate-800 animate-pulse">
                    <td className="px-4 py-3" colSpan={7}>
                      <div className="h-4 w-1/3 bg-slate-800 rounded" />
                    </td>
                  </tr>
                ))
              ) : paginated.map(a => (
                <tr key={a._id} className="border-t border-slate-800">
                  <td className="px-4 py-2 text-slate-200">{a.farmer?.firstName} {a.farmer?.lastName}</td>
                  <td className="px-4 py-2 text-slate-300">{a.field?.name}</td>
                  <td className="px-4 py-2 text-slate-300">{a.crop}</td>
                  <td className="px-4 py-2"><ScoreBadge score={a.field?.latestClimaScore} /></td>
                  <td className="px-4 py-2"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-2 text-slate-300">${a.requestedAmount}</td>
                  <td className="px-4 py-2"><button className="inline-flex items-center rounded-md border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/15 text-blue-200 px-3 py-1.5" onClick={()=>openReview(a)}>Review</button></td>
                </tr>
              ))}
              {!loading && !filtered.length && (
                <tr><td colSpan={7} className="px-4 py-4 text-slate-400">No applications match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
          <div className="text-slate-400 text-sm">Page {page} of {totalPages}</div>
          <div className="flex gap-2">
            <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 px-3 py-1.5 text-sm">Prev</button>
            <button disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 px-3 py-1.5 text-sm">Next</button>
          </div>
        </div>
      </div>

      {/* Modal Backdrop */}
      <div id="lender-modal-backdrop" style={{
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 998
      }} onClick={() => {
        document.getElementById('review-modal').close()
        document.getElementById('lender-modal-backdrop').style.display = 'none'
      }} />

      <dialog id="review-modal" style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        margin: 0,
        padding: 0,
        border: 'none',
        borderRadius: '10px',
        backgroundColor: 'transparent',
        maxHeight: '90vh',
        maxWidth: '90vw',
        width: 'auto',
        zIndex: 999
      }}>
        <form className="card" onSubmit={submitDecision} method="dialog" style={{
          minWidth: 'min(520px, 90vw)',
          maxWidth: 'min(700px, 90vw)',
          maxHeight: '85vh',
          overflowY: 'auto',
          backgroundColor: 'rgba(16, 24, 40, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(31, 42, 68, 0.8)',
          borderRadius: '10px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(31, 42, 68, 0.3)',
          color: '#e7ecf6',
          position: 'relative'
        }}>
          {/* Fixed Close Button */}
          <button 
            type="button" 
            onClick={() => {
              document.getElementById('review-modal').close()
              document.getElementById('lender-modal-backdrop').style.display = 'none'
            }}
            style={{
              position: 'sticky',
              top: '8px',
              left: '100%',
              transform: 'translateX(-100%)',
              marginLeft: '-16px',
              marginBottom: '-32px',
              zIndex: 1000,
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid rgba(31, 42, 68, 0.8)',
              backgroundColor: 'rgba(16, 24, 40, 0.9)',
              color: '#e7ecf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            ✕
          </button>
          <div className="card-header"><h3>Review Application</h3></div>
          {selected && (
            <>
              <div className="muted small">Farmer: {selected.farmer?.firstName} {selected.farmer?.lastName}</div>
              <div className="muted small">Field: {selected.field?.name} • Crop: {selected.crop} • Requested: ${selected.requestedAmount}</div>
              <div className="card sub" style={{
                marginTop:8,
                backgroundColor: 'rgba(16, 24, 40, 0.6)',
                border: '1px solid rgba(31, 42, 68, 0.5)',
                color: '#e7ecf6'
              }}>
                <div>ClimaScore: <strong>{selected.climascoreSnapshot?.climascore}</strong></div>
                <div className="row">
                  <div className="pill low">Drought: {selected.climascoreSnapshot?.risk_breakdown?.drought_risk}</div>
                  <div className="pill low">Flood: {selected.climascoreSnapshot?.risk_breakdown?.flood_risk}</div>
                  <div className="pill low">Heat: {selected.climascoreSnapshot?.risk_breakdown?.heat_stress_risk}</div>
                </div>
              </div>
              <div className="card sub" style={{
                marginTop:8,
                backgroundColor: 'rgba(16, 24, 40, 0.6)',
                border: '1px solid rgba(31, 42, 68, 0.5)',
                color: '#e7ecf6'
              }}>
                <div className="card-header"><h4>IoT Sensors (latest)</h4></div>
                {(!sensors || !sensors.length) && <div className="muted small">No sensor readings available.</div>}
                {sensors && sensors.map((r, idx) => (
                  <div key={idx} className="row" style={{justifyContent:'space-between'}}>
                    <div className="muted small">{r.device?.name} • {r.device?.type}</div>
                    <div className="muted small">{new Date(r.capturedAt).toLocaleString()}</div>
                    <div className="row">
                      {Object.entries(r.metrics||{}).map(([k,v]) => (
                        <div key={k} className="pill low"><span className="pill-label">{k}</span><span className="pill-level">{String(v)}</span></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="row" style={{marginTop:8}}>
                <div className="col">
                  <label>Decision</label>
                  <select className="w-full rounded-md bg-slate-950/40 border border-slate-800 text-slate-200 text-sm p-2 outline-none focus:ring-2 focus:ring-blue-500/40" value={action.action} onChange={e=>setAction(prev=>({...prev, action: e.target.value}))}>
                    <option value="approve">Approve</option>
                    <option value="deny">Deny</option>
                    <option value="needs_info">Needs Info</option>
                  </select>
                </div>
                <div className="col">
                  <label>Amount</label>
                  <input className="w-full rounded-md bg-slate-950/40 border border-slate-800 text-slate-200 text-sm p-2 outline-none focus:ring-2 focus:ring-blue-500/40" type="number" value={action.amount} onChange={e=>setAction(prev=>({...prev, amount: e.target.value}))} placeholder={`e.g. ${selected.requestedAmount || ''}`} />
                </div>
                <div className="col">
                  <label>Interest %</label>
                  <input className="w-full rounded-md bg-slate-950/40 border border-slate-800 text-slate-200 text-sm p-2 outline-none focus:ring-2 focus:ring-blue-500/40" type="number" value={action.interestRate} onChange={e=>setAction(prev=>({...prev, interestRate: e.target.value}))} />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label>Comments</label>
                  <input className="w-full rounded-md bg-slate-950/40 border border-slate-800 text-slate-200 text-sm p-2 outline-none focus:ring-2 focus:ring-blue-500/40" value={action.comments} onChange={e=>setAction(prev=>({...prev, comments: e.target.value}))} placeholder="Notes for farmer or internal log" />
                </div>
              </div>
            </>
          )}
          <div className="row" style={{marginTop:8}}>
            <div className="col end"><button className="inline-flex items-center rounded-md border border-emerald-500/40 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-100 text-sm px-3 py-1.5">Submit Decision</button></div>
          </div>
        </form>
      </dialog>
    </div>
  )
}
