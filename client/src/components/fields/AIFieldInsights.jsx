import { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'

export default function AIFieldInsights({ fieldId }) {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const loadInsights = useCallback(async () => {
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
  }, [fieldId])

  useEffect(() => {
    if (expanded && !insights) {
      loadInsights()
    }
  }, [expanded, insights, loadInsights])

  if (!expanded) {
    return (
      <button className="btn btn-secondary btn-sm" onClick={() => setExpanded(true)} style={{marginTop: 8}}>
        View AI Insights
      </button>
    )
  }

  return (
    <div className="card sub" style={{marginTop: 8, borderLeft: '3px solid #3b82f6'}}>
      <div className="row" style={{justifyContent: 'space-between', alignItems: 'center'}}>
        <div><strong> AI Field Insights</strong></div>
        <button className="btn btn-secondary btn-sm" onClick={() => setExpanded(false)}>Hide</button>
      </div>

      {loading ? (
        <div className="muted small">Loading AI insights...</div>
      ) : insights ? (
        <div style={{marginTop: 8}}>
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
                {insights.riskWarnings.length} risk{insights.riskWarnings.length > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {insights.fertilizerRecommendations?.recommendations?.length > 0 && (
            <div style={{marginTop: 8}}>
              <div className="small" style={{color: '#374151', fontWeight: 500}}> Top Recommendation:</div>
              <div className="small" style={{color: '#6b7280'}}>
                {insights.fertilizerRecommendations.recommendations[0].product} - {insights.fertilizerRecommendations.recommendations[0].reason}
              </div>
            </div>
          )}

          {insights.plantingWindowAdvice?.nextBestWindow && (
            <div style={{marginTop: 8}}>
              <div className="small" style={{color: '#374151', fontWeight: 500}}> Next Planting:</div>
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

AIFieldInsights.propTypes = {
  fieldId: PropTypes.string,
}
