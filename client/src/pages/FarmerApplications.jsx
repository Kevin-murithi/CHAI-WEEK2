import { useEffect, useState } from 'react'
import Card from '../components/ui/Card.jsx'

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
      
      // Ensure any prior selection is cleared
      setSelectedApp(null)
      
      // Show success modal
      setSuccessMessage('Application duplicated as draft successfully!')
      setShowSuccessModal(true)
    } catch (e) {
      alert('Failed to duplicate application: ' + e.message)
    }
  }

  // View details disabled in table view

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
    <div className="min-h-[70vh] flex items-start justify-center">
      <div className="w-full max-w-5xl px-2 sm:px-4 space-y-4">
        <div className="mb-4 text-center">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-emerald-300 via-blue-300 to-sky-300 bg-clip-text text-transparent tracking-wide">My Applications</h1>
          <p className="text-slate-400/90 text-sm">Manage and track all your funding applications</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg ring-1 ring-red-400/30 bg-red-500/10 text-red-200 px-3 py-2 text-sm shadow-sm max-w-lg mx-auto text-center">
            {error}
          </div>
        )}

      {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            className={`whitespace-nowrap inline-flex items-center gap-2 rounded-xl text-sm font-medium transition-all duration-150 px-3 py-1.5 focus:outline-none ring-1 ${(filter===status) ? 'bg-blue-600/20 text-blue-100 ring-blue-400/40 shadow-md shadow-blue-900/30' : 'bg-slate-800/50 text-slate-300 ring-white/5 hover:bg-slate-800/70 hover:text-slate-100 hover:ring-white/10'}`}
            onClick={() => setFilter(status)}
          >
            <span className="capitalize">{status}</span>
            <span className={`text-xs rounded-full px-2 py-0.5 ${(filter===status) ? 'bg-blue-500/40 text-blue-100' : 'bg-slate-700/70 text-slate-300'}`}>{count}</span>
          </button>
        ))}
      </div>

      {/* Applications Table */}
        {loading ? (
          <div className="rounded-xl ring-1 ring-white/5 bg-slate-900/70 shadow-lg max-w-lg mx-auto">
            <div className="text-center px-6 py-8 text-slate-300">Loading applications...</div>
          </div>
        ) : !filteredApps.length ? (
          <div className="rounded-xl ring-1 ring-white/5 bg-slate-900/70 shadow-lg max-w-lg mx-auto">
            <div className="text-center px-6 py-8">
              <div className="text-slate-400">No {filter === 'all' ? '' : filter} applications found</div>
              {filter === 'all' && (
                <p className="text-slate-500 text-sm mt-2">Visit the Fields & Financing page to submit your first application</p>
              )}
            </div>
          </div>
        ) : (
          <Card className="ring-1 ring-white/5 bg-slate-900/70 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50 text-slate-300">
                  <tr>
                    <th className="text-left px-4 py-3">Field</th>
                    <th className="text-left px-4 py-3">Crop</th>
                    <th className="text-left px-4 py-3">Requested</th>
                    <th className="text-left px-4 py-3">Planting</th>
                    <th className="text-left px-4 py-3">Applied</th>
                    <th className="text-left px-4 py-3">Harvest</th>
                    <th className="text-left px-4 py-3">Purpose</th>
                    <th className="text-left px-4 py-3">ClimaScore</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredApps.map(app => (
                    <tr key={app._id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 text-slate-200">{app.field?.name || 'Unknown Field'}</td>
                      <td className="px-4 py-3 text-slate-300">{app.crop}</td>
                      <td className="px-4 py-3 text-green-400 font-semibold">${app.requestedAmount}</td>
                      <td className="px-4 py-3 text-slate-300">{new Date(app.plantingDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-slate-300">{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-slate-300">{app.expectedHarvest ? new Date(app.expectedHarvest).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-3">
                        {app.purpose ? (
                          <span className="inline-flex items-center rounded-full bg-slate-800/60 ring-1 ring-white/5 text-slate-200 px-2 py-0.5 text-xs max-w-[240px] truncate" title={app.purpose}>{app.purpose}</span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {app.climascoreSnapshot?.climascore ? (
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            app.climascoreSnapshot.climascore >= 67
                              ? 'bg-green-500/15 text-green-400'
                              : app.climascoreSnapshot.climascore >= 34
                              ? 'bg-yellow-500/15 text-yellow-400'
                              : 'bg-red-500/15 text-red-400'
                          }`}>
                            {app.climascoreSnapshot.climascore}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3"><StatusChip status={app.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {app.status === 'draft' && (
                            <button
                              className="inline-flex items-center rounded-md ring-1 ring-blue-400/30 bg-blue-600/20 hover:bg-blue-600/30 text-blue-100 text-xs px-2.5 py-1.5 shadow-sm"
                              onClick={() => alert('Edit functionality coming soon')}
                            >
                              Edit
                            </button>
                          )}
                          {(app.status === 'denied' || app.status === 'draft') && (
                            <button
                              className="inline-flex items-center rounded-md ring-1 ring-white/5 bg-slate-800/60 hover:bg-slate-800/80 text-slate-200 text-xs px-2.5 py-1.5 shadow-sm"
                              onClick={() => duplicateApplication(app)}
                            >
                              Duplicate
                            </button>
                          )}
                          {app.status === 'draft' && (
                            <button
                              className="inline-flex items-center rounded-md ring-1 ring-red-400/30 bg-red-600/20 hover:bg-red-600/30 text-red-100 text-xs px-2.5 py-1.5 shadow-sm"
                              onClick={() => deleteApplication(app._id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}


          {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-[1001]">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur" onClick={() => setShowSuccessModal(false)} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-[520px]">
                <Card className="bg-slate-900/95 ring-1 ring-white/5 text-slate-100 shadow-2xl text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6 text-3xl">✓</div>
                  <h3 className="text-green-400 text-lg font-semibold mb-3">Success!</h3>
                  <p className="text-slate-400 mb-6">{successMessage}</p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      className="inline-flex items-center rounded-md bg-blue-600/90 hover:bg-blue-600 text-white text-sm px-4 py-2 min-w-[120px] shadow-md"
                      onClick={() => {
                        setShowSuccessModal(false)
                        // Refresh the applications list
                        loadApplications()
                      }}
                    >
                      Continue
                    </button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
