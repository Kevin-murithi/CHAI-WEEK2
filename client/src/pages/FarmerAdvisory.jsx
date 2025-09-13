// import { useState, useEffect } from 'react'
// import Tabs from '../components/ui/Tabs.jsx'
// import Card from '../components/ui/Card.jsx'
// import FieldSelector from '../components/advisory/FieldSelector.jsx'
// import FieldHealthOverview from '../components/advisory/FieldHealthOverview.jsx'
// import SatelliteAnalysis from '../components/advisory/SatelliteAnalysis.jsx'
// import SoilAnalysis from '../components/advisory/SoilAnalysis.jsx'
// import FertilizerRecommendations from '../components/advisory/FertilizerRecommendations.jsx'
// import PlantingWindowAdvice from '../components/advisory/PlantingWindowAdvice.jsx'
// import AIRecommendations from '../components/advisory/AIRecommendations.jsx'
// import AILoader from '../components/ui/AILoader.jsx'
// import { OverviewIcon, SatelliteIcon, SoilIcon, FertilizerIcon, PlantingIcon, AIIcon } from '../components/advisory/AdvisoryIcons.jsx'

// export default function FarmerAdvisory() {
//   const [advisory, setAdvisory] = useState(null)
//   const [analytics, setAnalytics] = useState({})
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [selectedField, setSelectedField] = useState('')
//   const [fields, setFields] = useState([])
//   const [activeTab, setActiveTab] = useState('overview')
//   const [uiLoading, setUiLoading] = useState(false)

//   useEffect(() => {
//     loadFields()
//     loadAdvisory()
//   }, [])

//   async function loadFields() {
//     try {
//       const res = await fetch('http://localhost:3000/api/farmer/fields', { credentials: 'include' })
//       if (res.ok) {
//         const data = await res.json()
//         setFields(data.fields || [])
//         if (data.fields?.length && !selectedField) {
//           setSelectedField(data.fields[0]._id)
//         }
//       }
//     } catch (e) {
//       console.error('Failed to load fields:', e)
//     }
//   }

//   async function loadAdvisory() {
//     try {
//       setLoading(true)
//       setUiLoading(true)
//       setError('')
//       const api = fetch('http://localhost:3000/api/ai/advisory', { credentials: 'include' })
//       const delay = new Promise(res => setTimeout(res, 6000))
//       const res = await Promise.race([api, api]) // get the Response from api
//       if (!res.ok) throw new Error('Failed to load advisory')
//       const data = await res.json()
//       await delay
//       setAdvisory(data.advisory)
//     } catch (e) {
//       setError(e.message)
//     } finally {
//       setUiLoading(false)
//       setLoading(false)
//     }
//   }

//   async function loadAnalytics(fieldId) {
//     if (!fieldId) return
//     try {
//       setUiLoading(true)
//       const api = fetch(`http://localhost:3000/api/ai/analytics/${fieldId}?crop=maize`, { credentials: 'include' })
//       const delay = new Promise(res => setTimeout(res, 6000))
//       const res = await Promise.race([api, api])
//       if (res.ok) {
//         const data = await res.json()
//         setAnalytics(prev => ({ ...prev, [fieldId]: data.analytics }))
//       }
//       await delay
//     } catch (e) {
//       console.error('Failed to load analytics:', e)
//     }
//     finally {
//       setUiLoading(false)
//     }
//   }

//   useEffect(() => {
//     if (selectedField) {
//       loadAnalytics(selectedField)
//     }
//   }, [selectedField])

//   // Build tab metadata with dynamic counts to help users prioritize
//   const activeAnalytics = selectedField ? analytics[selectedField] : null
//   const tabs = [
//     { key: 'overview', label: 'Overview', icon: <OverviewIcon className="w-4 h-4" /> },
//     { key: 'satellite', label: 'Satellite', icon: <SatelliteIcon className="w-4 h-4" />, count: activeAnalytics?.satelliteAnalysis?.stressIndicators?.length || 0 },
//     { key: 'soil', label: 'Soil', icon: <SoilIcon className="w-4 h-4" /> },
//     { key: 'fertilizer', label: 'Fertilizer', icon: <FertilizerIcon className="w-4 h-4" />, count: activeAnalytics?.fertilizerRecommendations?.recommendations?.length || 0 },
//     { key: 'planting', label: 'Planting', icon: <PlantingIcon className="w-4 h-4" />, count: activeAnalytics?.plantingWindowAdvice?.optimalWindows?.length || 0 },
//     { key: 'ai', label: 'AI', icon: <AIIcon className="w-4 h-4" />, count: advisory?.recommendations?.length || 0 },
//   ]

