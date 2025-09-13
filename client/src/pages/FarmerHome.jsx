import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import FarmerMap from '../components/FarmerMap'
import '../styles/ai-insights.css'
import EnhancedClimaScore from '../components/EnhancedClimaScore.jsx'

function StatCard({ label, value }) {
  return (
    <div className="card kpi" style={{minWidth:180}}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
    </div>
  )
}

function Legend() {
  const item = (color, label) => (
    <div className="row" style={{gap:6}}>
      <div style={{width:10, height:10, borderRadius:2, background:color}} />
      <span className="small muted">{label}</span>
    </div>
  )
  return (
    <div className="card sub" style={{maxWidth:280}}>
      <div className="muted small" style={{marginBottom:6}}>Field Color Legend</div>
      {item('#22c55e', 'Green (Score ≥ 67)')}
      {item('#eab308', 'Yellow (34–66)')}
      {item('#ef4444', 'Red (≤ 33)')}
      {item('#64748b', 'Unknown')}
    </div>
  )
}

export default function FarmerHome() {
  const navigate = useNavigate()
  const [fields, setFields] = useState([])
  const [apps, setApps] = useState([])
  const [aiSummary, setAiSummary] = useState(null)
  const [loadingAI, setLoadingAI] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [fRes, aRes] = await Promise.all([
          fetch('http://localhost:3000/api/farmer/fields', { credentials: 'include' }),
          fetch('http://localhost:3000/api/farmer/applications', { credentials: 'include' })
        ])
        const f = await fRes.json(); const a = await aRes.json()
        setFields(f.fields || [])
        setApps(a.applications || [])
        
        // Load aggregated AI summary for all fields
        if (f.fields?.length > 0) {
          loadAggregatedAISummary(f.fields)
        }
      } catch { /* ignore */ }
    }
    load()
  }, [])

  async function loadAggregatedAISummary(fields) {
    if (!fields?.length) return
    try {
      setLoadingAI(true)
      
      // Load analytics for all fields
      const analyticsPromises = fields.map(field => 
        fetch(`http://localhost:3000/api/ai/analytics/${field._id}?crop=maize`, { credentials: 'include' })
          .then(res => res.ok ? res.json() : null)
          .catch(() => null)
      )
      
      const results = await Promise.all(analyticsPromises)
      const validAnalytics = results.filter(r => r?.analytics).map(r => r.analytics)
      
      if (validAnalytics.length > 0) {
        // Aggregate the analytics data
        const aggregated = aggregateAnalytics(validAnalytics, fields)
        setAiSummary(aggregated)
      }
    } catch (e) {
      console.error('Failed to load aggregated AI summary:', e)
    } finally {
      setLoadingAI(false)
    }
  }
  
  function aggregateAnalytics(analyticsArray, fields) {
    const totalFields = fields.length
    const analyzedFields = analyticsArray.length
    
    // Aggregate field health scores
    const healthScores = analyticsArray
      .map(a => a.fieldHealthScore?.overallScore)
      .filter(score => typeof score === 'number')
    const avgHealthScore = healthScores.length ? 
      Math.round(healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length) : null
    
    // Aggregate yield predictions
    const yieldPredictions = analyticsArray
      .map(a => a.yieldPrediction?.estimatedYield)
      .filter(yieldValue => typeof yieldValue === 'number')
    const totalPredictedYield = yieldPredictions.length ?
      Math.round(yieldPredictions.reduce((sum, yieldValue) => sum + yieldValue, 0) * 100) / 100 : null
    
    // Count vegetation health statuses
    const vegetationStatuses = analyticsArray
      .map(a => a.satelliteAnalysis?.vegetationHealth)
      .filter(status => status)
    const healthyFields = vegetationStatuses.filter(status => status === 'excellent' || status === 'good').length
    
    // Aggregate soil health
    const soilHealthScores = analyticsArray
      .map(a => a.soilAnalysis?.overallHealth)
      .filter(score => typeof score === 'number')
    const avgSoilHealth = soilHealthScores.length ?
      Math.round(soilHealthScores.reduce((sum, score) => sum + score, 0) / soilHealthScores.length) : null
    
    // Count total recommendations
    const allRecommendations = analyticsArray
      .flatMap(a => a.fertilizerRecommendations?.recommendations || [])
    const highPriorityRecs = allRecommendations.filter(rec => rec.priority === 'high')
    
    // Count risk warnings
    const allRiskWarnings = analyticsArray
      .flatMap(a => a.riskWarnings || [])
    
    // Find next planting windows
    const nextWindows = analyticsArray
      .map(a => a.plantingWindowAdvice?.nextBestWindow)
      .filter(window => window && window.daysUntil)
      .sort((a, b) => a.daysUntil - b.daysUntil)
    
    return {
      isAggregated: true,
      totalFields,
      analyzedFields,
      fieldHealthScore: avgHealthScore ? {
        overallScore: avgHealthScore,
        status: avgHealthScore > 80 ? 'excellent' : avgHealthScore > 60 ? 'good' : avgHealthScore > 40 ? 'fair' : 'poor'
      } : null,
      yieldPrediction: totalPredictedYield ? {
        estimatedYield: totalPredictedYield,
        unit: 'tons total'
      } : null,
      vegetationSummary: {
        healthyFields,
        totalAnalyzed: vegetationStatuses.length,
        healthPercentage: vegetationStatuses.length ? Math.round((healthyFields / vegetationStatuses.length) * 100) : 0
      },
      soilAnalysis: avgSoilHealth ? {
        overallHealth: avgSoilHealth,
        status: avgSoilHealth > 80 ? 'excellent' : avgSoilHealth > 60 ? 'good' : 'needs improvement'
      } : null,
      fertilizerRecommendations: {
        recommendations: allRecommendations,
        highPriority: highPriorityRecs.length,
        totalRecommendations: allRecommendations.length
      },
      riskWarnings: allRiskWarnings,
      plantingWindowAdvice: {
        nextBestWindow: nextWindows[0] || null,
        upcomingWindows: nextWindows.slice(0, 3)
      }
    }
  }

  const stats = useMemo(() => {
    const totalFields = fields.length
    const activeLoans = (apps||[]).filter(x => x.status === 'approved').length
    const scores = (fields||[]).map(f => f.latestClimaScore).filter(s => typeof s === 'number')
    const avgScore = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : '—'
    const advisories = aiSummary?.fertilizerRecommendations?.recommendations?.length || 0
    return { totalFields, activeLoans, avgScore, advisories }
  }, [fields, apps, aiSummary])

  return (
    <div>
      {/* AI Insights Summary */}
      {aiSummary && (
        <div className="ai-insights-card">
          <div className="ai-insights-header">
            <div className="ai-insights-title">
              <div className="ai-icon">🤖</div>
              <div>
                <h3>AI Portfolio Insights</h3>
                <div className="ai-subtitle">Powered by advanced field analytics</div>
              </div>
            </div>
            <button className="btn-ai-view" onClick={() => navigate('/dashboard/farmer/advisory')}>
              <span>View Details</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17l9.2-9.2M17 17V7H7"/>
              </svg>
            </button>
          </div>
          
          <div className="ai-metrics-grid">
            {aiSummary.fieldHealthScore && (
              <div className="ai-metric-card health">
                <div className="metric-icon">🌱</div>
                <div className="metric-content">
                  <div className="metric-label">Portfolio Health</div>
                  <div className="metric-value" data-status={aiSummary.fieldHealthScore.overallScore > 80 ? 'excellent' : aiSummary.fieldHealthScore.overallScore > 60 ? 'good' : 'poor'}>
                    {aiSummary.fieldHealthScore.overallScore}<span className="metric-unit">/100</span>
                  </div>
                  <div className="metric-status">{aiSummary.fieldHealthScore.status}</div>
                </div>
              </div>
            )}
            
            {aiSummary.yieldPrediction && (
              <div className="ai-metric-card yield">
                <div className="metric-icon">📊</div>
                <div className="metric-content">
                  <div className="metric-label">Expected Yield</div>
                  <div className="metric-value">
                    {aiSummary.yieldPrediction.estimatedYield}<span className="metric-unit">t</span>
                  </div>
                  <div className="metric-status">Total across portfolio</div>
                </div>
              </div>
            )}
            
            {aiSummary.vegetationSummary && (
              <div className="ai-metric-card vegetation">
                <div className="metric-icon">🛰️</div>
                <div className="metric-content">
                  <div className="metric-label">Vegetation Health</div>
                  <div className="metric-value" data-status={aiSummary.vegetationSummary.healthPercentage > 80 ? 'excellent' : aiSummary.vegetationSummary.healthPercentage > 60 ? 'good' : 'poor'}>
                    {aiSummary.vegetationSummary.healthyFields}<span className="metric-separator">/</span>{aiSummary.vegetationSummary.totalAnalyzed}
                  </div>
                  <div className="metric-status">{aiSummary.vegetationSummary.healthPercentage}% healthy fields</div>
                </div>
              </div>
            )}
            
            {aiSummary.soilAnalysis && (
              <div className="ai-metric-card soil">
                <div className="metric-icon">🌍</div>
                <div className="metric-content">
                  <div className="metric-label">Soil Quality</div>
                  <div className="metric-value" data-status={aiSummary.soilAnalysis.overallHealth > 80 ? 'excellent' : aiSummary.soilAnalysis.overallHealth > 60 ? 'good' : 'poor'}>
                    {aiSummary.soilAnalysis.overallHealth}<span className="metric-unit">/100</span>
                  </div>
                  <div className="metric-status">{aiSummary.soilAnalysis.status}</div>
                </div>
              </div>
            )}
          </div>
          
          {/* AI Insights Tags */}
          {(aiSummary.fertilizerRecommendations?.totalRecommendations > 0 || 
            aiSummary.plantingWindowAdvice?.nextBestWindow || 
            aiSummary.riskWarnings?.length > 0) && (
            <div className="ai-insights-tags">
              <div className="insights-tags-label">Key Insights</div>
              <div className="insights-tags-container">
                {aiSummary.isAggregated && aiSummary.analyzedFields && (
                  <div className="insight-tag coverage">
                    <span className="tag-icon">📋</span>
                    <span>{aiSummary.analyzedFields}/{aiSummary.totalFields} fields analyzed</span>
                  </div>
                )}
                
                {aiSummary.fertilizerRecommendations?.highPriority > 0 && (
                  <div className="insight-tag urgent">
                    <span className="tag-icon">⚡</span>
                    <span>{aiSummary.fertilizerRecommendations.highPriority} urgent needs</span>
                  </div>
                )}
                
                {aiSummary.fertilizerRecommendations?.totalRecommendations > 0 && (
                  <div className="insight-tag recommendations">
                    <span className="tag-icon">💡</span>
                    <span>{aiSummary.fertilizerRecommendations.totalRecommendations} recommendations</span>
                  </div>
                )}
                
                {aiSummary.plantingWindowAdvice?.nextBestWindow && (
                  <div className="insight-tag planting">
                    <span className="tag-icon">🌱</span>
                    <span>Next window: {aiSummary.plantingWindowAdvice.nextBestWindow.daysUntil} days</span>
                  </div>
                )}
                
                {aiSummary.riskWarnings?.length > 0 && (
                  <div className="insight-tag warning">
                    <span className="tag-icon">⚠️</span>
                    <span>{aiSummary.riskWarnings.length} risk alert{aiSummary.riskWarnings.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {loadingAI && (
        <div className="ai-loading-card">
          <div className="ai-loading-spinner"></div>
          <span style={{color: '#64748b', fontWeight: 500}}>Analyzing portfolio with AI...</span>
        </div>
      )}
      
      {!aiSummary && !loadingAI && fields.length > 0 && (
        <div className="card" style={{borderLeft:'4px solid #eab308', marginBottom: 12}}>
          <div className="row" style={{alignItems: 'center'}}>
            <div className="col">
              <strong>🤖 AI Analysis Available</strong>: Get personalized insights across all your fields.
            </div>
            <div>
              <button className="btn btn-sm" onClick={() => loadAggregatedAISummary(fields)}>
                Load Portfolio Insights
              </button>
            </div>
          </div>
        </div>
      )}
      
      {!aiSummary && !loadingAI && fields.length === 0 && (
        <div className="card" style={{borderLeft:'4px solid #eab308', marginBottom: 12}}>
          <strong>Welcome!</strong> Create your first field to get AI-powered farming insights.
        </div>
      )}
      <div className="row" style={{marginTop:12}}>
        <StatCard label="Total Fields" value={stats.totalFields} />
        <StatCard label="Active Loans" value={stats.activeLoans} />
        <StatCard label="Average Field Score" value={stats.avgScore} />
        <StatCard label="AI Recommendations" value={stats.advisories} />
      </div>
      <div className="row" style={{marginTop:12, justifyContent:'space-between', alignItems:'center'}}>
        <Legend />
        <div>
          <button className="btn btn-primary" onClick={() => {
            const el = document.getElementById('farmer-map');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}>Map New Field</button>
          <button className="btn btn-secondary" onClick={()=>navigate('/dashboard/farmer/financing')}>Apply for Loan</button>
        </div>
      </div>
      <div id="farmer-map" style={{marginTop:12}}>
        <FarmerMap />
      </div>
    </div>
  )
}
