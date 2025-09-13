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
  const [sensorForm, setSensorForm] = useState({ fieldId: '', name: '', type: 'soil' })
  const [latestSensors, setLatestSensors] = useState({}) // fieldId -> readings array

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

  function latestAppStatusForField(fieldId) {
    const relevant = (apps||[]).filter(a => a.field?._id === fieldId || a.field === fieldId)
    if (!relevant.length) return null
    relevant.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
    return relevant[0].status || null
  }

  function openApply(fieldId) {
    const status = latestAppStatusForField(fieldId)
    if (status === 'pending' || status === 'approved') {
      alert('You already have an application for this field that is '+status+'. You can only reapply if it is denied.')
      return
    }
    setForm(prev => ({ ...prev, fieldId }))
    const el = document.getElementById('apply-modal')
    if (el) el.showModal()
  }

  function openRegisterSensor(fieldId) {
    setSensorForm({ fieldId, name: '', type: 'soil' })
    document.getElementById('sensor-modal')?.showModal()
  }

  async function registerSensor(e) {
    e.preventDefault()
    try {
      const resp = await fetch('http://localhost:3000/api/sensors/devices', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(sensorForm)
      })
      if (!resp.ok) throw new Error('Failed to register sensor')
      document.getElementById('sensor-modal')?.close()
      alert('Sensor registered')
    } catch (e) { alert(e.message) }
  }

  async function viewSensors(fieldId) {
    try {
      const resp = await fetch(`http://localhost:3000/api/sensors/fields/${fieldId}/latest`, { credentials: 'include' })
      if (!resp.ok) throw new Error('Failed to load sensors')
      const data = await resp.json()
      setLatestSensors(prev => ({ ...prev, [fieldId]: data.readings || [] }))
    } catch (e) { alert(e.message) }
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
    <div>
      {error && <div className="error" style={{marginBottom:8}}>{error}</div>}
      <div className="row" style={{alignItems: 'stretch', gap: '24px'}}>
        <div className="col" style={{minWidth: 320}}>
          <div className="card">
            <div className="card-header"><h3>Your Fields</h3></div>
            {!fields.length && <div className="muted">No fields yet. Draw on the map to add your first field.</div>}
            {fields.map(f => (
              <div key={f._id} className="card sub" style={{marginTop:8}}>
                <div className="row" style={{justifyContent:'space-between'}}>
                  <div>
                    <div><strong>{f.name}</strong></div>
                    <div className="muted small">Area: {f.areaHa?.toFixed?.(2)} ha</div>
                  </div>
                  <div>
                    <div className="row">
                      {(() => {
                        const s = latestAppStatusForField(f._id)
                        const disabled = s === 'pending' || s === 'approved'
                        const label = s === 'pending' ? 'Application Pending' : s === 'approved' ? 'Approved' : 'Apply'
                        return (
                          <button disabled={disabled} className="btn btn-primary" onClick={()=>openApply(f._id)}>{label}</button>
                        )
                      })()}
                      <button className="btn btn-secondary" onClick={()=>openRegisterSensor(f._id)}>Register Sensor</button>
                      <button className="btn btn-secondary" onClick={()=>viewSensors(f._id)}>View Sensors</button>
                    </div>
                  </div>
                </div>
                {latestSensors[f._id] && (
                  <div className="card" style={{marginTop:8}}>
                    <div className="card-header"><h4>Latest Sensors</h4></div>
                    {!latestSensors[f._id].length && <div className="muted small">No readings yet.</div>}
                    {latestSensors[f._id].map((r, idx) => (
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
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="col" style={{minWidth: 380}}>
          <div className="card">
            <div className="card-header"><h3>Applications</h3></div>
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
      </div>

      <dialog id="apply-modal">
        <form className="modal-card" onSubmit={submitApplication} method="dialog" style={{minWidth: 480}}>
          <div className="modal-header">
            <div className="modal-title">Apply for Funding</div>
            <button type="button" className="modal-close" aria-label="Close" onClick={()=>document.getElementById('apply-modal').close()}>✕</button>
          </div>
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
          <div className="row" style={{justifyContent:'flex-end'}}>
            <div className="col end"><button className="btn btn-primary" disabled={submitting}>{submitting?'Submitting...':'Submit Application'}</button></div>
          </div>
        </form>
      </dialog>

      <dialog id="sensor-modal">
        <form className="modal-card" onSubmit={registerSensor} method="dialog" style={{minWidth: 480}}>
          <div className="modal-header">
            <div className="modal-title">Register Sensor</div>
            <button type="button" className="modal-close" aria-label="Close" onClick={()=>document.getElementById('sensor-modal').close()}>✕</button>
          </div>
          <div className="row">
            <div className="col">
              <label>Field</label>
              <select value={sensorForm.fieldId} onChange={e=>setSensorForm(prev=>({...prev, fieldId: e.target.value}))} required>
                {fields.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
              </select>
            </div>
            <div className="col">
              <label>Device Name</label>
              <input value={sensorForm.name} onChange={e=>setSensorForm(prev=>({...prev, name: e.target.value}))} required />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <label>Type</label>
              <select value={sensorForm.type} onChange={e=>setSensorForm(prev=>({...prev, type: e.target.value}))}>
                <option value="soil">Soil</option>
                <option value="weather">Weather</option>
              </select>
            </div>
          </div>
          <div className="row" style={{justifyContent:'flex-end'}}>
            <div className="col end"><button className="btn btn-primary">Register</button></div>
          </div>
        </form>
      </dialog>
    </div>
  )
}
