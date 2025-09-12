import { useEffect, useState } from 'react'

function StatusChip({ status }) {
  const map = { pending: '🟡 Pending', approved: '🟢 Approved', denied: '🔴 Denied', needs_info: '🟠 Needs Info' }
  return <span className="badge">{map[status] || status}</span>
}

export default function FarmerFields() {
  const [fields, setFields] = useState([])
  const [apps, setApps] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ fieldId: '', crop: 'maize', plantingDate: '2025-03-15', requestedAmount: 500, source: 'nasa' })
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    try {
      setLoading(true)
      const [fRes, aRes] = await Promise.all([
        fetch('http://localhost:3000/api/farmer/fields', { credentials: 'include' }),
        fetch('http://localhost:3000/api/farmer/applications', { credentials: 'include' })
      ])
      if (!fRes.ok) throw new Error('Failed to load fields')
      if (!aRes.ok) throw new Error('Failed to load applications')
      const f = await fRes.json(); const a = await aRes.json()
      setFields(f.fields || [])
      setApps(a.applications || [])
      if ((f.fields||[]).length && !form.fieldId) setForm(prev => ({ ...prev, fieldId: f.fields[0]._id }))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function openApply(fieldId) {
    setForm(prev => ({ ...prev, fieldId }))
    const el = document.getElementById('apply-modal')
    if (el) el.showModal()
  }

  async function submitApplication(e) {
    e.preventDefault()
    try {
      setSubmitting(true)
      setError('')
      const resp = await fetch('http://localhost:3000/api/farmer/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      })
      if (!resp.ok) throw new Error('Failed to create application')
      await load()
      const data = await resp.json()
      alert(`Preliminary ClimaScore: ${data.application?.climascoreSnapshot?.climascore}`)
      const modal = document.getElementById('apply-modal')
      if (modal) modal.close()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header"><h3>Your Fields & Applications</h3></div>
      {error && <div className="error" style={{marginBottom:8}}>{error}</div>}
      <div className="row" style={{alignItems: 'stretch'}}>
        <div className="col" style={{minWidth: 320}}>
          <h4>Fields</h4>
          {!fields.length && <div className="muted">No fields yet. Draw on the map to add your first field.</div>}
          {fields.map(f => (
            <div key={f._id} className="card sub" style={{marginTop:8}}>
              <div className="row" style={{justifyContent:'space-between'}}>
                <div>
                  <div><strong>{f.name}</strong></div>
                  <div className="muted small">Area: {f.areaHa?.toFixed?.(2)} ha</div>
                </div>
                <div>
                  <button onClick={()=>openApply(f._id)}>Apply for Funding</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="col" style={{minWidth: 380}}>
          <h4>Applications</h4>
          {!apps.length && <div className="muted">No applications yet.</div>}
          {apps.map(a => (
            <div key={a._id} className="card sub" style={{marginTop:8}}>
              <div className="row" style={{justifyContent:'space-between'}}>
                <div>
                  <div><strong>{a.field?.name}</strong> — {a.crop}</div>
                  <div className="muted small">Planting: {new Date(a.plantingDate).toLocaleDateString()}</div>
                  <div className="muted small">Requested: ${a.requestedAmount}</div>
                </div>
                <div>
                  <StatusChip status={a.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <dialog id="apply-modal" style={{padding:0, border:'none', borderRadius:12}}>
        <form className="card" onSubmit={submitApplication} method="dialog" style={{minWidth: 420}}>
          <div className="card-header"><h3>Apply for Funding</h3></div>
          <div className="row">
            <div className="col">
              <label>Field</label>
              <select value={form.fieldId} onChange={e=>setForm(prev=>({...prev, fieldId: e.target.value}))} required>
                {fields.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
              </select>
            </div>
            <div className="col">
              <label>Crop</label>
              <select value={form.crop} onChange={e=>setForm(prev=>({...prev, crop: e.target.value}))}>
                <option value="maize">Maize</option>
                <option value="wheat">Wheat</option>
                <option value="sorghum">Sorghum</option>
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <label>Planting Date</label>
              <input type="date" value={form.plantingDate} onChange={e=>setForm(prev=>({...prev, plantingDate: e.target.value}))} required />
            </div>
            <div className="col">
              <label>Requested Amount (USD)</label>
              <input type="number" value={form.requestedAmount} onChange={e=>setForm(prev=>({...prev, requestedAmount: Number(e.target.value)}))} required />
            </div>
          </div>
          <div className="row">
            <div className="col"><button type="button" className="link" onClick={()=>document.getElementById('apply-modal').close()}>Cancel</button></div>
            <div className="col end"><button disabled={submitting}>{submitting?'Submitting...':'Submit Application'}</button></div>
          </div>
        </form>
      </dialog>
    </div>
  )
}
