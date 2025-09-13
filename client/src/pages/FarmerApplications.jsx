import { useEffect, useState } from 'react'

function StatusChip({ status }) {
  const map = { 
    pending: '🟡 Pending', 
    approved: '🟢 Approved', 
    denied: '🔴 Denied', 
    needs_info: '🟠 Needs Info',
    draft: '📝 Draft'
  }
  return <span className="badge">{map[status] || status}</span>
}

function PriorityChip({ priority }) {
  const map = {
    high: { color: '#ef4444', label: '🔴 High' },
    medium: { color: '#eab308', label: '🟡 Medium' },
    low: { color: '#22c55e', label: '🟢 Low' }
  }
  const p = map[priority] || { color: '#64748b', label: priority }
  return <span className="badge" style={{ backgroundColor: p.color + '20', color: p.color }}>{p.label}</span>
}

export default function FarmerApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedApp, setSelectedApp] = useState(null)
  const [filter, setFilter] = useState('all') // all, pending, approved, denied, draft

  async function loadApplications() {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3000/api/farmer/applications', {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to load applications')
      const data = await response.json()
      setApplications(data.applications || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadApplications() }, [])

  async function deleteApplication(appId) {
    if (!confirm('Are you sure you want to delete this application?')) return
    try {
      const response = await fetch(`http://localhost:3000/api/farmer/applications/${appId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to delete application')
      await loadApplications()
      alert('Application deleted successfully')
    } catch (e) {
      alert('Failed to delete application: ' + e.message)
    }
  }

  async function duplicateApplication(app) {
    try {
      const newApp = {
        fieldId: app.field?._id || app.field,
        crop: app.crop,
        plantingDate: app.plantingDate,
        requestedAmount: app.requestedAmount,
        purpose: app.purpose,
        expectedHarvest: app.expectedHarvest,
        notes: app.notes + ' (Duplicated from previous application)'
      }
      const response = await fetch('http://localhost:3000/api/farmer/applications/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...newApp, status: 'draft' })
      })
      if (!response.ok) throw new Error('Failed to duplicate application')
      await loadApplications()
      alert('Application duplicated as draft')
    } catch (e) {
      alert('Failed to duplicate application: ' + e.message)
    }
  }

  function openApplicationDetails(app) {
    setSelectedApp(app)
    document.getElementById('app-details-modal')?.showModal()
  }

  const filteredApps = applications.filter(app => {
    if (filter === 'all') return true
    return app.status === filter
  })

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    denied: applications.filter(a => a.status === 'denied').length,
    draft: applications.filter(a => a.status === 'draft').length
  }

  return (
    <div>
      <div className="card-header" style={{ marginBottom: 24 }}>
        <h1>My Applications</h1>
        <p className="muted">Manage and track all your funding applications</p>
      </div>

      {error && <div className="error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Status Filter Tabs */}
      <div className="row" style={{ gap: 8, marginBottom: 24 }}>
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            className={`btn ${filter === status ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
          </button>
        ))}
      </div>

      {/* Applications Grid */}
      {loading ? (
        <div className="card">
          <div style={{ textAlign: 'center', padding: 32 }}>Loading applications...</div>
        </div>
      ) : !filteredApps.length ? (
        <div className="card">
          <div style={{ textAlign: 'center', padding: 32 }}>
            <div className="muted">No {filter === 'all' ? '' : filter} applications found</div>
            {filter === 'all' && (
              <p className="muted small" style={{ marginTop: 8 }}>
                Visit the Fields & Financing page to submit your first application
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="row" style={{ gap: 16 }}>
          {filteredApps.map(app => (
            <div key={app._id} className="col" style={{ minWidth: 320, maxWidth: 400 }}>
              <div className="card">
                <div className="card-header">
                  <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4>{app.field?.name || 'Unknown Field'}</h4>
                    <StatusChip status={app.status} />
                  </div>
                </div>
                <div style={{ padding: 16 }}>
                  <div className="row" style={{ marginBottom: 8 }}>
                    <div className="col">
                      <div className="muted small">Crop</div>
                      <div>{app.crop}</div>
                    </div>
                    <div className="col">
                      <div className="muted small">Amount</div>
                      <div style={{ fontWeight: 'bold', color: '#22c55e' }}>${app.requestedAmount}</div>
                    </div>
                  </div>
                  <div className="row" style={{ marginBottom: 8 }}>
                    <div className="col">
                      <div className="muted small">Planting Date</div>
                      <div>{new Date(app.plantingDate).toLocaleDateString()}</div>
                    </div>
                    <div className="col">
                      <div className="muted small">Applied</div>
                      <div>{new Date(app.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  {app.purpose && (
                    <div style={{ marginBottom: 8 }}>
                      <div className="muted small">Purpose</div>
                      <div className="pill low">{app.purpose}</div>
                    </div>
                  )}
                  {app.climascoreSnapshot?.climascore && (
                    <div style={{ marginBottom: 8 }}>
                      <div className="muted small">ClimaScore</div>
                      <div style={{ fontWeight: 'bold', color: app.climascoreSnapshot.climascore >= 67 ? '#22c55e' : app.climascoreSnapshot.climascore >= 34 ? '#eab308' : '#ef4444' }}>
                        {app.climascoreSnapshot.climascore}
                      </div>
                    </div>
                  )}
                </div>
                <div className="card-footer">
                  <div className="row" style={{ gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openApplicationDetails(app)}>
                      View Details
                    </button>
                    {app.status === 'draft' && (
                      <button className="btn btn-primary btn-sm" onClick={() => alert('Edit functionality coming soon')}>
                        Edit
                      </button>
                    )}
                    {(app.status === 'denied' || app.status === 'draft') && (
                      <button className="btn btn-secondary btn-sm" onClick={() => duplicateApplication(app)}>
                        Duplicate
                      </button>
                    )}
                    {app.status === 'draft' && (
                      <button className="btn btn-danger btn-sm" onClick={() => deleteApplication(app._id)}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Details Modal */}
      <dialog id="app-details-modal">
        <div className="modal-card" style={{ minWidth: 600, maxWidth: 800 }}>
          <div className="modal-header">
            <div className="modal-title">Application Details</div>
            <button type="button" className="modal-close" aria-label="Close" onClick={() => document.getElementById('app-details-modal').close()}>✕</button>
          </div>
          {selectedApp && (
            <div>
              <div className="row" style={{ marginBottom: 16 }}>
                <div className="col">
                  <div className="card">
                    <div className="card-header">
                      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4>Application Overview</h4>
                        <StatusChip status={selectedApp.status} />
                      </div>
                    </div>
                    <div style={{ padding: 16 }}>
                      <div className="row">
                        <div className="col">
                          <div><strong>Field:</strong> {selectedApp.field?.name || 'Unknown'}</div>
                          <div><strong>Crop:</strong> {selectedApp.crop}</div>
                          <div><strong>Requested Amount:</strong> <span style={{ color: '#22c55e', fontWeight: 'bold' }}>${selectedApp.requestedAmount}</span></div>
                        </div>
                        <div className="col">
                          <div><strong>Planting Date:</strong> {new Date(selectedApp.plantingDate).toLocaleDateString()}</div>
                          <div><strong>Applied On:</strong> {new Date(selectedApp.createdAt).toLocaleDateString()}</div>
                          {selectedApp.expectedHarvest && (
                            <div><strong>Expected Harvest:</strong> {new Date(selectedApp.expectedHarvest).toLocaleDateString()}</div>
                          )}
                        </div>
                      </div>
                      {selectedApp.purpose && (
                        <div style={{ marginTop: 12 }}>
                          <div><strong>Purpose:</strong> {selectedApp.purpose}</div>
                        </div>
                      )}
                      {selectedApp.notes && (
                        <div style={{ marginTop: 12 }}>
                          <div><strong>Notes:</strong></div>
                          <div className="muted" style={{ marginTop: 4, padding: 8, backgroundColor: '#f8f9fa', borderRadius: 4 }}>
                            {selectedApp.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {selectedApp.climascoreSnapshot && (
                <div className="row" style={{ marginBottom: 16 }}>
                  <div className="col">
                    <div className="card">
                      <div className="card-header"><h4>ClimaScore Assessment</h4></div>
                      <div style={{ padding: 16 }}>
                        <div className="row">
                          <div className="col">
                            <div><strong>ClimaScore:</strong> 
                              <span style={{ 
                                color: selectedApp.climascoreSnapshot.climascore >= 67 ? '#22c55e' : 
                                       selectedApp.climascoreSnapshot.climascore >= 34 ? '#eab308' : '#ef4444',
                                fontWeight: 'bold',
                                fontSize: '1.2em',
                                marginLeft: 8
                              }}>
                                {selectedApp.climascoreSnapshot.climascore}
                              </span>
                            </div>
                            {selectedApp.climascoreSnapshot.riskLevel && (
                              <div><strong>Risk Level:</strong> {selectedApp.climascoreSnapshot.riskLevel}</div>
                            )}
                          </div>
                          <div className="col">
                            {selectedApp.climascoreSnapshot.weatherScore && (
                              <div><strong>Weather Score:</strong> {selectedApp.climascoreSnapshot.weatherScore}</div>
                            )}
                            {selectedApp.climascoreSnapshot.soilScore && (
                              <div><strong>Soil Score:</strong> {selectedApp.climascoreSnapshot.soilScore}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedApp.lenderNotes && (
                <div className="row" style={{ marginBottom: 16 }}>
                  <div className="col">
                    <div className="card">
                      <div className="card-header"><h4>Lender Feedback</h4></div>
                      <div style={{ padding: 16 }}>
                        <div className="muted" style={{ padding: 8, backgroundColor: '#f8f9fa', borderRadius: 4 }}>
                          {selectedApp.lenderNotes}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
                {selectedApp.status === 'denied' && (
                  <button className="btn btn-primary" onClick={() => duplicateApplication(selectedApp)}>
                    Reapply
                  </button>
                )}
                <button className="btn btn-secondary" onClick={() => document.getElementById('app-details-modal').close()}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </dialog>
    </div>
  )
}