//   return (
//     <div className="space-y-4 max-w-7xl mx-auto">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//         <div>
//           <h1 className="text-xl sm:text-2xl font-semibold text-slate-100">AI Advisory Feed</h1>
//           <p className="text-slate-400 text-sm">Actionable insights organized into focused tabs. Select a field to see detailed analytics.</p>
//         </div>
//         <div className="flex items-center gap-2">
//           <button onClick={loadAdvisory} disabled={loading} className="inline-flex items-center gap-2 rounded-md bg-blue-600 text-white px-3 py-2 text-sm transition hover:bg-blue-500 disabled:opacity-60">
//             {loading ? 'Refreshing…' : 'Refresh Insights'}
//           </button>
//         </div>
//       </div>

//       {error && (
//         <div className="rounded-lg border border-rose-700/40 bg-rose-900/20 text-rose-200 px-4 py-3 text-sm">
//           {error}
//         </div>
//       )}

//       <FieldSelector fields={fields} selectedField={selectedField} onSelect={setSelectedField} />

//       <Card className="overflow-hidden">
//         <div className="relative">
//           <Tabs tabs={tabs} active={activeTab} onChange={uiLoading ? (()=>{}) : setActiveTab} />
//           {uiLoading && (
//             <div className="absolute inset-0 z-10 bg-slate-900/50 border-b border-slate-800 backdrop-blur-[1px] rounded-t-xl flex items-center justify-center pointer-events-auto cursor-wait">
//               <div className="text-slate-300 text-xs inline-flex items-center gap-2">
//                 <AIIcon className="w-4 h-4" /> Running AI…
//               </div>
//             </div>
//           )}
//         </div>
//         <div className="mt-4 transition-all">
//           {uiLoading && (
//             <div className="py-6">
//               <AILoader minSeconds={6} running />
//             </div>
//           )}
//           {!uiLoading && (
//           <div className="space-y-4">
//           {/* Overview Tab */}
//           {activeTab === 'overview' && (
//             <div className="animate-in fade-in duration-200">
//               {selectedField && activeAnalytics ? (
//                 <FieldHealthOverview data={activeAnalytics} />
//               ) : (
//                 <div className="text-slate-400 text-sm">Select a field above to view health overview and timing insights.</div>
//               )}
//             </div>
//           )}

//           {/* Satellite Tab */}
//           {activeTab === 'satellite' && (
//             <div className="animate-in fade-in duration-200">
//               {selectedField && activeAnalytics?.satelliteAnalysis ? (
//                 <SatelliteAnalysis data={activeAnalytics.satelliteAnalysis} />
//               ) : (
//                 <div className="text-slate-400 text-sm">No satellite analysis available for the selected field.</div>
//               )}
//             </div>
//           )}

//           {/* Soil Tab */}
//           {activeTab === 'soil' && (
//             <div className="animate-in fade-in duration-200">
//               {selectedField && activeAnalytics?.soilAnalysis ? (
//                 <SoilAnalysis data={activeAnalytics.soilAnalysis} />
//               ) : (
//                 <div className="text-slate-400 text-sm">No soil analysis available for the selected field.</div>
//               )}
//             </div>
//           )}

//           {/* Fertilizer Tab */}
//           {activeTab === 'fertilizer' && (
//             <div className="animate-in fade-in duration-200">
//               {selectedField && activeAnalytics?.fertilizerRecommendations?.recommendations?.length > 0 ? (
//                 <FertilizerRecommendations data={activeAnalytics.fertilizerRecommendations} />
//               ) : (
//                 <div className="text-slate-400 text-sm">No fertilizer recommendations available for the selected field.</div>
//               )}
//             </div>
//           )}

