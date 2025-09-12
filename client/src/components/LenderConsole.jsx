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

  async function openReview(app) {
    try {
      const resp = await fetch(`http://localhost:3000/api/lender/applications/${app._id}`, { credentials: 'include' })
      if (!resp.ok) throw new Error('Failed to load application')
      const data = await resp.json()
      setSelected(data.application)
      setAction({ action: 'approve', amount: data.application?.climascoreSnapshot?.recommended_loan_terms?.amount || '', interestRate: data.application?.climascoreSnapshot?.recommended_loan_terms?.interest_rate || '', comments: '' })
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
    <div className="card">
      <div className="card-header"><h3>Portfolio Overview</h3></div>
      {error && <div className="error">{error}</div>}
      <div className="row">
        <div className="card sub" style={{minWidth:180}}><div>Total</div><div style={{fontSize:24, fontWeight:700}}>{total}</div></div>
        <div className="card sub" style={{minWidth:180}}><div>Pending</div><div style={{fontSize:24, fontWeight:700}}>{pending}</div></div>
        <div className="card sub" style={{minWidth:180}}><div>Approved</div><div style={{fontSize:24, fontWeight:700}}>{approved}</div></div>
        <div className="card sub" style={{minWidth:180}}><div>Denied</div><div style={{fontSize:24, fontWeight:700}}>{denied}</div></div>
      </div>

      <div className="card" style={{marginTop:12}}>
        <div className="row" style={{justifyContent:'space-between'}}>
          <div className="row">
            <div className="col"><label>Status</label>
              <select value={filter.status} onChange={e=>setFilter(prev=>({...prev, status: e.target.value}))}>
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
                <option value="needs_info">Needs Info</option>
              </select>
            </div>
            <div className="col"><label>Crop</label>
              <select value={filter.crop} onChange={e=>setFilter(prev=>({...prev, crop: e.target.value}))}>
                <option value="">All</option>
                <option value="maize">Maize</option>
                <option value="wheat">Wheat</option>
                <option value="sorghum">Sorghum</option>
              </select>
            </div>
            <div className="col"><label>Risk Band</label>
              <select value={filter.band} onChange={e=>setFilter(prev=>({...prev, band: e.target.value}))}>
                <option value="">All</option>
                <option value="green">Green</option>
                <option value="yellow">Yellow</option>
                <option value="red">Red</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{overflowX:'auto', marginTop:12}}>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{textAlign:'left'}}>
                <th>Farmer</th>
                <th>Field</th>
                <th>Crop</th>
                <th>Score</th>
                <th>Status</th>
                <th>Requested</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a._id}>
                  <td>{a.farmer?.firstName} {a.farmer?.lastName}</td>
                  <td>{a.field?.name}</td>
                  <td>{a.crop}</td>
                  <td><ScoreBadge score={a.field?.latestClimaScore} /></td>
                  <td>{a.status}</td>
                  <td>${a.requestedAmount}</td>
                  <td><button onClick={()=>openReview(a)}>Review</button></td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={7} className="muted">No applications match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <dialog id="review-modal" style={{padding:0, border:'none', borderRadius:12}}>
        <form className="card" onSubmit={submitDecision} method="dialog" style={{minWidth: 520}}>
          <div className="card-header"><h3>Review Application</h3></div>
          {selected && (
            <>
              <div className="muted small">Farmer: {selected.farmer?.firstName} {selected.farmer?.lastName}</div>
              <div className="muted small">Field: {selected.field?.name} • Crop: {selected.crop} • Requested: ${selected.requestedAmount}</div>
              <div className="card sub" style={{marginTop:8}}>
                <div>ClimaScore: <strong>{selected.climascoreSnapshot?.climascore}</strong></div>
                <div className="row">
                  <div className="pill low">Drought: {selected.climascoreSnapshot?.risk_breakdown?.drought_risk}</div>
                  <div className="pill low">Flood: {selected.climascoreSnapshot?.risk_breakdown?.flood_risk}</div>
                  <div className="pill low">Heat: {selected.climascoreSnapshot?.risk_breakdown?.heat_stress_risk}</div>
                </div>
              </div>
              <div className="row" style={{marginTop:8}}>
                <div className="col"><label>Decision</label>
                  <select value={action.action} onChange={e=>setAction(prev=>({...prev, action: e.target.value}))}>
                    <option value="approve">Approve</option>
                    <option value="deny">Deny</option>
                    <option value="needs_info">Needs Info</option>
                  </select>
                </div>
                <div className="col"><label>Amount</label>
                  <input type="number" value={action.amount} onChange={e=>setAction(prev=>({...prev, amount: e.target.value}))} />
                </div>
                <div className="col"><label>Interest %</label>
                  <input type="number" value={action.interestRate} onChange={e=>setAction(prev=>({...prev, interestRate: e.target.value}))} />
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label>Comments</label>
                  <input value={action.comments} onChange={e=>setAction(prev=>({...prev, comments: e.target.value}))} placeholder="Notes for farmer or internal log" />
                </div>
              </div>
            </>
          )}
          <div className="row" style={{marginTop:8}}>
            <div className="col"><button type="button" className="link" onClick={()=>document.getElementById('review-modal').close()}>Close</button></div>
            <div className="col end"><button>Submit Decision</button></div>
          </div>
        </form>
      </dialog>
    </div>
  )
}
