import { useEffect, useState } from 'react'

function StatusChip({ status }) {
  const map = {
    pending: { label: '🟡 Pending', color: 'bg-yellow-500/15 text-yellow-400' },
    approved: { label: '🟢 Approved', color: 'bg-green-500/15 text-green-400' },
    denied: { label: '🔴 Denied', color: 'bg-red-500/15 text-red-400' },
    needs_info: { label: '🟠 Needs Info', color: 'bg-orange-500/15 text-orange-400' },
    draft: { label: '📝 Draft', color: 'bg-slate-500/15 text-slate-300' },
  }
  const v = map[status] || { label: status, color: 'bg-slate-600/20 text-slate-200' }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${v.color}`}>
      {v.label}
    </span>
  )
}

function PriorityChip({ priority }) {
  const map = {
    high: { label: '🔴 High', color: 'bg-red-500/15 text-red-400' },
    medium: { label: '🟡 Medium', color: 'bg-yellow-500/15 text-yellow-400' },
    low: { label: '🟢 Low', color: 'bg-green-500/15 text-green-400' },
  }
  const p = map[priority] || { label: priority, color: 'bg-slate-600/20 text-slate-200' }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${p.color}`}>
      {p.label}
    </span>
  )
}

export default function FarmerApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedApp, setSelectedApp] = useState(null)
  const [filter, setFilter] = useState('all') // all, pending, approved, denied, draft
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

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
      
      // Show success modal
      setSuccessMessage('Application deleted successfully!')
      setShowSuccessModal(true)
      document.getElementById('success-modal-backdrop')?.classList.remove('hidden')
      document.getElementById('success-modal')?.showModal()
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
      
      // Close any open modals first
      document.getElementById('app-details-modal')?.close()
      document.getElementById('modal-backdrop')?.classList.add('hidden')
      
      // Show success modal
      setSuccessMessage('Application duplicated as draft successfully!')
      setShowSuccessModal(true)
      document.getElementById('success-modal-backdrop')?.classList.remove('hidden')
      document.getElementById('success-modal')?.showModal()
    } catch (e) {
      alert('Failed to duplicate application: ' + e.message)
    }
  }

  function openApplicationDetails(app) {
    setSelectedApp(app)
    document.getElementById('modal-backdrop')?.classList.remove('hidden')
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
    <div className="space-y-4">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-slate-100">My Applications</h1>
        <p className="text-slate-400 text-sm">Manage and track all your funding applications</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-200 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {Object.entries(statusCounts).map(([status, count]) => {
          const isActive = filter === status
          return (
            <button
              key={status}
              className={`whitespace-nowrap inline-flex items-center gap-2 rounded-md text-sm font-medium transition-colors duration-150 px-2.5 py-1.5 border focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
                isActive
                  ? '!bg-blue-600/20 !text-blue-100 !border-blue-500/50'
                  : '!bg-transparent text-slate-300 !border-blue-500/30 hover:!bg-blue-500/10 hover:text-slate-100'
              }`}
              onClick={() => setFilter(status)}
            >
              <span className="capitalize">{status}</span>
              <span className={`text-xs rounded-full px-2 py-0.5 ${isActive ? '!bg-blue-500/30 !text-blue-100' : 'bg-slate-700/60 text-slate-300'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      {/* Applications Grid */}
      {loading ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/70">
          <div className="text-center px-6 py-8 text-slate-300">Loading applications...</div>
        </div>
      ) : !filteredApps.length ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/70">
          <div className="text-center px-6 py-8">
            <div className="text-slate-400">No {filter === 'all' ? '' : filter} applications found</div>
            {filter === 'all' && (
              <p className="text-slate-500 text-sm mt-2">Visit the Fields & Financing page to submit your first application</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap -mx-1 lg:-mx-1.5">
          {filteredApps.map(app => (
            <div key={app._id} className="basis-full md:basis-1/2 lg:basis-1/3 grow-0 shrink-0 px-1 lg:px-1.5 mb-3 min-w-[280px]">
              <div className="h-full rounded-xl border border-slate-800 bg-slate-900/70">
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-800">
                  <h4 className="text-slate-200 font-medium truncate">{app.field?.name || 'Unknown Field'}</h4>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-green-400 font-semibold text-sm">${app.requestedAmount}</div>
                    <StatusChip status={app.status} />
                  </div>
                </div>
                <div className="px-4 py-2">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
                    <div className="min-w-[40%] md:min-w-0 md:basis-1/4 flex items-baseline gap-1.5">
                      <span className="text-slate-400 text-xs">Crop:</span>
                      <span className="text-slate-200 text-sm font-medium truncate">{app.crop}</span>
                    </div>
                    <div className="min-w-[40%] md:min-w-0 md:basis-1/4 flex items-baseline gap-1.5">
                      <span className="text-slate-400 text-xs">Planting:</span>
                      <span className="text-slate-200 text-sm font-medium">{new Date(app.plantingDate).toLocaleDateString()}</span>
                    </div>
                    <div className="min-w-[40%] md:min-w-0 md:basis-1/4 flex items-baseline gap-1.5">
                      <span className="text-slate-400 text-xs">Applied:</span>
                      <span className="text-slate-200 text-sm font-medium">{new Date(app.createdAt).toLocaleDateString()}</span>
                    </div>
                    {app.expectedHarvest && (
                      <div className="min-w-[40%] md:min-w-0 md:basis-1/4 flex items-baseline gap-1.5">
                        <span className="text-slate-400 text-xs">Harvest:</span>
                        <span className="text-slate-200 text-sm font-medium">{new Date(app.expectedHarvest).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {app.purpose && (
                        <span className="inline-flex items-center rounded-full bg-slate-700/60 text-slate-200 px-2 py-0.5 text-xs max-w-[60%] md:max-w-none truncate" title={app.purpose}>{app.purpose}</span>
                      )}
                      {app.climascoreSnapshot?.climascore && (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          app.climascoreSnapshot.climascore >= 67
                            ? 'bg-green-500/15 text-green-400'
                            : app.climascoreSnapshot.climascore >= 34
                            ? 'bg-yellow-500/15 text-yellow-400'
                            : 'bg-red-500/15 text-red-400'
                        }`}>
                          ClimaScore: {app.climascoreSnapshot.climascore}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        className="inline-flex items-center rounded-md border border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5"
                        onClick={() => openApplicationDetails(app)}
                      >
                        View Details
                      </button>
                      {app.status === 'draft' && (
                        <button
                          className="inline-flex items-center rounded-md border border-blue-600/50 bg-blue-600/20 hover:bg-blue-600/30 text-blue-100 text-xs px-2.5 py-1.5"
                          onClick={() => alert('Edit functionality coming soon')}
                        >
                          Edit
                        </button>
                      )}
                      {(app.status === 'denied' || app.status === 'draft') && (
                        <button
                          className="inline-flex items-center rounded-md border border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5"
                          onClick={() => duplicateApplication(app)}
                        >
                          Duplicate
                        </button>
                      )}
                      {app.status === 'draft' && (
                        <button
                          className="inline-flex items-center rounded-md border border-red-600/50 bg-red-600/20 hover:bg-red-600/30 text-red-100 text-xs px-2.5 py-1.5"
                          onClick={() => deleteApplication(app._id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {/* Footer removed as actions are inline above to save vertical space */}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Backdrop */}
      <div
        id="modal-backdrop"
        className="hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[998]"
        onClick={() => {
          document.getElementById('app-details-modal')?.close()
          document.getElementById('modal-backdrop')?.classList.add('hidden')
        }}
      />

      {/* Application Details Modal */}
      <dialog
        id="app-details-modal"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0 p-0 border-0 bg-transparent z-[999] max-h-[90vh] max-w-[90vw] w-auto"
      >
        <div className="rounded-xl border border-slate-800 bg-slate-900/95 text-slate-100 shadow-2xl relative overflow-y-auto max-h-[85vh] w-full max-w-[90vw] md:max-w-[800px] sm:min-w-[600px] backdrop-blur-2xl">
          {/* Fixed Close Button */}
          <button 
            type="button" 
            onClick={() => {
              document.getElementById('app-details-modal')?.close()
              document.getElementById('modal-backdrop')?.classList.add('hidden')
            }}
            className="sticky top-2 ml-auto mr-2 mb-0 z-10 w-8 h-8 rounded-full border border-slate-700 bg-slate-900/90 text-slate-100 flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
          <div className="px-4 pb-2">
            <div className="text-lg font-semibold">Application Details</div>
          </div>
          {selectedApp && (
            <div>
              <div className="mb-4">
                <div className="rounded-lg border border-slate-800 bg-slate-900/70">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                    <h4 className="text-slate-200 font-medium">Application Overview</h4>
                    <StatusChip status={selectedApp.status} />
                  </div>
                  <div className="px-4 py-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1 text-sm">
                        <div><span className="font-semibold">Field:</span> {selectedApp.field?.name || 'Unknown'}</div>
                        <div><span className="font-semibold">Crop:</span> {selectedApp.crop}</div>
                        <div><span className="font-semibold">Requested Amount:</span> <span className="text-green-400 font-semibold">${selectedApp.requestedAmount}</span></div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div><span className="font-semibold">Planting Date:</span> {new Date(selectedApp.plantingDate).toLocaleDateString()}</div>
                        <div><span className="font-semibold">Applied On:</span> {new Date(selectedApp.createdAt).toLocaleDateString()}</div>
                        {selectedApp.expectedHarvest && (
                          <div><span className="font-semibold">Expected Harvest:</span> {new Date(selectedApp.expectedHarvest).toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>
                    {selectedApp.purpose && (
                      <div className="mt-3 text-sm">
                        <div><span className="font-semibold">Purpose:</span> {selectedApp.purpose}</div>
                      </div>
                    )}
                    {selectedApp.notes && (
                      <div className="mt-3 text-sm">
                        <div className="font-semibold">Notes:</div>
                        <div className="mt-1 px-2 py-2 rounded bg-slate-800/70 text-slate-300">{selectedApp.notes}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedApp.climascoreSnapshot && (
                <div className="mb-4">
                  <div className="rounded-lg border border-slate-800 bg-slate-900/70">
                    <div className="px-4 py-3 border-b border-slate-800"><h4 className="text-slate-200 font-medium">ClimaScore Assessment</h4></div>
                    <div className="px-4 py-3 text-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">ClimaScore:</span>
                            <span className={`font-semibold text-base ${
                              selectedApp.climascoreSnapshot.climascore >= 67
                                ? 'text-green-400'
                                : selectedApp.climascoreSnapshot.climascore >= 34
                                ? 'text-yellow-400'
                                : 'text-red-400'
                            }`}>
                              {selectedApp.climascoreSnapshot.climascore}
                            </span>
                          </div>
                          {selectedApp.climascoreSnapshot.riskLevel && (
                            <div><span className="font-semibold">Risk Level:</span> {selectedApp.climascoreSnapshot.riskLevel}</div>
                          )}
                        </div>
                        <div className="space-y-1">
                          {selectedApp.climascoreSnapshot.weatherScore && (
                            <div><span className="font-semibold">Weather Score:</span> {selectedApp.climascoreSnapshot.weatherScore}</div>
                          )}
                          {selectedApp.climascoreSnapshot.soilScore && (
                            <div><span className="font-semibold">Soil Score:</span> {selectedApp.climascoreSnapshot.soilScore}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedApp.lenderNotes && (
                <div className="mb-4">
                  <div className="rounded-lg border border-slate-800 bg-slate-900/70">
                    <div className="px-4 py-3 border-b border-slate-800"><h4 className="text-slate-200 font-medium">Lender Feedback</h4></div>
                    <div className="px-4 py-3 text-sm">
                      <div className="px-2 py-2 rounded bg-slate-800/70 text-slate-300">{selectedApp.lenderNotes}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 px-1 pb-4">
                {selectedApp.status === 'denied' && (
                  <button
                    className="inline-flex items-center rounded-md border border-blue-600/50 bg-blue-600/20 hover:bg-blue-600/30 text-blue-100 text-sm px-3 py-1.5"
                    onClick={() => duplicateApplication(selectedApp)}
                  >
                    Reapply
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </dialog>

      {/* Success Modal Backdrop */}
      <div
        id="success-modal-backdrop"
        className="hidden fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-[1000]"
      />

      {/* Success Modal */}
      <dialog
        id="success-modal"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0 p-0 border-0 bg-transparent z-[1001]"
      >
        <div className="bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl text-slate-100 p-8 min-w-[320px] sm:min-w-[380px] md:min-w-[400px] max-w-[520px] text-center backdrop-blur-xl">
          {/* Success Icon */}
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6 text-3xl">✓</div>
          <h3 className="text-green-400 text-lg font-semibold mb-3">Success!</h3>
          <p className="text-slate-400 mb-6">{successMessage}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              className="inline-flex items-center rounded-md bg-blue-600/90 hover:bg-blue-600 text-white text-sm px-4 py-2 min-w-[120px]"
              onClick={() => {
                document.getElementById('success-modal')?.close()
                document.getElementById('success-modal-backdrop')?.classList.add('hidden')
                setShowSuccessModal(false)
                // Refresh the applications list
                loadApplications()
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </dialog>
    </div>
  )
}