//           {/* Planting Tab */}
//           {activeTab === 'planting' && (
//             <div className="animate-in fade-in duration-200">
//               {selectedField && activeAnalytics?.plantingWindowAdvice ? (
//                 <PlantingWindowAdvice data={activeAnalytics.plantingWindowAdvice} />
//               ) : (
//                 <div className="text-slate-400 text-sm">No planting window advice available for the selected field.</div>
//               )}
//             </div>
//           )}

//           {/* AI Tab */}
//           {activeTab === 'ai' && (
//             <div className="animate-in fade-in duration-200">
//               <AIRecommendations advisory={advisory} loading={loading} onRefresh={loadAdvisory} />
//             </div>
//           )}
//           </div>
//           )}
//         </div>
//       </Card>
//     </div>
//   )
// }



import { useState, useEffect } from 'react'

// Mock UI Components (simplified versions)
const Tabs = ({ tabs, active, onChange }) => (
  <div className="border-b border-slate-700">
    <div className="flex overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            active === tab.key
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          {tab.icon}
          {tab.label}
          {tab.count > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  </div>
)

const Card = ({ children, className = '' }) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-xl ${className}`}>
    {children}
  </div>
)

// Mock Icons
const OverviewIcon = ({ className }) => <div className={`${className} bg-green-500 rounded-full`}></div>
const SatelliteIcon = ({ className }) => <div className={`${className} bg-blue-500 rounded-full`}></div>
const SoilIcon = ({ className }) => <div className={`${className} bg-amber-500 rounded-full`}></div>
const FertilizerIcon = ({ className }) => <div className={`${className} bg-purple-500 rounded-full`}></div>
const PlantingIcon = ({ className }) => <div className={`${className} bg-emerald-500 rounded-full`}></div>
const AIIcon = ({ className }) => <div className={`${className} bg-pink-500 rounded-full`}></div>

const AILoader = ({ running, minSeconds }) => {
  const [dots, setDots] = useState('')
  
  useEffect(() => {
    if (running) {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.')
      }, 500)
      return () => clearInterval(interval)
    }
  }, [running])
  
  return (
    <div className="text-center py-8">
      <div className="inline-flex items-center gap-3 text-blue-400">
        <AIIcon className="w-8 h-8 animate-pulse" />
        <div className="text-lg">Analyzing agricultural data{dots}</div>
      </div>
      <div className="text-slate-400 text-sm mt-2">Processing satellite imagery, soil data, and weather patterns</div>
    </div>
  )
}

// Field Selector Component
const FieldSelector = ({ fields, selectedField, onSelect }) => (
  <div className="flex flex-wrap gap-3">
    {fields.map(field => (
      <button
        key={field._id}
        onClick={() => onSelect(field._id)}
        className={`px-4 py-2 rounded-lg text-sm transition-colors ${
          selectedField === field._id
            ? 'bg-blue-600 text-white'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
      >
        {field.name} - {field.size} acres
      </button>
    ))}
  </div>
)

