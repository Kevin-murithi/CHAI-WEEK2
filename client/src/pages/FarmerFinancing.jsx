import { useState, useEffect } from 'react'

function AILoanAdvisor({ applications, fields }) {
  const [aiAdvice, setAiAdvice] = useState(null)
  const [loading, setLoading] = useState(false)

  async function getLoanAdvice() {
    if (!applications?.length || !fields?.length) return

    try {
      setLoading(true)

      // Get AI insights for all fields
      const fieldInsights = await Promise.all(
        fields.map(async (field) => {
          try {
            const res = await fetch(`http://localhost:3000/api/ai/analytics/${field._id}?crop=maize`, { credentials: 'include' })
            if (res.ok) {
              const data = await res.json()
              return { field, analytics: data.analytics }
            }
          } catch (e) {
            console.error('Failed to get field analytics:', e)
          }
          return { field, analytics: null }
        })
      )

      // Generate AI-powered loan advice based on field data and applications
      const advice = generateLoanRecommendations(applications, fieldInsights)
      setAiAdvice(advice)
    } catch (e) {
      console.error('Failed to generate loan advice:', e)
    } finally {
      setLoading(false)
    }
  }

  function generateLoanRecommendations(applications, fieldInsights) {
    const approvedApps = applications.filter(app => app.status === 'approved')
    const deniedApps = applications.filter(app => app.status === 'denied')

    const totalApproved = approvedApps.reduce((sum, app) => sum + (app.amount || 0), 0)

    // Analyze field health for loan recommendations
    const healthyFields = fieldInsights.filter(fi =>
      fi.analytics?.fieldHealthScore?.overallScore > 70
    ).length

    const highRiskFields = fieldInsights.filter(fi =>
      fi.analytics?.riskWarnings?.length > 2 ||
      fi.analytics?.fieldHealthScore?.overallScore < 50
    ).length

    const recommendations = []

    // Success rate analysis
    const successRate = applications.length > 0 ?
      (approvedApps.length / applications.length) * 100 : 0

    if (successRate > 80) {
      recommendations.push({
        type: 'success',
        title: 'Excellent Loan History',
        description: 'Your high approval rate suggests strong financial management. Consider larger loan amounts for expansion.',
        confidence: 0.9
      })
    } else if (successRate < 50 && deniedApps.length > 0) {
      recommendations.push({
        type: 'improvement',
        title: 'Focus on Field Health',
        description: 'Recent denials may be due to field conditions. Improve soil health and add sensors before reapplying.',
        confidence: 0.85
      })
    }

    // Field health recommendations
    if (healthyFields > highRiskFields) {
      recommendations.push({
        type: 'opportunity',
        title: 'Prime Lending Opportunity',
        description: `${healthyFields} of your fields show excellent health scores. You're a strong candidate for competitive loan rates.`,
        confidence: 0.8
      })
    }

    if (highRiskFields > 0) {
      recommendations.push({
        type: 'caution',
        title: 'Address Field Risks',
        description: `${highRiskFields} field(s) have risk warnings. Consider implementing recommended improvements before applying.`,
        confidence: 0.75
      })
    }

    // Seasonal timing advice
    const currentMonth = new Date().getMonth()
    if (currentMonth >= 8 || currentMonth <= 2) { // Pre-planting season
      recommendations.push({
        type: 'timing',
        title: 'Optimal Application Window',
        description: 'Apply now for planting season funding. Early applications often receive priority processing.',
        confidence: 0.7
      })
    }

    return {
      summary: {
        totalApplications: applications.length,
        approvedAmount: totalApproved,
        successRate: Math.round(successRate),
        healthyFields,
        highRiskFields
      },
      recommendations,
      nextSteps: generateNextSteps(applications, fieldInsights)
    }
  }

  function generateNextSteps(applications, fieldInsights) {
    const steps = []

    const hasPending = applications.some(app => app.status === 'pending')
    if (hasPending) {
      steps.push({
        priority: 'high',
        action: 'Monitor Application Status',
        description: 'Check your pending applications regularly for updates'
      })
    }

    const lowHealthFields = fieldInsights.filter(fi =>
      fi.analytics?.fieldHealthScore?.overallScore < 60
    )

    if (lowHealthFields.length > 0) {
      steps.push({
        priority: 'high',
        action: 'Improve Field Conditions',
        description: `Address issues in ${lowHealthFields.length} field(s) to increase loan approval chances`
      })
    }

    const fieldsWithoutSensors = fieldInsights.filter(fi =>
      !fi.analytics || !fi.analytics.fieldHealthScore
    )

    if (fieldsWithoutSensors.length > 0) {
      steps.push({
        priority: 'medium',
        action: 'Add Sensor Monitoring',
        description: 'Install sensors on unmonitored fields to provide lenders with more data'
      })
    }

    if (applications.length === 0) {
      steps.push({
        priority: 'medium',
        action: 'Start Your First Application',
        description: 'Apply for financing to kickstart your farming operations'
      })
    }

    return steps
  }

  useEffect(() => {
    if (applications?.length > 0 && fields?.length > 0) {
      getLoanAdvice()
    }
  }, [applications, fields])

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3>🤖 AI Loan Advisor</h3>
        </div>
        <div className="muted">Analyzing your loan eligibility and opportunities...</div>
      </div>
    )
  }

  if (!aiAdvice) return null

  return (
    <div className="card">
      <div className="card-header">
        <h3>🤖 AI Loan Advisor</h3>
        <div className="muted small">
          Personalized financing insights based on your field data and application history
        </div>
      </div>

      {/* Summary Stats */}
      <div className="row" style={{marginBottom: 16}}>
        <div className="col">
          <div className="kpi card">
            <div className="kpi-label">Success Rate</div>
            <div className="kpi-value" style={{
              color: aiAdvice.summary.successRate > 70 ? '#22c55e' :
                     aiAdvice.summary.successRate > 40 ? '#eab308' : '#ef4444'
            }}>
              {aiAdvice.summary.successRate}%
            </div>
            <div className="muted small">{aiAdvice.summary.totalApplications} applications</div>
          </div>
        </div>
        <div className="col">
          <div className="kpi card">
            <div className="kpi-label">Approved Amount</div>
            <div className="kpi-value">${aiAdvice.summary.approvedAmount.toLocaleString()}</div>
            <div className="muted small">Total approved</div>
          </div>
        </div>
        <div className="col">
          <div className="kpi card">
            <div className="kpi-label">Field Health</div>
            <div className="kpi-value" style={{
              color: aiAdvice.summary.healthyFields > aiAdvice.summary.highRiskFields ? '#22c55e' : '#eab308'
            }}>
              {aiAdvice.summary.healthyFields}/{aiAdvice.summary.healthyFields + aiAdvice.summary.highRiskFields}
            </div>
            <div className="muted small">Healthy fields</div>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      {aiAdvice.recommendations?.length > 0 && (
        <div style={{marginBottom: 16}}>
          <h4>💡 AI Recommendations</h4>
          {aiAdvice.recommendations.map((rec, idx) => (
            <div key={idx} className="card sub" style={{
              marginTop: 8,
              borderLeft: `4px solid ${
                rec.type === 'success' ? '#22c55e' :
                rec.type === 'opportunity' ? '#3b82f6' :
                rec.type === 'caution' ? '#eab308' : '#6b7280'
              }`
            }}>
              <div className="row" style={{alignItems: 'flex-start'}}>
                <div className="col">
                  <div><strong>{rec.title}</strong></div>
                  <div className="muted small">{rec.description}</div>
                  {rec.confidence && (
                    <div className="muted small" style={{marginTop: 4}}>
                      Confidence: {Math.round(rec.confidence * 100)}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Next Steps */}
      {aiAdvice.nextSteps?.length > 0 && (
        <div>
          <h4>🎯 Recommended Next Steps</h4>
          {aiAdvice.nextSteps.map((step, idx) => (
            <div key={idx} className="card sub" style={{
              marginTop: 8,
              borderLeft: `4px solid ${step.priority === 'high' ? '#ef4444' : '#eab308'}`
            }}>
              <div className="row" style={{alignItems: 'flex-start'}}>
                <div className="col">
                  <div><strong>{step.action}</strong></div>
                  <div className="muted small">{step.description}</div>
                </div>
                <div className="badge" style={{
                  backgroundColor: step.priority === 'high' ? '#fee2e2' : '#fef3c7',
                  color: step.priority === 'high' ? '#991b1b' : '#92400e'
                }}>
                  {step.priority}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function FarmerFinancing() {
  const [applications, setApplications] = useState([])
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [appsRes, fieldsRes] = await Promise.all([
          fetch('http://localhost:3000/api/farmer/applications', { credentials: 'include' }),
          fetch('http://localhost:3000/api/farmer/fields', { credentials: 'include' })
        ])

        if (appsRes.ok) {
          const appsData = await appsRes.json()
          setApplications(appsData.applications || [])
        }

        if (fieldsRes.ok) {
          const fieldsData = await fieldsRes.json()
          setFields(fieldsData.fields || [])
        }
      } catch (e) {
        console.error('Failed to load financing data:', e)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div>
        <h1>Financing Center</h1>
        <div className="muted">Loading your financing data...</div>
      </div>
    )
  }

  return (
    <div>
      <h1>Financing Center</h1>
      <div className="muted" style={{marginBottom: 16}}>
        AI-powered loan recommendations and application tracking
      </div>

      {/* AI Loan Advisor */}
      <AILoanAdvisor applications={applications} fields={fields} />

      {/* Application History */}
      <div className="card" style={{marginTop: 16}}>
        <div className="card-header">
          <h3>Application History</h3>
        </div>

        {!applications.length ? (
          <div className="muted">No applications yet. Visit your fields page to apply for financing.</div>
        ) : (
          <div>
            {applications.map(app => (
              <div key={app._id} className="card sub" style={{marginTop: 8}}>
                <div className="row" style={{justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                    <div><strong>{app.field?.name || 'Unknown Field'}</strong></div>
                    <div className="muted small">
                      {app.crop} • Requested: ${app.requestedAmount} • {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="row" style={{alignItems: 'center', gap: '8px'}}>
                    <span className={`badge ${
                      app.status === 'approved' ? 'success' :
                      app.status === 'pending' ? 'warning' :
                      app.status === 'denied' ? 'error' : ''
                    }`}>
                      {app.status?.replace('_', ' ').toUpperCase()}
                    </span>
                    {app.amount && app.amount !== app.requestedAmount && (
                      <div className="muted small">
                        Approved: ${app.amount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
