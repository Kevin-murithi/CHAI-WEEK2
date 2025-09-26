import PropTypes from 'prop-types'

export default function AnalyticsPanel({ analytics }) {
  if (!analytics) return null
  return (
    <div className="analytics-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16}}>
      <div className="card">
        <div className="card-header"><h4>AI Field Analysis</h4></div>
        <div className="analytics-content" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12}}>
          <div>
            <div><strong>Soil Health Score:</strong> {analytics.soilHealth?.score}/100</div>
            <div><strong>Vegetation Health:</strong> {analytics.vegetationHealth?.score}/100</div>
            <div><strong>Risk Assessment:</strong> {analytics.riskAssessment?.level}</div>
          </div>
          <div>
            <div><strong>Recommended Fertilizer:</strong> {analytics.fertilizerRecommendation?.type}</div>
            <div><strong>Estimated Cost:</strong> ${analytics.fertilizerRecommendation?.estimatedCost}</div>
            <div><strong>Expected Yield Improvement:</strong> {analytics.fertilizerRecommendation?.expectedYieldImprovement}%</div>
          </div>
        </div>
      </div>
    </div>
  )
}

AnalyticsPanel.propTypes = {
  analytics: PropTypes.object,
}