// Individual Tab Components
const FieldHealthOverview = ({ data }) => (
  <div className="space-y-6 p-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-slate-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${
            data.overallHealth === 'Excellent' ? 'bg-green-500' :
            data.overallHealth === 'Good' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <h3 className="text-slate-200 font-medium">Overall Health</h3>
        </div>
        <p className="text-2xl font-bold text-white">{data.overallHealth}</p>
        <p className="text-slate-400 text-sm">{data.healthScore}/100 health score</p>
      </div>
      
      <div className="bg-slate-700 rounded-lg p-4">
        <h3 className="text-slate-200 font-medium mb-2">Growth Stage</h3>
        <p className="text-xl font-semibold text-blue-400">{data.growthStage}</p>
        <p className="text-slate-400 text-sm">{data.daysToMaturity} days to maturity</p>
      </div>
      
      <div className="bg-slate-700 rounded-lg p-4">
        <h3 className="text-slate-200 font-medium mb-2">Expected Yield</h3>
        <p className="text-xl font-semibold text-green-400">{data.expectedYield}</p>
        <p className="text-slate-400 text-sm">{data.yieldConfidence}% confidence</p>
      </div>
    </div>
    
    <div className="bg-slate-700 rounded-lg p-4">
      <h3 className="text-slate-200 font-medium mb-3">Recent Activity Timeline</h3>
      <div className="space-y-3">
        {data.recentActivities.map((activity, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
            <div>
              <p className="text-slate-300">{activity.activity}</p>
              <p className="text-slate-500 text-sm">{activity.date} - {activity.notes}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const SatelliteAnalysis = ({ data }) => (
  <div className="space-y-6 p-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-slate-700 rounded-lg p-4">
        <h3 className="text-slate-200 font-medium mb-3">Vegetation Index (NDVI)</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Current</span>
            <span className="text-green-400 font-semibold">{data.ndvi.current}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Average</span>
            <span className="text-slate-300">{data.ndvi.average}</span>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${(data.ndvi.current / 1.0) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-700 rounded-lg p-4">
        <h3 className="text-slate-200 font-medium mb-3">Moisture Levels</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Soil Moisture</span>
            <span className="text-blue-400 font-semibold">{data.moisture.soil}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Plant Water Stress</span>
            <span className="text-yellow-400">{data.moisture.stress}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div className="bg-slate-700 rounded-lg p-4">
      <h3 className="text-slate-200 font-medium mb-3">Stress Indicators ({data.stressIndicators.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.stressIndicators.map((indicator, i) => (
          <div key={i} className="bg-slate-600 rounded p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${
                indicator.severity === 'High' ? 'bg-red-500' :
                indicator.severity === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              <span className="text-slate-200 font-medium">{indicator.type}</span>
            </div>
            <p className="text-slate-400 text-sm">{indicator.description}</p>
            <p className="text-slate-500 text-xs mt-1">Affected area: {indicator.affectedArea}</p>
          </div>
        ))}
      </div>
    </div>
    
    <div className="bg-slate-700 rounded-lg p-4">
      <h3 className="text-slate-200 font-medium mb-3">Historical Comparison</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-slate-400">Last Month</p>
          <p className="text-slate-200">NDVI: {data.historical.lastMonth}</p>
        </div>
        <div>
          <p className="text-slate-400">Same Period Last Year</p>
          <p className="text-slate-200">NDVI: {data.historical.lastYear}</p>
        </div>
        <div>
          <p className="text-slate-400">Trend</p>
          <p className={`${data.historical.trend === 'Improving' ? 'text-green-400' : 'text-yellow-400'}`}>
            {data.historical.trend}
          </p>
        </div>
      </div>
    </div>
  </div>
)

const SoilAnalysis = ({ data }) => (
  <div className="space-y-6 p-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {data.nutrients.map((nutrient, i) => (
        <div key={i} className="bg-slate-700 rounded-lg p-4">
          <h3 className="text-slate-200 font-medium mb-2">{nutrient.name}</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Current</span>
              <span className="text-white font-semibold">{nutrient.current}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Optimal Range</span>
              <span className="text-slate-300">{nutrient.optimal}</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  nutrient.status === 'Good' ? 'bg-green-500' :
                  nutrient.status === 'Low' ? 'bg-red-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${nutrient.level}%` }}
              ></div>
            </div>
            <p className={`text-sm ${
              nutrient.status === 'Good' ? 'text-green-400' :
              nutrient.status === 'Low' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {nutrient.status}
            </p>
          </div>
        </div>
      ))}
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-slate-700 rounded-lg p-4">
        <h3 className="text-slate-200 font-medium mb-3">Soil Properties</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400">pH Level</span>
            <span className="text-white">{data.properties.ph}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Organic Matter</span>
            <span className="text-white">{data.properties.organicMatter}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Soil Texture</span>
            <span className="text-white">{data.properties.texture}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Drainage</span>
            <span className="text-white">{data.properties.drainage}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-700 rounded-lg p-4">
        <h3 className="text-slate-200 font-medium mb-3">Soil Health Score</h3>
        <div className="text-center">
          <div className="text-4xl font-bold text-green-400 mb-2">{data.healthScore}/100</div>
          <p className="text-slate-400 mb-4">{data.healthCategory}</p>
          <div className="w-full bg-slate-600 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full"
              style={{ width: `${data.healthScore}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
    
    <div className="bg-slate-700 rounded-lg p-4">
      <h3 className="text-slate-200 font-medium mb-3">Recommendations</h3>
      <div className="space-y-2">
        {data.recommendations.map((rec, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
            <p className="text-slate-300">{rec}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const FertilizerRecommendations = ({ data }) => (
  <div className="space-y-6 p-6">
    <div className="bg-slate-700 rounded-lg p-4">
      <h3 className="text-slate-200 font-medium mb-3">Application Schedule</h3>
      <div className="space-y-4">
        {data.recommendations.map((rec, i) => (
          <div key={i} className="bg-slate-600 rounded-lg p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-white font-medium">{rec.fertilizer}</h4>
                <p className="text-slate-400 text-sm">{rec.purpose}</p>
              </div>
              <div className="text-right">
                <p className="text-blue-400 font-semibold">{rec.amount}</p>
                <p className="text-slate-400 text-sm">{rec.timing}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-slate-400">Method:</span>
                <span className="text-slate-200 ml-1">{rec.method}</span>
              </div>
              <div>
                <span className="text-slate-400">Cost:</span>
                <span className="text-slate-200 ml-1">{rec.estimatedCost}</span>
              </div>
              <div>
                <span className="text-slate-400">Weather:</span>
                <span className="text-slate-200 ml-1">{rec.weatherConditions}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-slate-700 rounded-lg p-4">
        <h3 className="text-slate-200 font-medium mb-3">Nutrient Analysis</h3>
        <div className="space-y-3">
          {data.nutrientAnalysis.map((nutrient, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-slate-400">{nutrient.nutrient}</span>
              <div className="text-right">
                <p className="text-white font-medium">{nutrient.current}</p>
                <p className="text-slate-500 text-xs">Target: {nutrient.target}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-slate-700 rounded-lg p-4">
        <h3 className="text-slate-200 font-medium mb-3">Total Investment</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Fertilizer Costs</span>
            <span className="text-white">{data.totalCost.fertilizer}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Application Costs</span>
            <span className="text-white">{data.totalCost.application}</span>
          </div>
          <div className="border-t border-slate-600 pt-2">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-200">Total</span>
              <span className="text-green-400">{data.totalCost.total}</span>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Expected ROI: {data.totalCost.roi}</p>
        </div>
      </div>
    </div>
  </div>
)

const PlantingWindowAdvice = ({ data }) => (
  <div className="space-y-6 p-6">
    <div className="bg-slate-700 rounded-lg p-4">
      <h3 className="text-slate-200 font-medium mb-3">Optimal Planting Windows</h3>
      <div className="space-y-4">
        {data.optimalWindows.map((window, i) => (
          <div key={i} className="bg-slate-600 rounded-lg p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-white font-medium">{window.season} Season</h4>
                <p className="text-slate-400">{window.dateRange}</p>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  window.suitability === 'Excellent' ? 'bg-green-500/20 text-green-400' :
                  window.suitability === 'Good' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {window.suitability}
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-slate-300 text-sm font-medium mb-2">Weather Conditions</h5>
                <ul className="space-y-1 text-sm text-slate-400">
                  <li>Rainfall: {window.conditions.rainfall}</li>
                  <li>Temperature: {window.conditions.temperature}</li>
                  <li>Humidity: {window.conditions.humidity}</li>
                </ul>
              </div>
              <div>
                <h5 className="text-slate-300 text-sm font-medium mb-2">Expected Outcomes</h5>
                <ul className="space-y-1 text-sm text-slate-400">
                  <li>Germination Rate: {window.outcomes.germination}</li>
                  <li>Yield Potential: {window.outcomes.yield}</li>
                  <li>Risk Level: {window.outcomes.risk}</li>
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-slate-700 rounded-lg p-4">
        <h3 className="text-slate-200 font-medium mb-3">Crop Varieties</h3>
        <div className="space-y-3">
          {data.cropVarieties.map((variety, i) => (
            <div key={i} className="bg-slate-600 rounded p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-white font-medium">{variety.name}</h4>
                  <p className="text-slate-400 text-sm">{variety.type}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-green-400">{variety.yield}</p>
                  <p className="text-slate-400">{variety.maturity}</p>
                </div>
              </div>
              <p className="text-slate-500 text-sm mt-2">{variety.advantages}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-slate-700 rounded-lg p-4">
        <h3 className="text-slate-200 font-medium mb-3">Risk Assessment</h3>
        <div className="space-y-3">
          {data.riskFactors.map((risk, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                risk.level === 'High' ? 'bg-red-500' :
                risk.level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`}></div>
              <div>
                <p className="text-slate-300 font-medium">{risk.factor}</p>
                <p className="text-slate-400 text-sm">{risk.description}</p>
                <p className="text-slate-500 text-xs">Mitigation: {risk.mitigation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

const AIRecommendations = ({ advisory, loading, onRefresh }) => (
  <div className="space-y-6 p-6">
    {advisory?.recommendations?.length > 0 ? (
      <>
        <div className="bg-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-200 font-medium">Priority Recommendations</h3>
            <span className="text-slate-400 text-sm">Generated {advisory.lastUpdated}</span>
          </div>
          <div className="space-y-4">
            {advisory.recommendations.map((rec, i) => (
              <div key={i} className="bg-slate-600 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        rec.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                        rec.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {rec.priority} Priority
                      </div>
                      <span className="text-slate-400 text-sm">{rec.category}</span>
                    </div>
                    <h4 className="text-white font-medium mb-2">{rec.title}</h4>
                    <p className="text-slate-300 mb-3">{rec.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-slate-400">Timeline:</span>
                        <span className="text-slate-200 ml-1">{rec.timeline}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Impact:</span>
                        <span className="text-slate-200 ml-1">{rec.impact}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Confidence:</span>
                        <span className="text-slate-200 ml-1">{rec.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-slate-700 rounded-lg p-4">
          <h3 className="text-slate-200 font-medium mb-3">AI Insights Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-slate-300 font-medium mb-2">Key Observations</h4>
              <ul className="space-y-1 text-sm text-slate-400">
                {advisory.insights?.observations?.map((obs, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-blue-400 rounded-full mt-2"></div>
                    {obs}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-slate-300 font-medium mb-2">Seasonal Trends</h4>
              <ul className="space-y-1 text-sm text-slate-400">
                {advisory.insights?.trends?.map((trend, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-green-400 rounded-full mt-2"></div>
                    {trend}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </>
    ) : (
      <div className="text-center py-8">
        <AIIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-slate-400">No AI recommendations available</p>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-60"
        >
          {loading ? 'Generating...' : 'Generate Recommendations'}
        </button>
      </div>
    )}
  </div>
)

// Mock Data
const mockFields = [
  { _id: 'field1', name: 'North Field', size: 15 },
  { _id: 'field2', name: 'South Field', size: 22 },
  { _id: 'field3', name: 'East Paddock', size: 8 }
]

const mockAnalytics = {
  field1: {
    overallHealth: 'Good',
    healthScore: 78,
    growthStage: 'Vegetative',
    daysToMaturity: 85,
    expectedYield: '6.2 tons/hectare',
    yieldConfidence: 82,
    recentActivities: [
      { activity: 'Soil testing completed', date: '2024-09-10', notes: 'pH levels optimal' },
      { activity: 'Fertilizer application', date: '2024-09-05', notes: 'NPK 20-10-10 applied' },
      { activity: 'Irrigation system check', date: '2024-09-01', notes: 'All systems operational' }
    ],
    satelliteAnalysis: {
      ndvi: { current: 0.72, average: 0.68 },
      moisture: { soil: 65, stress: 'Low' },
      stressIndicators: [
        { type: 'Water Stress', severity: 'Low', description: 'Minor water stress detected in southwest corner', affectedArea: '0.8 hectares' },
        { type: 'Nutrient Deficiency', severity: 'Medium', description: 'Nitrogen levels below optimal in northern section', affectedArea: '1.2 hectares' },
        { type: 'Pest Activity', severity: 'Low', description: 'Fall armyworm activity detected', affectedArea: '0.5 hectares' }
      ],
      historical: { lastMonth: 0.65, lastYear: 0.70, trend: 'Improving' }
    },
    soilAnalysis: {
      nutrients: [
        { name: 'Nitrogen (N)', current: '45 ppm', optimal: '50-80 ppm', level: 65, status: 'Good' },
        { name: 'Phosphorus (P)', current: '18 ppm', optimal: '20-30 ppm', level: 45, status: 'Low' },
        { name: 'Potassium (K)', current: '125 ppm', optimal: '100-150 ppm', level: 80, status: 'Good' }
      ],
      properties: { ph: '6.2', organicMatter: '3.8%', texture: 'Clay Loam', drainage: 'Good' },
      healthScore: 76,
      healthCategory: 'Good',
      recommendations: [
        'Apply phosphorus fertilizer to increase P levels',
        'Consider lime application to maintain pH balance',
        'Increase organic matter through cover crops'
      ]
    },
    fertilizerRecommendations: {
      recommendations: [
        {
          fertilizer: 'NPK 20-10-10',
          purpose: 'Base fertilizer for vegetative growth',
          amount: '250 kg/hectare',
          timing: 'Within 2 weeks',
          method: 'Broadcast application',
          estimatedCost: '$180/hectare',
          weatherConditions: 'Apply before rainfall'
        },
        {
          fertilizer: 'Single Super Phosphate',
          purpose: 'Address phosphorus deficiency',
          amount: '100 kg/hectare',
          timing: '1-2 weeks after NPK',
          method: 'Band application',
          estimatedCost: '$65/hectare',
          weatherConditions: 'Avoid windy conditions'
        },
        {
          fertilizer: 'Urea (46% N)',
          purpose: 'Top dressing for tasseling stage',
          amount: '80 kg/hectare',
          timing: '6-8 weeks from now',
          method: 'Side dressing',
          estimatedCost: '$45/hectare',
          weatherConditions: 'Apply with adequate moisture'
        }
      ],
      nutrientAnalysis: [
        { nutrient: 'Nitrogen', current: '45 ppm', target: '60 ppm' },
        { nutrient: 'Phosphorus', current: '18 ppm', target: '25 ppm' },
        { nutrient: 'Potassium', current: '125 ppm', target: '130 ppm' }
      ],
      totalCost: {
        fertilizer: '$290/hectare',
        application: '$45/hectare',
        total: '$335/hectare',
        roi: '285%'
      }
    },
    plantingWindowAdvice: {
      optimalWindows: [
        {
          season: 'Long Rains',
          dateRange: 'March 15 - April 30, 2025',
          suitability: 'Excellent',
          conditions: {
            rainfall: '150-200mm expected',
            temperature: '22-28°C optimal',
            humidity: '65-75%'
          },
          outcomes: {
            germination: '95%',
            yield: 'High (7-8 tons/ha)',
            risk: 'Low'
          }
        },
        {
          season: 'Short Rains',
          dateRange: 'October 15 - November 30, 2024',
          suitability: 'Good',
          conditions: {
            rainfall: '80-120mm expected',
            temperature: '20-26°C',
            humidity: '60-70%'
          },
          outcomes: {
            germination: '85%',
            yield: 'Medium (5-6 tons/ha)',
            risk: 'Medium'
          }
        }
      ],
      cropVarieties: [
        {
          name: 'H614',
          type: 'Hybrid Maize',
          yield: '8-10 tons/ha',
          maturity: '120 days',
          advantages: 'High yield, drought tolerant, disease resistant'
        },
        {
          name: 'KDV1',
          type: 'Open Pollinated',
          yield: '6-8 tons/ha',
          maturity: '130 days',
          advantages: 'Cost effective, good storage quality'
        },
        {
          name: 'DH04',
          type: 'Drought Tolerant',
          yield: '5-7 tons/ha',
          maturity: '110 days',
          advantages: 'Performs well in dry conditions'
        }
      ],
      riskFactors: [
        {
          factor: 'Irregular Rainfall',
          level: 'Medium',
          description: 'Climate patterns show increasing variability',
          mitigation: 'Install drip irrigation system'
        },
        {
          factor: 'Fall Armyworm',
          level: 'High',
          description: 'High pest pressure expected this season',
          mitigation: 'Regular scouting and timely pesticide application'
        },
        {
          factor: 'Market Price Volatility',
          level: 'Low',
          description: 'Stable demand expected for maize',
          mitigation: 'Consider forward contracts'
        }
      ]
    }
  }
}

const mockAdvisory = {
  recommendations: [
    {
      priority: 'High',
      category: 'Nutrient Management',
      title: 'Address Phosphorus Deficiency',
      description: 'Satellite analysis and soil tests indicate phosphorus levels are below optimal in the northern section of your field. This could limit root development and overall yield.',
      timeline: 'Within 2 weeks',
      impact: 'Up to 15% yield increase',
      confidence: 92
    },
    {
      priority: 'Medium',
      category: 'Pest Management',
      title: 'Monitor Fall Armyworm Activity',
      description: 'Early signs of fall armyworm detected. Regular field scouting recommended to prevent significant crop damage.',
      timeline: 'Weekly monitoring',
      impact: 'Prevent 10-20% yield loss',
      confidence: 78
    },
    {
      priority: 'Medium',
      category: 'Water Management',
      title: 'Optimize Irrigation Schedule',
      description: 'Soil moisture levels are adequate but uneven distribution detected. Consider adjusting irrigation timing for better uniformity.',
      timeline: 'Next irrigation cycle',
      impact: '8-12% water efficiency gain',
      confidence: 85
    },
    {
      priority: 'Low',
      category: 'Soil Health',
      title: 'Plan Cover Crop Integration',
      description: 'Organic matter levels could benefit from cover crop integration in the next planting cycle to improve soil structure.',
      timeline: 'Next season planning',
      impact: 'Long-term soil health',
      confidence: 70
    }
  ],
  insights: {
    observations: [
      'NDVI values show healthy crop development with 95% field coverage',
      'Soil moisture is adequate but shows variability across the field',
      'Temperature trends favor continued vegetative growth',
      'Pest pressure is manageable with current monitoring protocols'
    ],
    trends: [
      'Rainfall patterns suggest good conditions for the next 4 weeks',
      'Market prices for maize showing upward trend (+12% from last month)',
      'Regional yield expectations are 8% above 5-year average',
      'Input costs stabilizing after early season volatility'
    ]
  },
  lastUpdated: '2 hours ago'
}

export default function FarmerAdvisory() {
  const [advisory, setAdvisory] = useState(mockAdvisory)
  const [analytics, setAnalytics] = useState({ field1: mockAnalytics.field1 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedField, setSelectedField] = useState('field1')
  const [fields, setFields] = useState(mockFields)
  const [activeTab, setActiveTab] = useState('overview')
  const [uiLoading, setUiLoading] = useState(false)

  useEffect(() => {
    // Simulate loading additional field data when selected
    if (selectedField && !analytics[selectedField]) {
      setUiLoading(true)
      setTimeout(() => {
        // For demo purposes, use same mock data for all fields
        setAnalytics(prev => ({ 
          ...prev, 
          [selectedField]: {
            ...mockAnalytics.field1,
            overallHealth: selectedField === 'field2' ? 'Excellent' : 'Good',
            healthScore: selectedField === 'field2' ? 85 : selectedField === 'field3' ? 72 : 78,
            expectedYield: selectedField === 'field2' ? '7.1 tons/hectare' : selectedField === 'field3' ? '5.8 tons/hectare' : '6.2 tons/hectare'
          }
        }))
        setUiLoading(false)
      }, 2000)
    }
  }, [selectedField, analytics])

  async function loadAdvisory() {
    setLoading(true)
    setUiLoading(true)
    setError('')
    
    // Simulate API call with loading
    setTimeout(() => {
      try {
        // Simulate updated recommendations
        const updatedAdvisory = {
          ...mockAdvisory,
          lastUpdated: 'Just now',
          recommendations: mockAdvisory.recommendations.map(rec => ({
            ...rec,
            confidence: Math.max(70, rec.confidence + Math.floor(Math.random() * 10) - 5)
          }))
        }
        setAdvisory(updatedAdvisory)
      } catch (e) {
        setError('Failed to refresh advisory data')
      } finally {
        setLoading(false)
        setUiLoading(false)
      }
    }, 3000)
  }

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
    <div className="min-h-screen bg-slate-900 text-white p-4">
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
    </div>
  )
}
