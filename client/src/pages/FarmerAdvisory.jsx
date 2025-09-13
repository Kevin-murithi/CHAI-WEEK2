import { useState, useEffect } from 'react'
import Tabs from '../components/ui/Tabs.jsx'
import Card from '../components/ui/Card.jsx'
import FieldSelector from '../components/advisory/FieldSelector.jsx'
import FieldHealthOverview from '../components/advisory/FieldHealthOverview.jsx'
import SatelliteAnalysis from '../components/advisory/SatelliteAnalysis.jsx'
import SoilAnalysis from '../components/advisory/SoilAnalysis.jsx'
import FertilizerRecommendations from '../components/advisory/FertilizerRecommendations.jsx'
import PlantingWindowAdvice from '../components/advisory/PlantingWindowAdvice.jsx'
import AIRecommendations from '../components/advisory/AIRecommendations.jsx'
import AILoader from '../components/ui/AILoader.jsx'
import { OverviewIcon, SatelliteIcon, SoilIcon, FertilizerIcon, PlantingIcon, AIIcon } from '../components/advisory/AdvisoryIcons.jsx'

export default function FarmerAdvisory() {
  const [advisory, setAdvisory] = useState(null)
  const [analytics, setAnalytics] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedField, setSelectedField] = useState('')
  const [fields, setFields] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [uiLoading, setUiLoading] = useState(false)

  useEffect(() => {
    loadFields()
    loadAdvisory()
  }, [])

  async function loadFields() {
    try {
      const res = await fetch('http://localhost:3000/api/farmer/fields', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setFields(data.fields || [])
        if (data.fields?.length && !selectedField) {
          setSelectedField(data.fields[0]._id)
        }
      }
    } catch (e) {
      console.error('Failed to load fields:', e)
    }
  }

  async function loadAdvisory() {
    try {
      setLoading(true)
      setUiLoading(true)
      setError('')
      const api = fetch('http://localhost:3000/api/ai/advisory', { credentials: 'include' })
      const delay = new Promise(res => setTimeout(res, 6000))
      const res = await Promise.race([api, api]) // get the Response from api
      if (!res.ok) throw new Error('Failed to load advisory')
      const data = await res.json()
      await delay
      setAdvisory(data.advisory)
    } catch (e) {
      setError(e.message)
    } finally {
      setUiLoading(false)
      setLoading(false)
    }
  }

  async function loadAnalytics(fieldId) {
    if (!fieldId) return
    try {
      setUiLoading(true)
      const api = fetch(`http://localhost:3000/api/ai/analytics/${fieldId}?crop=maize`, { credentials: 'include' })
      const delay = new Promise(res => setTimeout(res, 6000))
      const res = await Promise.race([api, api])
      if (res.ok) {
        const data = await res.json()
        setAnalytics(prev => ({ ...prev, [fieldId]: data.analytics }))
      }
      await delay
    } catch (e) {
      console.error('Failed to load analytics:', e)
    }
    finally {
      setUiLoading(false)
    }
  }

  useEffect(() => {
    if (selectedField) {
      loadAnalytics(selectedField)
    }
  }, [selectedField])

  // Build tab metadata with dynamic counts to help users prioritize
  const activeAnalytics = selectedField ? analytics[selectedField] : null
  const tabs = [
    { key: 'overview', label: 'Overview', icon: <OverviewIcon className="w-4 h-4" /> },
    { key: 'satellite', label: 'Satellite', icon: <SatelliteIcon className="w-4 h-4" />, count: activeAnalytics?.satelliteAnalysis?.stressIndicators?.length || 0 },
    { key: 'soil', label: 'Soil', icon: <SoilIcon className="w-4 h-4" /> },
    { key: 'fertilizer', label: 'Fertilizer', icon: <FertilizerIcon className="w-4 h-4" />, count: activeAnalytics?.fertilizerRecommendations?.recommendations?.length || 0 },
    { key: 'planting', label: 'Planting', icon: <PlantingIcon className="w-4 h-4" />, count: activeAnalytics?.plantingWindowAdvice?.optimalWindows?.length || 0 },
    { key: 'ai', label: 'AI', icon: <AIIcon className="w-4 h-4" />, count: advisory?.recommendations?.length || 0 },
  ]

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-100">AI Advisory Feed</h1>
          <p className="text-slate-400 text-sm">Actionable insights organized into focused tabs. Select a field to see detailed analytics.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadAdvisory} disabled={loading} className="inline-flex items-center gap-2 rounded-md bg-blue-600 text-white px-3 py-2 text-sm transition hover:bg-blue-500 disabled:opacity-60">
            {loading ? 'Refreshing…' : 'Refresh Insights'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-700/40 bg-rose-900/20 text-rose-200 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <FieldSelector fields={fields} selectedField={selectedField} onSelect={setSelectedField} />

      <Card className="overflow-hidden">
        <div className="relative">
          <Tabs tabs={tabs} active={activeTab} onChange={uiLoading ? (()=>{}) : setActiveTab} />
          {uiLoading && (
            <div className="absolute inset-0 z-10 bg-slate-900/50 border-b border-slate-800 backdrop-blur-[1px] rounded-t-xl flex items-center justify-center pointer-events-auto cursor-wait">
              <div className="text-slate-300 text-xs inline-flex items-center gap-2">
                <AIIcon className="w-4 h-4" /> Running AI…
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 transition-all">
          {uiLoading && (
            <div className="py-6">
              <AILoader minSeconds={6} running />
            </div>
          )}
          {!uiLoading && (
          <div className="space-y-4">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="animate-in fade-in duration-200">
              {selectedField && activeAnalytics ? (
                <FieldHealthOverview data={activeAnalytics} />
              ) : (
                <div className="text-slate-400 text-sm">Select a field above to view health overview and timing insights.</div>
              )}
            </div>
          )}

          {/* Satellite Tab */}
          {activeTab === 'satellite' && (
            <div className="animate-in fade-in duration-200">
              {selectedField && activeAnalytics?.satelliteAnalysis ? (
                <SatelliteAnalysis data={activeAnalytics.satelliteAnalysis} />
              ) : (
                <div className="text-slate-400 text-sm">No satellite analysis available for the selected field.</div>
              )}
            </div>
          )}

          {/* Soil Tab */}
          {activeTab === 'soil' && (
            <div className="animate-in fade-in duration-200">
              {selectedField && activeAnalytics?.soilAnalysis ? (
                <SoilAnalysis data={activeAnalytics.soilAnalysis} />
              ) : (
                <div className="text-slate-400 text-sm">No soil analysis available for the selected field.</div>
              )}
            </div>
          )}

          {/* Fertilizer Tab */}
          {activeTab === 'fertilizer' && (
            <div className="animate-in fade-in duration-200">
              {selectedField && activeAnalytics?.fertilizerRecommendations?.recommendations?.length > 0 ? (
                <FertilizerRecommendations data={activeAnalytics.fertilizerRecommendations} />
              ) : (
                <div className="text-slate-400 text-sm">No fertilizer recommendations available for the selected field.</div>
              )}
            </div>
          )}

          {/* Planting Tab */}
          {activeTab === 'planting' && (
            <div className="animate-in fade-in duration-200">
              {selectedField && activeAnalytics?.plantingWindowAdvice ? (
                <PlantingWindowAdvice data={activeAnalytics.plantingWindowAdvice} />
              ) : (
                <div className="text-slate-400 text-sm">No planting window advice available for the selected field.</div>
              )}
            </div>
          )}

          {/* AI Tab */}
          {activeTab === 'ai' && (
            <div className="animate-in fade-in duration-200">
              <AIRecommendations advisory={advisory} loading={loading} onRefresh={loadAdvisory} />
            </div>
          )}
          </div>
          )}
        </div>
      </Card>
    </div>
  )
}
