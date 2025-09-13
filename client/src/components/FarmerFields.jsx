import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default markers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function StatusChip({ status }) {
  const map = { pending: '🟡 Pending', approved: '🟢 Approved', denied: '🔴 Denied', needs_info: '🟠 Needs Info' }
  return <span className="badge">{map[status] || status}</span>
}

function AIFieldInsights({ fieldId }) {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  async function loadInsights() {
    if (!fieldId) return
    try {
      setLoading(true)
      const res = await fetch(`http://localhost:3000/api/ai/analytics/${fieldId}?crop=maize`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setInsights(data.analytics)
      }
    } catch (e) {
      console.error('Failed to load AI insights:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (expanded && !insights) {
      loadInsights()
    }
  }, [expanded, fieldId])

  if (!expanded) {
    return (
      <button className="btn btn-secondary btn-sm" onClick={() => setExpanded(true)} style={{marginTop: 8}}>
        🤖 View AI Insights
      </button>
    )
  }

  return (
    <div className="card sub" style={{marginTop: 8, borderLeft: '3px solid #3b82f6'}}>
      <div className="row" style={{justifyContent: 'space-between', alignItems: 'center'}}>
        <div><strong>🤖 AI Field Insights</strong></div>
        <button className="btn btn-secondary btn-sm" onClick={() => setExpanded(false)}>Hide</button>
      </div>

      {loading ? (
        <div className="muted small">Loading AI insights...</div>
      ) : insights ? (
        <div style={{marginTop: 8}}>
          {/* Quick Metrics */}
          <div className="row" style={{gap: '8px'}}>
            {insights.fieldHealthScore && (
              <div className="pill" style={{
                backgroundColor: insights.fieldHealthScore.overallScore > 80 ? '#dcfce7' : insights.fieldHealthScore.overallScore > 60 ? '#fef3c7' : '#fee2e2',
                color: insights.fieldHealthScore.overallScore > 80 ? '#166534' : insights.fieldHealthScore.overallScore > 60 ? '#92400e' : '#991b1b'
              }}>
                Health: {insights.fieldHealthScore.overallScore}/100
              </div>
            )}
            {insights.yieldPrediction && (
              <div className="pill" style={{backgroundColor: '#e0f2fe', color: '#0c4a6e'}}>
                Yield: {insights.yieldPrediction.estimatedYield}t
              </div>
            )}
            {insights.riskWarnings?.length > 0 && (
              <div className="pill" style={{backgroundColor: '#fef3c7', color: '#92400e'}}>
                ⚠️ {insights.riskWarnings.length} risk{insights.riskWarnings.length > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Key Recommendations */}
          {insights.fertilizerRecommendations?.recommendations?.length > 0 && (
            <div style={{marginTop: 8}}>
              <div className="small" style={{color: '#374151', fontWeight: 500}}>💡 Top Recommendation:</div>
              <div className="small" style={{color: '#6b7280'}}>
                {insights.fertilizerRecommendations.recommendations[0].product} - {insights.fertilizerRecommendations.recommendations[0].reason}
              </div>
            </div>
          )}

          {/* Next Planting Window */}
          {insights.plantingWindowAdvice?.nextBestWindow && (
            <div style={{marginTop: 8}}>
              <div className="small" style={{color: '#374151', fontWeight: 500}}>🌱 Next Planting:</div>
              <div className="small" style={{color: '#6b7280'}}>
                {insights.plantingWindowAdvice.nextBestWindow.start} ({insights.plantingWindowAdvice.nextBestWindow.daysUntil} days)
              </div>
            </div>
          )}

          <div style={{marginTop: 8}}>
            <button className="btn btn-primary btn-sm" onClick={() => window.open('/dashboard/farmer/advisory', '_blank')}>
              View Full Analysis
            </button>
          </div>
        </div>
      ) : (
        <div className="muted small">No AI insights available yet. Add sensor data or wait for analysis.</div>
      )}
    </div>
  )
}

function scoreToColor(score) {
  if (score == null) return '#64748b' // slate for unknown
  if (score >= 67) return '#22c55e' // green
  if (score >= 34) return '#eab308' // yellow
  return '#ef4444' // red
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
  const [selectedField, setSelectedField] = useState(null)
  const [fieldAnalytics, setFieldAnalytics] = useState({})
  const [savingDraft, setSavingDraft] = useState(false)
  const [fieldApplications, setFieldApplications] = useState({})

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

  async function loadFieldAnalytics(fieldId) {
    try {
      const response = await fetch(`http://localhost:3000/api/ai/field-analysis/${fieldId}`, {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to load field analytics')
      const data = await response.json()
      setFieldAnalytics(prev => ({ ...prev, [fieldId]: data }))
    } catch (e) {
      console.error('Failed to load field analytics:', e.message)
    }
  }

  async function loadFieldApplications(fieldId) {
    try {
      const fieldApps = apps.filter(app => app.field?._id === fieldId || app.field === fieldId)
      fieldApps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setFieldApplications(prev => ({ ...prev, [fieldId]: fieldApps }))
    } catch (e) {
      console.error('Failed to load field applications:', e.message)
    }
  }

  function getFieldCenter(field) {
    if (!field.geometry || !field.geometry.coordinates) return [-0.1, 37.6]
    const coords = field.geometry.coordinates[0]
    const lats = coords.map(c => c[1])
    const lngs = coords.map(c => c[0])
    return [(Math.min(...lats) + Math.max(...lats)) / 2, (Math.min(...lngs) + Math.max(...lngs)) / 2]
  }

  function openFieldDetails(field) {
    setSelectedField(field)
    loadFieldAnalytics(field._id)
    loadFieldApplications(field._id)
    // Show backdrop
    const backdrop = document.getElementById('modal-backdrop')
    if (backdrop) backdrop.style.display = 'block'
    document.getElementById('field-details-modal')?.showModal()
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
    // Show backdrop for apply modal
    const backdrop = document.getElementById('modal-backdrop')
    if (backdrop) backdrop.style.display = 'block'
    const el = document.getElementById('apply-modal')
    if (el) el.showModal()
  }

  function openApplyFromDetails() {
    if (!selectedField) return
    document.getElementById('field-details-modal')?.close()
    // Hide backdrop from field details modal
    const backdrop = document.getElementById('modal-backdrop')
    if (backdrop) backdrop.style.display = 'none'
    openApply(selectedField._id)
  }

  function openRegisterSensor(fieldId) {
    setSensorForm({ fieldId, name: '', type: 'soil' })
    // Show backdrop for sensor modal
    const backdrop = document.getElementById('modal-backdrop')
    if (backdrop) backdrop.style.display = 'block'
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

  async function saveDraft(e) {
    e.preventDefault()
    try {
      setSavingDraft(true)
      setError('')
      const resp = await fetch('http://localhost:3000/api/farmer/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, status: 'draft' })
      })
      if (!resp.ok) throw new Error('Failed to save draft')
      await load()
      alert('Application saved as draft')
      const modal = document.getElementById('apply-modal')
      if (modal) modal.close()
      const backdrop = document.getElementById('modal-backdrop')
      if (backdrop) backdrop.style.display = 'none'
    } catch (e) {
      setError(e.message)
    } finally {
      setSavingDraft(false)
    }
  }

  return (
    <div>
      {error && <div className="error" style={{marginBottom:8}}>{error}</div>}

      {/* Fields List Section */}
      {/* <div className="row" style={{alignItems: 'stretch', gap: '24px'}}>
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
                <AIFieldInsights fieldId={f._id} />

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
      </div> */}

      {/* Map View Section */}
      <div className="card" style={{marginBottom: 24}}>
        <div className="card-header">
          <h3>My Fields & Financing Center</h3>
          <p className="muted small">View your mapped fields and access financing options. Click on field markers for details and funding applications.</p>
        </div>
        <div style={{height: 'clamp(400px, 50vh, 600px)'}} className="map-container">
          <MapContainer center={[-0.1, 37.6]} zoom={9} style={{height: '100%', borderRadius: 8}}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
            {fields.map(f => {
              const center = getFieldCenter(f)
              return (
                <div key={f._id}>
                  <GeoJSON
                    data={f.geometry}
                    style={{ color: scoreToColor(f.latestClimaScore), weight: 2, fillOpacity: 0.2 }}
                  />
                  <Marker position={center}>
                    <Popup>
                      <div style={{textAlign: 'center', padding: '4px'}}>
                        <button
                          className="btn btn-primary"
                          onClick={() => openFieldDetails(f)}
                          style={{
                            fontSize: '11px',
                            padding: '4px 8px',
                            minWidth: 'auto',
                            borderRadius: '4px'
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                </div>
              )
            })}
          </MapContainer>
        </div>
        {!fields.length && (
          <div className="muted" style={{padding: 16, textAlign: 'center'}}>
            No fields mapped yet. Use the drawing tools to add your first field to the map.
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="stats-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24}}>
        <div className="card">
          <div className="card-header"><h4>Total Fields</h4></div>
          <div style={{fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 'bold', color: '#22c55e'}}>{fields.length}</div>
        </div>
        <div className="card">
          <div className="card-header"><h4>Total Area</h4></div>
          <div style={{fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 'bold', color: '#3b82f6'}}>
            {fields.reduce((sum, f) => sum + (f.areaHa || 0), 0).toFixed(1)} ha
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h4>Active Applications</h4></div>
          <div style={{fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 'bold', color: '#eab308'}}>
            {apps.filter(a => a.status === 'pending').length}
          </div>
        </div>
      </div>

      {/* Modal Backdrop */}
      <div id="modal-backdrop" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(11, 15, 26, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 998,
        display: 'none'
      }}></div>

      {/* Field Details Modal */}
      <dialog id="field-details-modal" style={{
        position: 'fixed', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        margin: 0, 
        padding: 0, 
        border: 'none', 
        borderRadius: 8, 
        backgroundColor: 'transparent', 
        maxHeight: '90vh', 
        maxWidth: '90vw', 
        width: 'auto',
        zIndex: 999
      }}>
        <div className="modal-card" style={{
          minWidth: 'min(600px, 90vw)', 
          maxWidth: 'min(900px, 90vw)', 
          maxHeight: '85vh', 
          overflowY: 'auto',
          backgroundColor: 'rgba(16, 24, 40, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(31, 42, 68, 0.8)',
          borderRadius: '10px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(31, 42, 68, 0.3)',
          color: '#e7ecf6'
        }}>
          <div className="modal-header">
            <div className="modal-title">{selectedField?.name || 'Field Details'}</div>
            <button type="button" className="modal-close" aria-label="Close" onClick={()=>{
              document.getElementById('field-details-modal').close()
              const backdrop = document.getElementById('modal-backdrop')
              if (backdrop) backdrop.style.display = 'none'
            }}>✕</button>
          </div>
          {selectedField && (
            <div>
              <div className="field-info-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16}}>
                <div className="card">
                  <div className="card-header"><h4>Field Information</h4></div>
                  <div><strong>Name:</strong> {selectedField.name}</div>
                  <div><strong>Area:</strong> {selectedField.areaHa?.toFixed?.(2)} ha</div>
                  <div><strong>ClimaScore:</strong> 
                    <span style={{color: scoreToColor(selectedField.latestClimaScore), fontWeight: 'bold'}}>
                      {selectedField.latestClimaScore || 'Not calculated'}
                    </span>
                  </div>
                </div>
              </div>
              
              {fieldAnalytics[selectedField._id] && (
                <div className="analytics-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16}}>
                  <div className="card">
                    <div className="card-header"><h4>AI Field Analysis</h4></div>
                    <div className="analytics-content" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12}}>
                      <div>
                        <div><strong>Soil Health Score:</strong> {fieldAnalytics[selectedField._id].soilHealth?.score}/100</div>
                        <div><strong>Vegetation Health:</strong> {fieldAnalytics[selectedField._id].vegetationHealth?.score}/100</div>
                        <div><strong>Risk Assessment:</strong> {fieldAnalytics[selectedField._id].riskAssessment?.level}</div>
                      </div>
                      <div>
                        <div><strong>Recommended Fertilizer:</strong> {fieldAnalytics[selectedField._id].fertilizerRecommendation?.type}</div>
                        <div><strong>Estimated Cost:</strong> ${fieldAnalytics[selectedField._id].fertilizerRecommendation?.estimatedCost}</div>
                        <div><strong>Expected Yield Improvement:</strong> {fieldAnalytics[selectedField._id].fertilizerRecommendation?.expectedYieldImprovement}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Application History */}
              {fieldApplications[selectedField._id] && fieldApplications[selectedField._id].length > 0 && (
                <div className="application-history" style={{marginBottom: 16}}>
                  <div className="card">
                    <div className="card-header">
                      <h4>Application History</h4>
                      <span className="muted small">{fieldApplications[selectedField._id].length} application(s)</span>
                    </div>
                    <div style={{maxHeight: 200, overflowY: 'auto'}}>
                      {fieldApplications[selectedField._id].map((app, idx) => (
                        <div key={app._id} className="application-item" style={{padding: 12, borderBottom: idx < fieldApplications[selectedField._id].length - 1 ? '1px solid #e5e7eb' : 'none'}}>
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4}}>
                            <div style={{fontWeight: 'bold'}}>{app.crop} - ${app.requestedAmount}</div>
                            <StatusChip status={app.status} />
                          </div>
                          <div className="muted small">
                            Applied: {new Date(app.createdAt).toLocaleDateString()}
                            {app.plantingDate && ` • Planting: ${new Date(app.plantingDate).toLocaleDateString()}`}
                          </div>
                          {app.lenderNotes && (
                            <div className="muted small" style={{marginTop: 4, fontStyle: 'italic'}}>
                              Note: {app.lenderNotes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="action-buttons" style={{display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between'}}>
                <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                  <button className="btn btn-secondary" onClick={()=>openRegisterSensor(selectedField._id)}>Register Sensor</button>
                  <button className="btn btn-secondary" onClick={()=>viewSensors(selectedField._id)}>View Sensors</button>
                </div>
                {(() => {
                  const latestApp = fieldApplications[selectedField._id]?.[0]
                  const canApply = !latestApp || (latestApp.status !== 'pending' && latestApp.status !== 'approved')
                  return (
                    <button
                      className={`btn ${canApply ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={canApply ? openApplyFromDetails : null}
                      disabled={!canApply}
                      title={!canApply ? `Cannot apply - you have a ${latestApp?.status} application` : 'Apply for funding'}
                    >
                      {canApply ? 'Apply for Funding' : `Application ${latestApp?.status}`}
                    </button>
                  )
                })()}
              </div>
            </div>
          )}
        </div>
      </dialog>

      {/* Apply for Funding Modal */}
      <dialog id="apply-modal" style={{
        position: 'fixed', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        padding: 0, 
        border: 'none', 
        borderRadius: '10px', 
        backgroundColor: 'transparent',
        maxHeight: '90vh', 
        maxWidth: '90vw', 
        width: 'auto',
        zIndex: 999
      }}>
        <form className="modal-card" onSubmit={submitApplication} style={{
          minWidth: 'min(500px, 90vw)', 
          maxWidth: 'min(700px, 90vw)', 
          maxHeight: '85vh', 
          overflowY: 'auto',
          backgroundColor: 'rgba(16, 24, 40, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(31, 42, 68, 0.8)',
          borderRadius: '10px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(31, 42, 68, 0.3)',
          color: '#e7ecf6'
        }}>
          <div className="modal-header">
            <div className="modal-title">Apply for Funding</div>
            <button type="button" className="modal-close" aria-label="Close" onClick={()=>{
              document.getElementById('apply-modal').close()
              const backdrop = document.getElementById('modal-backdrop')
              if (backdrop) backdrop.style.display = 'none'
            }}>✕</button>
          </div>
          <div className="form-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 16}}>
            <div>
              <label>Field</label>
              <select value={form.fieldId} onChange={e=>setForm(prev=>({...prev, fieldId: e.target.value}))} required>
                <option value="">Select a field</option>
                {fields.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
              </select>
            </div>
            <div>
              <label>Crop Type</label>
              <select value={form.crop} onChange={e=>setForm(prev=>({...prev, crop: e.target.value}))}>
                <option value="maize">Maize</option>
                <option value="wheat">Wheat</option>
                <option value="sorghum">Sorghum</option>
                <option value="beans">Beans</option>
                <option value="coffee">Coffee</option>
              </select>
            </div>
          </div>
          <div className="form-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 16}}>
            <div>
              <label>Planting Date</label>
              <input type="date" value={form.plantingDate} onChange={e=>setForm(prev=>({...prev, plantingDate: e.target.value}))} required />
            </div>
            <div>
              <label>Requested Amount (USD)</label>
              <input type="number" value={form.requestedAmount} onChange={e=>setForm(prev=>({...prev, requestedAmount: Number(e.target.value)}))} required min="100" max="50000" />
            </div>
          </div>
          <div className="form-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 16}}>
            <div>
              <label>Funding Purpose</label>
              <select onChange={e=>setForm(prev=>({...prev, purpose: e.target.value}))}>
                <option value="">Select purpose</option>
                <option value="seeds">Seeds & Planting Materials</option>
                <option value="fertilizer">Fertilizers & Nutrients</option>
                <option value="equipment">Farm Equipment</option>
                <option value="irrigation">Irrigation Systems</option>
                <option value="general">General Farm Operations</option>
              </select>
            </div>
            <div>
              <label>Expected Harvest Date</label>
              <input type="date" onChange={e=>setForm(prev=>({...prev, expectedHarvest: e.target.value}))} />
            </div>
          </div>
          <div style={{marginBottom: 16}}>
            <label>Additional Notes</label>
            <textarea rows="3" placeholder="Any additional information about your funding request..." onChange={e=>setForm(prev=>({...prev, notes: e.target.value}))} style={{width: '100%', resize: 'vertical'}}></textarea>
          </div>
          <div className="form-actions" style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8}}>
            {/* <button type="button" className="btn btn-secondary" onClick={saveDraft} disabled={savingDraft}>
              {savingDraft ? 'Saving...' : 'Save as Draft'}
            </button> */}
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </dialog>

      <dialog id="sensor-modal" style={{
        position: 'fixed', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        margin: 0, 
        padding: 0, 
        border: 'none', 
        borderRadius: 8, 
        backgroundColor: 'transparent', 
        maxHeight: '90vh', 
        maxWidth: '90vw', 
        width: 'auto',
        zIndex: 999
      }}>
        <form className="modal-card" onSubmit={registerSensor} method="dialog" style={{
          minWidth: 'min(480px, 90vw)', 
          maxWidth: 'min(600px, 90vw)', 
          maxHeight: '85vh', 
          overflowY: 'auto',
          backgroundColor: 'rgba(16, 24, 40, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(31, 42, 68, 0.8)',
          borderRadius: '10px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(31, 42, 68, 0.3)',
          color: '#e7ecf6'
        }}>
          <div className="modal-header">
            <div className="modal-title">Register Sensor</div>
            <button type="button" className="modal-close" aria-label="Close" onClick={()=>{
              document.getElementById('sensor-modal').close()
              const backdrop = document.getElementById('modal-backdrop')
              if (backdrop) backdrop.style.display = 'none'
            }}>✕</button>
          </div>
          <div className="form-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16}}>
            <div>
              <label>Field</label>
              <select value={sensorForm.fieldId} onChange={e=>setSensorForm(prev=>({...prev, fieldId: e.target.value}))} required>
                {fields.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
              </select>
            </div>
            <div>
              <label>Device Name</label>
              <input value={sensorForm.name} onChange={e=>setSensorForm(prev=>({...prev, name: e.target.value}))} required />
            </div>
          </div>
          <div style={{marginBottom: 16}}>
            <label>Type</label>
            <select value={sensorForm.type} onChange={e=>setSensorForm(prev=>({...prev, type: e.target.value}))}>
              <option value="soil">Soil</option>
              <option value="weather">Weather</option>
            </select>
          </div>
          <div style={{display: 'flex', justifyContent: 'flex-end'}}>
            <button className="btn btn-primary">Register</button>
          </div>
        </form>
      </dialog>
    </div>
  )
}
