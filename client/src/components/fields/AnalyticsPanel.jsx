import PropTypes from 'prop-types'

export default function AnalyticsPanel({ analytics }) {
  if (!analytics) return null
  const base = analytics.baseScore || null
  const dbg = base?.debug || {}
  const rb = base?.risk_breakdown || {}
  const src = Array.isArray(base?.data_sources_used) ? base.data_sources_used[0] : undefined
  return (
    <div className="analytics-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16}}>
      <div className="card" style={{
        backgroundColor: 'rgba(16, 24, 40, 0.6)',
        border: '1px solid rgba(31, 42, 68, 0.5)',
        color: '#e7ecf6'
      }}>
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
      {base && (
        <div className="card" style={{
          backgroundColor: 'rgba(16, 24, 40, 0.6)',
          border: '1px solid rgba(31, 42, 68, 0.5)',
          color: '#e7ecf6'
        }}>
          <div className="card-header"><h4>Climate Snapshot</h4></div>
          <div className="analytics-content" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12}}>
            <div>
              <div><strong>Source:</strong> {src || '—'}</div>
              <div><strong>ClimaScore:</strong> {base.climascore ?? '—'}</div>
              <div><strong>Drought Risk:</strong> {rb.drought_risk || '—'}</div>
            </div>
            <div>
              <div><strong>30-day Precip:</strong> {typeof dbg.total30_precip_mm === 'number' ? `${dbg.total30_precip_mm.toFixed(1)} mm` : '—'}</div>
              <div><strong>Dry Streak Max:</strong> {dbg.max_dry_streak_days ?? '—'} days</div>
              <div><strong>Heavy Rain Days:</strong> {dbg.heavy_rain_days_30mm ?? '—'}</div>
            </div>
            <div>
              <div><strong>Heat >34°C:</strong> {dbg.heat_stress_days_gt34c ?? '—'} days</div>
              <div><strong>Days Count:</strong> {dbg.days_count ?? '—'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

AnalyticsPanel.propTypes = {
  analytics: PropTypes.object,
}
