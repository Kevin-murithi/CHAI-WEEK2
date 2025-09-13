import { useState, useEffect } from 'react'

export default function FarmerAdvisory() {
  const [advisory, setAdvisory] = useState(null)
  const [analytics, setAnalytics] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedField, setSelectedField] = useState('')
  const [fields, setFields] = useState([])

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
      setError('')
      const res = await fetch('http://localhost:3000/api/ai/advisory', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load advisory')
      const data = await res.json()
      setAdvisory(data.advisory)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadAnalytics(fieldId) {
    if (!fieldId) return
    try {
      const res = await fetch(`http://localhost:3000/api/ai/analytics/${fieldId}?crop=maize`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setAnalytics(prev => ({ ...prev, [fieldId]: data.analytics }))
      }
    } catch (e) {
      console.error('Failed to load analytics:', e)
    }
  }

  useEffect(() => {
    if (selectedField) {
      loadAnalytics(selectedField)
    }
  }, [selectedField])

  function getPriorityColor(priority) {
    const colors = {
      high: '#ef4444',
      medium: '#f59e0b', 
      low: '#10b981'
    }
    return colors[priority] || '#6b7280'
  }

  function getTypeIcon(type) {
    const icons = {
      irrigation: '💧',
      fertilizer: '🌱',
      weather: '🌤️',
      pest: '🐛',
      general: '📋',
      soil: '🌍',
      planting: '🌱',
      harvest: '🌾'
    }
    return icons[type] || '📋'
  }

  return (
    <div>
      <div className="row" style={{alignItems: 'center', marginBottom: 16}}>
        <div className="col">
          <h1>AI Advisory Feed</h1>
        </div>
        <div className="col end">
          <button className="btn btn-primary" onClick={loadAdvisory} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Insights'}
          </button>
        </div>
      </div>

      {error && <div className="error" style={{marginBottom: 16}}>{error}</div>}

      {/* Field Selection for Analytics */}
      {fields.length > 0 && (
        <div className="card" style={{marginBottom: 16}}>
          <div className="card-header">
            <h3>Field Analytics</h3>
          </div>
          <div className="row">
            <div className="col">
              <label>Select Field for Detailed Analytics</label>
              <select value={selectedField} onChange={e => setSelectedField(e.target.value)}>
                <option value="">Choose a field...</option>
                {fields.map(f => (
                  <option key={f._id} value={f._id}>{f.name} ({f.areaHa?.toFixed(1)} ha)</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Field Health Overview */}
      {selectedField && analytics[selectedField] && (
        <div className="card" style={{marginBottom: 16}}>
          <div className="card-header">
            <h3>🌱 Field Health Overview</h3>
          </div>
          <div className="row">
            {analytics[selectedField].fieldHealthScore && (
              <div className="col">
                <div className="kpi card">
                  <div className="kpi-label">Overall Health Score</div>
                  <div className="kpi-value" style={{color: analytics[selectedField].fieldHealthScore.overallScore > 80 ? '#22c55e' : analytics[selectedField].fieldHealthScore.overallScore > 60 ? '#eab308' : '#ef4444'}}>
                    {analytics[selectedField].fieldHealthScore.overallScore}/100
                  </div>
                  <div className="muted small">
                    Status: {analytics[selectedField].fieldHealthScore.status}
                  </div>
                </div>
              </div>
            )}
            {analytics[selectedField].yieldPrediction && (
              <div className="col">
                <div className="kpi card">
                  <div className="kpi-label">Predicted Yield</div>
                  <div className="kpi-value">
                    {analytics[selectedField].yieldPrediction.estimatedYield} {analytics[selectedField].yieldPrediction.unit}
                  </div>
                  <div className="muted small">
                    Range: {analytics[selectedField].yieldPrediction.confidenceRange?.min} - {analytics[selectedField].yieldPrediction.confidenceRange?.max} tons
                  </div>
                </div>
              </div>
            )}
            <div className="col">
              <div className="kpi card">
                <div className="kpi-label">Risk Warnings</div>
                <div className="kpi-value">{analytics[selectedField].riskWarnings?.length || 0}</div>
                <div className="muted small">Active alerts</div>
              </div>
            </div>
          </div>

          {/* Risk Warnings */}
          {analytics[selectedField].riskWarnings?.length > 0 && (
            <div style={{marginTop: 12}}>
              <h4>⚠️ Risk Warnings</h4>
              {analytics[selectedField].riskWarnings.map((warning, idx) => (
                <div key={idx} className="card sub" style={{marginTop: 8, borderLeft: `4px solid ${getPriorityColor(warning.severity)}`}}>
                  <div className="row" style={{alignItems: 'center'}}>
                    <div className="col">
                      <div><strong>{warning.type.toUpperCase()}</strong> - {warning.severity}</div>
                      <div className="muted small">{warning.message}</div>
                    </div>
                    <div className="muted small">{warning.timeframe}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Timing Recommendations */}
          {analytics[selectedField].timingRecommendations?.length > 0 && (
            <div style={{marginTop: 12}}>
              <h4>📅 Timing Recommendations</h4>
              {analytics[selectedField].timingRecommendations.map((rec, idx) => (
                <div key={idx} className="card sub" style={{marginTop: 8}}>
                  <div className="row" style={{justifyContent: 'space-between'}}>
                    <div>
                      <div><strong>{rec.activity.replace('_', ' ').toUpperCase()}</strong></div>
                      <div className="muted small">{rec.description}</div>
                    </div>
                    <div className="muted small">
                      {new Date(rec.recommendedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Satellite Analysis */}
      {selectedField && analytics[selectedField]?.satelliteAnalysis && (
        <div className="card" style={{marginBottom: 16}}>
          <div className="card-header">
            <h3>🛰️ Satellite Analysis</h3>
          </div>
          <div className="row">
            <div className="col">
              <div className="kpi card">
                <div className="kpi-label">NDVI Index</div>
                <div className="kpi-value" style={{color: analytics[selectedField].satelliteAnalysis.ndvi > 0.6 ? '#22c55e' : analytics[selectedField].satelliteAnalysis.ndvi > 0.4 ? '#eab308' : '#ef4444'}}>
                  {analytics[selectedField].satelliteAnalysis.ndvi}
                </div>
                <div className="muted small">
                  Vegetation: {analytics[selectedField].satelliteAnalysis.vegetationHealth}
                </div>
              </div>
            </div>
            <div className="col">
              <div className="kpi card">
                <div className="kpi-label">Crop Stage</div>
                <div className="kpi-value">
                  {analytics[selectedField].satelliteAnalysis.cropStage?.replace('_', ' ')}
                </div>
                <div className="muted small">
                  Coverage: {analytics[selectedField].satelliteAnalysis.coveragePercentage}%
                </div>
              </div>
            </div>
            <div className="col">
              <div className="kpi card">
                <div className="kpi-label">Stress Indicators</div>
                <div className="kpi-value">
                  {analytics[selectedField].satelliteAnalysis.stressIndicators?.length || 0}
                </div>
                <div className="muted small">
                  Detected issues
                </div>
              </div>
            </div>
          </div>
          
          {analytics[selectedField].satelliteAnalysis.stressIndicators?.length > 0 && (
            <div style={{marginTop: 12}}>
              <h4>⚠️ Stress Indicators</h4>
              {analytics[selectedField].satelliteAnalysis.stressIndicators.map((indicator, idx) => (
                <div key={idx} className="card sub" style={{marginTop: 8, borderLeft: `4px solid ${getPriorityColor(indicator.severity)}`}}>
                  <div><strong>{indicator.type.replace('_', ' ').toUpperCase()}</strong> - {indicator.severity}</div>
                  <div className="muted small">{indicator.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Soil Analysis */}
      {selectedField && analytics[selectedField]?.soilAnalysis && (
        <div className="card" style={{marginBottom: 16}}>
          <div className="card-header">
            <h3>🌍 Soil Analysis</h3>
          </div>
          <div className="row">
            <div className="col">
              <div className="kpi card">
                <div className="kpi-label">Soil Health</div>
                <div className="kpi-value" style={{color: analytics[selectedField].soilAnalysis.overallHealth > 80 ? '#22c55e' : analytics[selectedField].soilAnalysis.overallHealth > 60 ? '#eab308' : '#ef4444'}}>
                  {analytics[selectedField].soilAnalysis.overallHealth}/100
                </div>
                <div className="muted small">Overall score</div>
              </div>
            </div>
            <div className="col">
              <div className="kpi card">
                <div className="kpi-label">pH Level</div>
                <div className="kpi-value">
                  {analytics[selectedField].soilAnalysis.ph}
                </div>
                <div className="muted small">
                  Temp: {analytics[selectedField].soilAnalysis.temperature}°C
                </div>
              </div>
            </div>
            <div className="col">
              <div className="kpi card">
                <div className="kpi-label">Organic Matter</div>
                <div className="kpi-value">
                  {analytics[selectedField].soilAnalysis.organicMatter}%
                </div>
                <div className="muted small">
                  Drainage: {analytics[selectedField].soilAnalysis.drainage}
                </div>
              </div>
            </div>
          </div>
          
          <div style={{marginTop: 12}}>
            <h4>🧪 Nutrient Levels</h4>
            <div className="row">
              <div className="col">
                <div className="card sub">
                  <div><strong>Nitrogen (N)</strong></div>
                  <div className="kpi-value" style={{fontSize: '18px', color: analytics[selectedField].soilAnalysis.nutrients?.nitrogen > 50 ? '#22c55e' : '#eab308'}}>
                    {analytics[selectedField].soilAnalysis.nutrients?.nitrogen || 0}%
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="card sub">
                  <div><strong>Phosphorus (P)</strong></div>
                  <div className="kpi-value" style={{fontSize: '18px', color: analytics[selectedField].soilAnalysis.nutrients?.phosphorus > 30 ? '#22c55e' : '#eab308'}}>
                    {analytics[selectedField].soilAnalysis.nutrients?.phosphorus || 0}%
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="card sub">
                  <div><strong>Potassium (K)</strong></div>
                  <div className="kpi-value" style={{fontSize: '18px', color: analytics[selectedField].soilAnalysis.nutrients?.potassium > 40 ? '#22c55e' : '#eab308'}}>
                    {analytics[selectedField].soilAnalysis.nutrients?.potassium || 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {analytics[selectedField].soilAnalysis.recommendations?.length > 0 && (
            <div style={{marginTop: 12}}>
              <h4>💡 Soil Improvement Tips</h4>
              <ul style={{paddingLeft: 16}}>
                {analytics[selectedField].soilAnalysis.recommendations.map((tip, idx) => (
                  <li key={idx} className="small" style={{marginBottom: 4}}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Fertilizer Recommendations */}
      {selectedField && analytics[selectedField]?.fertilizerRecommendations?.recommendations?.length > 0 && (
        <div className="card" style={{marginBottom: 16}}>
          <div className="card-header">
            <h3>🌾 Fertilizer Recommendations</h3>
            <div className="muted small">
              Total Estimated Cost: ${analytics[selectedField].fertilizerRecommendations.totalEstimatedCost} • 
              Expected Yield Increase: +{analytics[selectedField].fertilizerRecommendations.expectedYieldIncrease}%
            </div>
          </div>
          
          {analytics[selectedField].fertilizerRecommendations.recommendations.map((rec, idx) => (
            <div key={idx} className="card sub" style={{marginTop: 8, borderLeft: `4px solid ${getPriorityColor(rec.priority)}`}}>
              <div className="row" style={{justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div className="col">
                  <div><strong>{rec.product}</strong></div>
                  <div className="muted small">{rec.reason}</div>
                  <div style={{marginTop: 4}}>
                    <span className="badge" style={{backgroundColor: '#f3f4f6', color: '#374151', marginRight: 8}}>
                      {rec.amount} {rec.unit}
                    </span>
                    <span className="badge" style={{backgroundColor: '#dbeafe', color: '#1e40af'}}>
                      ${rec.cost}
                    </span>
                  </div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div className="muted small">{rec.timing}</div>
                  <div className="badge" style={{
                    backgroundColor: getPriorityColor(rec.priority),
                    color: 'white',
                    marginTop: 4
                  }}>
                    {rec.priority}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {analytics[selectedField].fertilizerRecommendations.applicationSchedule?.length > 0 && (
            <div style={{marginTop: 12}}>
              <h4>📅 Application Schedule</h4>
              <div className="row">
                {analytics[selectedField].fertilizerRecommendations.applicationSchedule.map((schedule, idx) => (
                  <div key={idx} className="col">
                    <div className="card sub">
                      <div><strong>{schedule.product.split(' ')[0]}</strong></div>
                      <div className="muted small">{schedule.timing}</div>
                      <div className="muted small">{schedule.amount}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Planting Window Advice */}
      {selectedField && analytics[selectedField]?.plantingWindowAdvice && (
        <div className="card" style={{marginBottom: 16}}>
          <div className="card-header">
            <h3>🌱 Optimal Planting Windows</h3>
            <div className="muted small">
              Current Season: {analytics[selectedField].plantingWindowAdvice.currentSeason} • 
              Soil Readiness: {analytics[selectedField].plantingWindowAdvice.soilReadiness?.status?.replace('_', ' ')}
            </div>
          </div>
          
          {analytics[selectedField].plantingWindowAdvice.nextBestWindow && (
            <div className="card sub" style={{marginBottom: 12, backgroundColor: '#f0f9ff', borderLeft: '4px solid #0ea5e9'}}>
              <div><strong>🎯 Next Recommended Window</strong></div>
              <div className="row" style={{alignItems: 'center', marginTop: 4}}>
                <div className="col">
                  <div>{analytics[selectedField].plantingWindowAdvice.nextBestWindow.start} - {analytics[selectedField].plantingWindowAdvice.nextBestWindow.end}</div>
                  <div className="muted small">Risk Level: {analytics[selectedField].plantingWindowAdvice.nextBestWindow.riskLevel}</div>
                </div>
                <div>
                  <div className="kpi-value" style={{fontSize: '18px', color: '#0ea5e9'}}>
                    {analytics[selectedField].plantingWindowAdvice.nextBestWindow.daysUntil} days
                  </div>
                  <div className="muted small">until window</div>
                </div>
              </div>
            </div>
          )}
          
          {analytics[selectedField].plantingWindowAdvice.optimalWindows?.length > 0 && (
            <div>
              <h4>📊 All Planting Windows</h4>
              <div className="row">
                {analytics[selectedField].plantingWindowAdvice.optimalWindows.map((window, idx) => (
                  <div key={idx} className="col">
                    <div className="card sub">
                      <div><strong>{window.start} - {window.end}</strong></div>
                      <div className="muted small">Risk: {window.riskLevel}</div>
                      <div className="muted small">Confidence: {window.confidence}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {analytics[selectedField].plantingWindowAdvice.riskFactors?.length > 0 && (
            <div style={{marginTop: 12}}>
              <h4>⚠️ Planting Risk Factors</h4>
              {analytics[selectedField].plantingWindowAdvice.riskFactors.map((risk, idx) => (
                <div key={idx} className="card sub" style={{marginTop: 8}}>
                  <div className="row" style={{justifyContent: 'space-between'}}>
                    <div>
                      <div><strong>{risk.type.toUpperCase()}</strong></div>
                      <div className="muted small">{risk.mitigation}</div>
                    </div>
                    <div className="badge" style={{backgroundColor: '#fef3c7', color: '#92400e'}}>
                      {risk.probability}% chance
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Recommendations */}
      <div className="card">
        <div className="card-header">
          <h3>🤖 AI Recommendations</h3>
          {advisory && (
            <div className="muted small">
              Generated {new Date(advisory.generatedAt).toLocaleString()} • 
              Confidence: {Math.round(advisory.confidence * 100)}%
            </div>
          )}
        </div>

        {loading && <div className="muted">Generating personalized recommendations...</div>}
        
        {advisory?.recommendations?.length > 0 ? (
          <div>
            {advisory.recommendations.map(rec => (
              <div key={rec.id} className="card sub" style={{
                marginTop: 12,
                borderLeft: `4px solid ${getPriorityColor(rec.priority)}`
              }}>
                <div className="row" style={{alignItems: 'flex-start', marginBottom: 8}}>
                  <div style={{fontSize: '20px', marginRight: 8}}>
                    {getTypeIcon(rec.type)}
                  </div>
                  <div className="col">
                    <div className="row" style={{justifyContent: 'space-between', alignItems: 'center'}}>
                      <div>
                        <strong>{rec.title}</strong>
                        <span className="badge" style={{
                          marginLeft: 8,
                          backgroundColor: getPriorityColor(rec.priority),
                          color: 'white'
                        }}>
                          {rec.priority}
                        </span>
                      </div>
                      {rec.confidence && (
                        <div className="muted small">
                          {Math.round(rec.confidence * 100)}% confidence
                        </div>
                      )}
                    </div>
                    <div className="muted" style={{marginTop: 4, marginBottom: 8}}>
                      {rec.description}
                    </div>
                    {rec.actionItems?.length > 0 && (
                      <div>
                        <strong className="small">Action Items:</strong>
                        <ul style={{marginTop: 4, paddingLeft: 16}}>
                          {rec.actionItems.map((item, idx) => (
                            <li key={idx} className="small">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !loading && (
          <div className="muted">No recommendations available. Try refreshing or add more field data.</div>
        )}
      </div>
    </div>
  )
}
