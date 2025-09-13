import { useState, useEffect } from 'react'

function AIResourceRecommender({ fields }) {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)

  async function generateRecommendations() {
    if (!fields?.length) return

    try {
      setLoading(true)

      // Get AI insights for all fields to understand farmer's needs
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

      // Generate personalized learning recommendations
      const recs = generateLearningRecommendations(fieldInsights)
      setRecommendations(recs)
    } catch (e) {
      console.error('Failed to generate recommendations:', e)
    } finally {
      setLoading(false)
    }
  }

  function generateLearningRecommendations(fieldInsights) {
    const recommendations = []

    // Analyze field conditions to identify learning needs
    const soilIssues = fieldInsights.filter(fi =>
      fi.analytics?.soilAnalysis?.overallHealth < 70
    )

    const lowYieldFields = fieldInsights.filter(fi =>
      fi.analytics?.yieldPrediction?.estimatedYield < 6 // tons per hectare
    )

    const fieldsWithPests = fieldInsights.filter(fi =>
      fi.analytics?.riskWarnings?.some(w => w.type === 'pest')
    )

    const droughtProneFields = fieldInsights.filter(fi =>
      fi.analytics?.riskWarnings?.some(w => w.type === 'drought')
    )

    // Soil health resources
    if (soilIssues.length > 0) {
      recommendations.push({
        category: 'Soil Management',
        priority: 'high',
        title: 'Advanced Soil Health Techniques',
        description: 'Learn about soil testing, pH balancing, and organic matter improvement',
        resources: [
          {
            type: 'video',
            title: 'Soil pH Management for Better Crop Yields',
            duration: '15 min',
            url: '#'
          },
          {
            type: 'guide',
            title: 'Complete Guide to Soil Testing',
            url: '#'
          },
          {
            type: 'course',
            title: 'Sustainable Soil Management Certification',
            duration: '4 weeks',
            url: '#'
          }
        ],
        reason: `${soilIssues.length} field(s) need soil health improvement`
      })
    }

    // Pest management resources
    if (fieldsWithPests.length > 0) {
      recommendations.push({
        category: 'Pest Management',
        priority: 'high',
        title: 'Integrated Pest Management (IPM)',
        description: 'Master biological, cultural, and chemical pest control methods',
        resources: [
          {
            type: 'video',
            title: 'Identifying Common Crop Pests',
            duration: '12 min',
            url: '#'
          },
          {
            type: 'guide',
            title: 'IPM Strategies for Sustainable Farming',
            url: '#'
          },
          {
            type: 'webinar',
            title: 'Biological Pest Control Methods',
            duration: '45 min',
            url: '#'
          }
        ],
        reason: `${fieldsWithPests.length} field(s) have pest risks`
      })
    }

    // Drought management resources
    if (droughtProneFields.length > 0) {
      recommendations.push({
        category: 'Water Management',
        priority: 'high',
        title: 'Drought-Resistant Farming Techniques',
        description: 'Learn water conservation, drought-tolerant crops, and irrigation optimization',
        resources: [
          {
            type: 'video',
            title: 'Efficient Irrigation Systems',
            duration: '18 min',
            url: '#'
          },
          {
            type: 'guide',
            title: 'Drought-Tolerant Crop Selection Guide',
            url: '#'
          },
          {
            type: 'course',
            title: 'Water Management in Agriculture',
            duration: '6 weeks',
            url: '#'
          }
        ],
        reason: `${droughtProneFields.length} field(s) are drought-prone`
      })
    }

    // Yield optimization resources
    if (lowYieldFields.length > 0) {
      recommendations.push({
        category: 'Yield Optimization',
        priority: 'medium',
        title: 'Maximizing Crop Yields',
        description: 'Advanced techniques for higher productivity and better harvests',
        resources: [
          {
            type: 'video',
            title: 'Precision Agriculture Techniques',
            duration: '22 min',
            url: '#'
          },
          {
            type: 'guide',
            title: 'Fertilizer Optimization Guide',
            url: '#'
          },
          {
            type: 'webinar',
            title: 'Crop Rotation Strategies',
            duration: '35 min',
            url: '#'
          }
        ],
        reason: `${lowYieldFields.length} field(s) have below-average yield potential`
      })
    }

    // General farming resources (always include)
    recommendations.push({
      category: 'General Farming',
      priority: 'medium',
      title: 'Modern Farming Best Practices',
      description: 'Stay updated with the latest farming technologies and techniques',
      resources: [
        {
          type: 'video',
          title: 'Introduction to Smart Farming',
          duration: '10 min',
          url: '#'
        },
        {
          type: 'guide',
          title: 'Digital Agriculture Tools',
          url: '#'
        },
        {
          type: 'course',
          title: 'Climate-Smart Agriculture',
          duration: '8 weeks',
          url: '#'
        }
      ],
      reason: 'Essential knowledge for modern farming'
    })

    // Sort by priority
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  useEffect(() => {
    if (fields?.length > 0) {
      generateRecommendations()
    }
  }, [fields])

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3>🤖 AI Learning Recommendations</h3>
        </div>
        <div className="muted">Analyzing your fields to recommend personalized learning resources...</div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>🤖 AI Learning Recommendations</h3>
        <div className="muted small">
          Personalized learning paths based on your field conditions and farming needs
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="muted">Add fields and sensor data to get personalized learning recommendations.</div>
      ) : (
        <div>
          {recommendations.map((rec, idx) => (
            <div key={idx} className="card sub" style={{
              marginTop: 12,
              borderLeft: `4px solid ${rec.priority === 'high' ? '#ef4444' : rec.priority === 'medium' ? '#eab308' : '#6b7280'}`
            }}>
              <div className="row" style={{alignItems: 'flex-start', marginBottom: 8}}>
                <div className="col">
                  <div className="row" style={{justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                      <strong>{rec.title}</strong>
                      <span className="badge" style={{
                        marginLeft: 8,
                        backgroundColor: rec.priority === 'high' ? '#fee2e2' : '#fef3c7',
                        color: rec.priority === 'high' ? '#991b1b' : '#92400e'
                      }}>
                        {rec.priority}
                      </span>
                    </div>
                    <div className="muted small">{rec.category}</div>
                  </div>
                  <div className="muted small" style={{marginTop: 4}}>{rec.description}</div>
                  <div className="muted small" style={{marginTop: 4, fontStyle: 'italic'}}>{rec.reason}</div>
                </div>
              </div>

              <div style={{marginTop: 12}}>
                <h5>📚 Recommended Resources</h5>
                <div className="row" style={{gap: '8px', flexWrap: 'wrap'}}>
                  {rec.resources.map((resource, rIdx) => (
                    <div key={rIdx} className="pill" style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      cursor: 'pointer'
                    }}>
                      <span style={{marginRight: 4}}>
                        {resource.type === 'video' ? '🎥' :
                         resource.type === 'guide' ? '📖' :
                         resource.type === 'course' ? '🎓' :
                         resource.type === 'webinar' ? '🎤' : '📄'}
                      </span>
                      <span>{resource.title}</span>
                      {resource.duration && (
                        <span style={{marginLeft: 4, opacity: 0.7}}>({resource.duration})</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function FarmerResources() {
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFields() {
      try {
        const res = await fetch('http://localhost:3000/api/farmer/fields', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setFields(data.fields || [])
        }
      } catch (e) {
        console.error('Failed to load fields:', e)
      } finally {
        setLoading(false)
      }
    }

    loadFields()
  }, [])

  if (loading) {
    return (
      <div>
        <h1>Resources & Learning</h1>
        <div className="muted">Loading your learning resources...</div>
      </div>
    )
  }

  return (
    <div>
      <h1>Resources & Learning</h1>
      <div className="muted" style={{marginBottom: 16}}>
        AI-powered learning recommendations tailored to your farming needs
      </div>

      {/* AI Resource Recommender */}
      <AIResourceRecommender fields={fields} />

      {/* General Resources */}
      <div className="card" style={{marginTop: 16}}>
        <div className="card-header">
          <h3>📚 General Resources</h3>
        </div>

        <div className="row" style={{gap: '16px'}}>
          <div className="col">
            <div className="card sub">
              <h4>🌱 Crop Management</h4>
              <ul style={{paddingLeft: 16, margin: 0}}>
                <li>Crop rotation strategies</li>
                <li>Planting calendars</li>
                <li>Variety selection guides</li>
                <li>Harvesting techniques</li>
              </ul>
            </div>
          </div>

          <div className="col">
            <div className="card sub">
              <h4>💰 Financial Planning</h4>
              <ul style={{paddingLeft: 16, margin: 0}}>
                <li>Budget planning tools</li>
                <li>Cost management</li>
                <li>Loan application guides</li>
                <li>Insurance options</li>
              </ul>
            </div>
          </div>

          <div className="col">
            <div className="card sub">
              <h4>🔬 Technology & Innovation</h4>
              <ul style={{paddingLeft: 16, margin: 0}}>
                <li>Sensor technology</li>
                <li>Precision agriculture</li>
                <li>Drone applications</li>
                <li>Data analytics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Community & Support */}
      <div className="card" style={{marginTop: 16}}>
        <div className="card-header">
          <h3>🤝 Community & Support</h3>
        </div>

        <div className="row">
          <div className="col">
            <div className="card sub">
              <h4>Forum Discussions</h4>
              <div className="muted small">Connect with other farmers, share experiences, and get advice from the community.</div>
              <button className="btn btn-secondary" style={{marginTop: 8}}>Join Community</button>
            </div>
          </div>

          <div className="col">
            <div className="card sub">
              <h4>Expert Consultations</h4>
              <div className="muted small">Schedule one-on-one sessions with agricultural experts and specialists.</div>
              <button className="btn btn-secondary" style={{marginTop: 8}}>Book Consultation</button>
            </div>
          </div>

          <div className="col">
            <div className="card sub">
              <h4>24/7 Support</h4>
              <div className="muted small">Get help with technical issues, account questions, and farming emergencies.</div>
              <button className="btn btn-secondary" style={{marginTop: 8}}>Contact Support</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
