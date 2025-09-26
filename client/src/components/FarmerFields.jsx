import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import StatsGrid from './fields/StatsGrid'
import ModalBackdrop from './fields/ModalBackdrop'
import FieldDetailsModal from './fields/FieldDetailsModal'
import ApplyFundingModal from './fields/ApplyFundingModal'
import SensorModal from './fields/SensorModal'

// Fix default markers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function scoreToColor(score) {
  if (score == null) return '#64748b' // slate for unknown
  if (score >= 67) return '#22c55e' // green
  if (score >= 34) return '#eab308' // yellow
  return '#ef4444' // red
}

function FarmerFields({ showMap = true }) {
  const navigate = useNavigate()
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successData, setSuccessData] = useState(null)
  const [fieldApplications, setFieldApplications] = useState({})
  const [apps, setApps] = useState([])
  const [selectedField, setSelectedField] = useState(null)
  const [fieldAnalytics, setFieldAnalytics] = useState({})
  const [sensorForm, setSensorForm] = useState({})
  const [latestSensors, setLatestSensors] = useState({})
  const [appFieldMetadata, setAppFieldMetadata] = useState({ crops:'', plantingMethod:'', harvestingMethod:'', irrigation:'', soilType:'', ownership:'', notes:'' })

  // Listen for global event to open details triggered by FarmerMap popups
  useEffect(() => {
    function onOpenFieldDetails(e) {
      const id = e?.detail
      const field = (fields || []).find(f => f._id === id)
      if (field) openFieldDetails(field)
    }
    window.addEventListener('openFieldDetails', onOpenFieldDetails)
    return () => window.removeEventListener('openFieldDetails', onOpenFieldDetails)
  }, [fields])

  const load = useCallback(async () => {
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
      const applications = a.applications || []
      setApps(applications)
      if ((f.fields||[]).length && !form.fieldId) {
        const first = f.fields[0]
        const crops = Array.isArray(first?.metadata?.crops) ? first.metadata.crops : []
        setForm(prev => ({ ...prev, fieldId: first._id, crop: prev.crop && crops.includes(prev.crop) ? prev.crop : (crops[0] || prev.crop || '') }))
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [form.fieldId])

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

  useEffect(() => { load() }, [load])

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
    // Set selected field and default crop from its metadata
    const f = (fields||[]).find(x => x._id === fieldId)
    const crops = Array.isArray(f?.metadata?.crops) ? f.metadata.crops : []
    setForm(prev => ({ ...prev, fieldId, crop: prev.crop && crops.includes(prev.crop) ? prev.crop : (crops[0] || '') }))
    // Prefill metadata editor from selected field
    if (f) {
      const m = f.metadata || {}
      setAppFieldMetadata({
        crops: Array.isArray(m.crops) ? m.crops.join(', ') : (m.crops || ''),
        plantingMethod: m.plantingMethod || '',
        harvestingMethod: m.harvestingMethod || '',
        irrigation: m.irrigation || '',
        soilType: m.soilType || '',
        ownership: m.ownership || '',
        notes: m.notes || '',
      })
    }
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
      const fieldMetadata = {
        crops: appFieldMetadata.crops.split(',').map(s=>s.trim()).filter(Boolean),
        plantingMethod: appFieldMetadata.plantingMethod,
        harvestingMethod: appFieldMetadata.harvestingMethod,
        irrigation: appFieldMetadata.irrigation,
        soilType: appFieldMetadata.soilType,
        ownership: appFieldMetadata.ownership,
        notes: appFieldMetadata.notes,
      }
      const payload = { ...form, fieldMetadata }
      const resp = await fetch('http://localhost:3000/api/farmer/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })
      if (!resp.ok) throw new Error('Failed to create application')
      await load()
      const data = await resp.json()
      
      // Close the application modal first
      const modal = document.getElementById('apply-modal')
      if (modal) modal.close()
      
      // Show success modal with data
      setSuccessData(data)
      setShowSuccessModal(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  function closeSuccessModal() {
    setShowSuccessModal(false)
    setSuccessData(null)
    // Navigate to applications page
    navigate('/farmer/applications')
  }

  // removed saveDraft to avoid unused warnings

  return (
    <div>
      {error && <div className="error" style={{marginBottom:8}}>{error}</div>}

      {/* Global loading state */}
      {loading && (
        <div className="card" style={{marginBottom: 12}}>
          <div className="muted small">Loading fields...</div>
        </div>
      )}

      {/* Quick Stats */}
      <StatsGrid fields={fields} apps={apps} />

      {/* Map View Section (optional) */}
      {showMap && (
        <div className="card" style={{marginBottom: 24}}>
          <div className="card-header">
            <h3>My Fields</h3>
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
      )}
      

      {/* Modal Backdrop */}
      <ModalBackdrop />

      {/* Field Details Modal */}
      <FieldDetailsModal
        selectedField={selectedField}
        analytics={selectedField ? fieldAnalytics[selectedField._id] : undefined}
        applications={selectedField ? fieldApplications[selectedField._id] : undefined}
        latestReadings={selectedField ? latestSensors[selectedField._id] : undefined}
        onClose={() => {
          document.getElementById('field-details-modal').close()
          const backdrop = document.getElementById('modal-backdrop')
          if (backdrop) backdrop.style.display = 'none'
        }}
        onRegisterSensor={() => selectedField && openRegisterSensor(selectedField._id)}
        onViewSensors={() => selectedField && viewSensors(selectedField._id)}
        canApply={(() => {
          if (!selectedField) return false
          const latestApp = fieldApplications[selectedField._id]?.[0]
          return !latestApp || (latestApp.status !== 'pending' && latestApp.status !== 'approved')
        })()}
        onApply={openApplyFromDetails}
      />

      {/* Apply for Funding Modal */}
      <ApplyFundingModal
        fields={fields}
        form={form}
        setForm={setForm}
        submitting={submitting}
        onSubmit={submitApplication}
        onClose={() => {
          document.getElementById('apply-modal').close()
          const backdrop = document.getElementById('modal-backdrop')
          if (backdrop) backdrop.style.display = 'none'
        }}
      />

      <SensorModal
        fields={fields}
        sensorForm={sensorForm}
        setSensorForm={setSensorForm}
        onSubmit={registerSensor}
        onClose={() => {
          document.getElementById('sensor-modal').close()
          const backdrop = document.getElementById('modal-backdrop')
          if (backdrop) backdrop.style.display = 'none'
        }}
      />

      {/* Success Modal */}
      {showSuccessModal && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 9998
            }}
            onClick={closeSuccessModal}
          />
          <dialog 
            open
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              margin: 0,
              padding: 0,
              border: 'none',
              borderRadius: '12px',
              backgroundColor: 'transparent',
              maxHeight: '90vh',
              maxWidth: '500px',
              width: '90%',
              zIndex: 9999
            }}
          >
            <div className="modal-card" style={{
              backgroundColor: 'rgba(16, 24, 40, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(31, 42, 68, 0.8)',
              borderRadius: '12px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              color: '#e7ecf6',
              padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{marginBottom: '20px'}}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '24px'
                }}>
                  ✓
                </div>
                <h2 style={{margin: '0 0 8px', color: 'white'}}>Application Submitted Successfully!</h2>
                <p style={{margin: 0, color: '#94a3b8'}}>Your funding application has been processed and submitted for review.</p>
              </div>
              
              {successData?.application?.climascoreSnapshot?.climascore && (
                <div style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <h4 style={{margin: '0 0 8px', color: '#60a5fa'}}>Your ClimaScore</h4>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: scoreToColor(successData.application.climascoreSnapshot.climascore)
                  }}>
                    {successData.application.climascoreSnapshot.climascore}
                  </div>
                  <p style={{margin: '8px 0 0', fontSize: '14px', color: '#94a3b8'}}>
                    This score reflects your field's climate resilience and will be used in the loan evaluation process.
                  </p>
                </div>
              )}
              
              <div style={{marginBottom: '20px'}}>
                <p style={{margin: '0 0 8px', color: '#94a3b8', fontSize: '14px'}}>What happens next?</p>
                <ul style={{textAlign: 'left', color: '#cbd5e1', fontSize: '14px', paddingLeft: '20px'}}>
                  <li>Your application will be reviewed by our lending team</li>
                  <li>You'll receive updates via email and in your dashboard</li>
                  <li>The review process typically takes 3-5 business days</li>
                </ul>
              </div>
              
              <div style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
                <button 
                  className="btn btn-primary"
                  onClick={closeSuccessModal}
                  style={{minWidth: '140px'}}
                >
                  View My Applications
                </button>
              </div>
            </div>
          </dialog>
        </>
      )}
    </div>
  )
}

export default FarmerFields