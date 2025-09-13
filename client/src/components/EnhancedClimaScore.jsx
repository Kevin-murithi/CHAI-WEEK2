import { useState, useEffect } from 'react'

export default function EnhancedClimaScore({ fieldId, crop = 'maize', plantingDate, onScoreUpdate }) {
  const [scoreData, setScoreData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (fieldId) {
      loadEnhancedScore()
    }
  }, [fieldId, crop, plantingDate])

  async function loadEnhancedScore() {
    try {
      setLoading(true)
      setError('')
      
      const params = new URLSearchParams({
        crop,
        ...(plantingDate && { plantingDate })
      })
      
      const res = await fetch(`http://localhost:3000/api/ai/climascore/${fieldId}?${params}`, {
        credentials: 'include'
      })
      
      if (!res.ok) throw new Error('Failed to load enhanced ClimaScore')
      
      const data = await res.json()
      setScoreData(data)
      
      // Notify parent component of score update
      if (onScoreUpdate) {
        onScoreUpdate(data.enhancedScore)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function getScoreColor(score) {
    if (score >= 80) return '#10b981' // Green
    if (score >= 60) return '#f59e0b' // Yellow
    if (score >= 40) return '#f97316' // Orange
    return '#ef4444' // Red
  }

  function getScoreLabel(score) {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
  }

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3>🤖 AI-Enhanced ClimaScore</h3>
        </div>
        <div className="muted">Computing enhanced risk assessment...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <h3>🤖 AI-Enhanced ClimaScore</h3>
        </div>
        <div className="error">{error}</div>
        <button className="btn btn-secondary" onClick={loadEnhancedScore}>
          Retry
        </button>
      </div>
    )
  }

  if (!scoreData) return null

  const { baseScore, enhancedScore } = scoreData

  return (
    <div className="card">
      <div className="card-header">
        <h3>🤖 AI-Enhanced ClimaScore</h3>
        <div className="muted small">
          Confidence: {Math.round(enhancedScore.confidence * 100)}%
        </div>
      </div>

      <div className="row">
        <div className="col">
          <div className="kpi card">
            <div className="kpi-label">Original Score</div>
            <div className="kpi-value" style={{ color: getScoreColor(baseScore.climascore) }}>
              {baseScore.climascore}
            </div>
            <div className="muted small">{getScoreLabel(baseScore.climascore)}</div>
          </div>
        </div>
        <div className="col">
          <div className="kpi card">
            <div className="kpi-label">AI-Enhanced Score</div>
            <div className="kpi-value" style={{ color: getScoreColor(enhancedScore.enhancedScore) }}>
              {enhancedScore.enhancedScore}
            </div>
            <div className="muted small">{getScoreLabel(enhancedScore.enhancedScore)}</div>
          </div>
        </div>
      </div>

      {/* AI Enhancement Factors */}
      {enhancedScore.aiFactors && (
        <div style={{ marginTop: 12 }}>
          <h4>🧠 AI Enhancement Factors</h4>
          <div className="row">
            <div className="col">
              <div className="card sub">
                <div className="small"><strong>Sensor Trends</strong></div>
                <div className="muted small">
                  Risk adjustment: {enhancedScore.aiFactors.sensorTrendRisk > 0 ? '+' : ''}{enhancedScore.aiFactors.sensorTrendRisk.toFixed(1)}
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card sub">
                <div className="small"><strong>Historical Performance</strong></div>
                <div className="muted small">
                  Risk adjustment: {enhancedScore.aiFactors.historicalRisk > 0 ? '+' : ''}{enhancedScore.aiFactors.historicalRisk.toFixed(1)}
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card sub">
                <div className="small"><strong>Regional Patterns</strong></div>
                <div className="muted small">
                  Risk adjustment: {enhancedScore.aiFactors.regionalRisk > 0 ? '+' : ''}{enhancedScore.aiFactors.regionalRisk.toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk Breakdown */}
      {baseScore.risk_breakdown && (
        <div style={{ marginTop: 12 }}>
          <h4>📊 Risk Breakdown</h4>
          <div className="row">
            {Object.entries(baseScore.risk_breakdown).map(([risk, value]) => (
              <div key={risk} className="col">
                <div className="card sub">
                  <div className="small"><strong>{risk.replace('_', ' ').toUpperCase()}</strong></div>
                  <div className="muted small">{typeof value === 'number' ? value.toFixed(2) : value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="row" style={{ marginTop: 12, justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={loadEnhancedScore}>
          Refresh Score
        </button>
      </div>
    </div>
  )
}
