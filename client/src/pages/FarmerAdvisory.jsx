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
      general: '📋'
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

      {/* Predictive Analytics */}
      {selectedField && analytics[selectedField] && (
        <div className="card" style={{marginBottom: 16}}>
          <div className="card-header">
            <h3>🔮 Predictive Analytics</h3>
          </div>
          <div className="row">
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
