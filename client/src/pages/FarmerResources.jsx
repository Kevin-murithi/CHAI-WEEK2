import { useState, useEffect } from 'react'

function AIResourceRecommender({ fields, onResourceClick }) {
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
      <div style={{backgroundColor: 'transparent', padding: '16px'}}>
        <div style={{marginBottom: '16px'}}>
          <h3 style={{marginBottom: '8px', color: '#1f2937'}}>Smart Learning Paths</h3>
        </div>
        <div className="muted">Analyzing your fields to recommend personalized learning resources...</div>
      </div>
    )
  }

  return (
    <div style={{backgroundColor: 'transparent', padding: '16px'}}>
      <div style={{marginBottom: '16px'}}>
        <h3 style={{marginBottom: '8px', color: '#fff'}}>Smart Learning Paths</h3>
        <div className="muted" style={{fontSize: '14px'}}>
          Personalized learning paths based on your field conditions and farming needs
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="muted">Add fields and sensor data to get personalized learning recommendations.</div>
      ) : (
        <div className="row" style={{gap: 12, flexWrap: 'wrap'}}>
          {recommendations.map((rec, idx) => (
            <div key={idx} className="col" style={{minWidth: 300, maxWidth: 380, flex: '1 1 calc(33.333% - 12px)'}}>
              <div className="card" style={{
                height: '100%',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: 'white'
              }}>
                <div className="card-header" style={{backgroundColor: 'transparent', borderBottom: '1px solid #334155'}}>
                  <div className="row" style={{justifyContent: 'space-between', alignItems: 'center'}}>
                    <h4 style={{margin: 0, color: 'white', fontSize: '15px'}}>{rec.title}</h4>
                    <span className="badge" style={{
                      backgroundColor: rec.priority === 'high' ? '#dc2626' : '#d97706',
                      color: 'white',
                      fontSize: '10px'
                    }}>
                      {rec.priority}
                    </span>
                  </div>
                </div>
                <div style={{padding: 12, flex: 1}}>
                  <div style={{marginBottom: 6}}>
                    <div className="muted small" style={{color: '#94a3b8'}}>Category</div>
                    <div style={{color: '#e2e8f0', fontSize: '13px'}}>{rec.category}</div>
                  </div>
                  <div style={{marginBottom: 8}}>
                    <div className="muted small" style={{color: '#94a3b8'}}>Description</div>
                    <div style={{fontSize: '12px', lineHeight: '1.3', color: '#cbd5e1'}}>{rec.description}</div>
                  </div>
                  <div style={{marginBottom: 10}}>
                    <div className="muted small" style={{color: '#94a3b8'}}>Why recommended</div>
                    <div style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#94a3b8',
                      display: 'inline-block'
                    }}>{rec.reason}</div>
                  </div>
                  <div>
                    <div className="muted small" style={{marginBottom: 6, color: '#94a3b8'}}>Resources ({rec.resources.length})</div>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px'}}>
                      {rec.resources.slice(0, 3).map((resource, rIdx) => (
                        <span 
                          key={rIdx}
                          className="badge"
                          style={{
                            backgroundColor: resource.type === 'course' ? '#1e40af' : resource.type === 'video' ? '#d97706' : '#7c3aed',
                            color: 'white',
                            fontSize: '9px',
                            padding: '2px 5px',
                            cursor: 'pointer'
                          }}
                          onClick={() => onResourceClick && onResourceClick({
                            ...resource,
                            description: `Learn ${resource.title.toLowerCase()} with this comprehensive ${resource.type}. ${resource.duration ? `Duration: ${resource.duration}` : ''}`
                          })}
                        >
                          {resource.type}
                        </span>
                      ))}
                      {rec.resources.length > 3 && (
                        <span className="badge" style={{backgroundColor: '#475569', color: '#94a3b8', fontSize: '9px', padding: '2px 5px'}}>+{rec.resources.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-footer" style={{backgroundColor: 'transparent', borderTop: '1px solid #334155', padding: '8px 12px'}}>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      if (rec.resources.length > 0) {
                        onResourceClick && onResourceClick({
                          ...rec.resources[0],
                          description: `Learn ${rec.resources[0].title.toLowerCase()} with this comprehensive ${rec.resources[0].type}. ${rec.resources[0].duration ? `Duration: ${rec.resources[0].duration}` : ''}`
                        })
                      }
                    }}
                    style={{width: '100%', padding: '6px 12px', fontSize: '12px'}}
                  >
                    Start Learning
                  </button>
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
  const [activeTab, setActiveTab] = useState('recommendations')
  const [selectedResource, setSelectedResource] = useState(null)
  const [showResourceModal, setShowResourceModal] = useState(false)

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

  const openResourceModal = (resource) => {
    setSelectedResource(resource)
    setShowResourceModal(true)
  }

  const closeResourceModal = () => {
    setShowResourceModal(false)
    setSelectedResource(null)
  }

  const generalResources = [
    {
      category: 'Crop Management',
      description: 'Essential techniques for successful crop cultivation and management',
      resources: [
        { title: 'Crop Rotation Strategies', type: 'guide', description: 'Learn effective crop rotation patterns to maintain soil health and maximize yields.' },
        { title: 'Planting Calendar Guide', type: 'guide', description: 'Seasonal planting schedules optimized for your region and climate.' },
        { title: 'Variety Selection Guide', type: 'guide', description: 'Choose the best crop varieties for your soil and climate conditions.' },
        { title: 'Harvesting Techniques', type: 'video', description: 'Best practices for timing and methods of crop harvesting.' }
      ]
    },
    {
      category: 'Financial Planning',
      description: 'Tools and strategies for managing farm finances and securing funding',
      resources: [
        { title: 'Farm Budget Planning', type: 'course', description: 'Comprehensive course on creating and managing farm budgets effectively.' },
        { title: 'Cost Management Strategies', type: 'guide', description: 'Reduce operational costs while maintaining productivity and quality.' },
        { title: 'Loan Application Guide', type: 'guide', description: 'Step-by-step guide to preparing successful loan applications.' },
        { title: 'Agricultural Insurance Options', type: 'guide', description: 'Understanding different insurance products to protect your farm.' }
      ]
    },
    {
      category: 'Technology & Innovation',
      description: 'Modern farming technologies and digital tools for enhanced productivity',
      resources: [
        { title: 'IoT Sensor Technology', type: 'course', description: 'Learn how to implement and use IoT sensors for precision farming.' },
        { title: 'Precision Agriculture Basics', type: 'video', description: 'Introduction to GPS-guided farming and variable rate applications.' },
        { title: 'Drone Applications in Agriculture', type: 'webinar', description: 'Using drones for crop monitoring, spraying, and field mapping.' },
        { title: 'Farm Data Analytics', type: 'course', description: 'Turn your farm data into actionable insights for better decisions.' }
      ]
    }
  ]

  return (
    <div>
      <h1>Resources & Learning</h1>
      <div className="muted" style={{marginBottom: 24}}>
        AI-powered learning recommendations and comprehensive farming resources
      </div>

      {/* Toggle Buttons */}
      <div style={{
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'flex-start'
      }}>
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '6px',
          padding: '2px',
          border: '1px solid #e2e8f0',
          display: 'inline-flex',
          gap: '2px'
        }}>
          <button 
            className={`btn`}
            onClick={() => setActiveTab('recommendations')}
            style={{
              margin: 0,
              borderRadius: '4px',
              border: 'none',
              padding: '6px 12px',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              backgroundColor: activeTab === 'recommendations' ? '#3b82f6' : 'transparent',
              color: activeTab === 'recommendations' ? 'white' : '#64748b',
              boxShadow: activeTab === 'recommendations' ? '0 1px 3px rgba(59, 130, 246, 0.3)' : 'none',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'recommendations') {
                e.target.style.backgroundColor = '#e2e8f0'
                e.target.style.color = '#1e293b'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'recommendations') {
                e.target.style.backgroundColor = 'transparent'
                e.target.style.color = '#64748b'
              }
            }}
          >
            Smart Learning Paths
          </button>
          <button 
            className={`btn`}
            onClick={() => setActiveTab('resources')}
            style={{
              margin: 0,
              borderRadius: '4px',
              border: 'none',
              padding: '6px 12px',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              backgroundColor: activeTab === 'resources' ? '#3b82f6' : 'transparent',
              color: activeTab === 'resources' ? 'white' : '#64748b',
              boxShadow: activeTab === 'resources' ? '0 1px 3px rgba(59, 130, 246, 0.3)' : 'none',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'resources') {
                e.target.style.backgroundColor = '#e2e8f0'
                e.target.style.color = '#1e293b'
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'resources') {
                e.target.style.backgroundColor = 'transparent'
                e.target.style.color = '#64748b'
              }
            }}
          >
            General Resources
          </button>
        </div>
      </div>

      {/* AI Recommendations Container */}
      {activeTab === 'recommendations' && (
        <div>
          <AIResourceRecommender fields={fields} onResourceClick={openResourceModal} />
        </div>
      )}

      {/* General Resources Container */}
      {activeTab === 'resources' && (
        <div>
          <div className="row" style={{gap: 12, flexWrap: 'wrap'}}>
            {generalResources.map((category, idx) => 
              category.resources.map((resource, rIdx) => (
                <div key={`${idx}-${rIdx}`} className="col" style={{flex: '1 1 calc(33.333% - 12px)', minWidth: 0}}>
                  <div className="card" style={{height: '100%'}}>
                    <div className="card-header">
                      <div className="row" style={{justifyContent: 'space-between', alignItems: 'center'}}>
                        <h4 style={{margin: 0, fontSize: '14px', lineHeight: '1.2'}}>{resource.title}</h4>
                        <span className="badge" style={{
                          backgroundColor: resource.type === 'course' ? '#dbeafe' : resource.type === 'video' ? '#fef3c7' : '#f3e8ff',
                          color: resource.type === 'course' ? '#1e40af' : resource.type === 'video' ? '#92400e' : '#7c3aed',
                          fontSize: '9px',
                          padding: '2px 5px'
                        }}>
                          {resource.type}
                        </span>
                      </div>
                    </div>
                    <div style={{padding: 12, flex: 1}}>
                      <div style={{marginBottom: 6}}>
                        <div className="muted small">Category</div>
                        <div style={{fontSize: '12px'}}>{category.category}</div>
                      </div>
                      <div style={{marginBottom: 8}}>
                        <div className="muted small">Description</div>
                        <div style={{fontSize: '11px', lineHeight: '1.3', color: '#4b5563'}}>{resource.description}</div>
                      </div>
                    </div>
                    <div className="card-footer" style={{padding: '8px 12px'}}>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => openResourceModal(resource)}
                        style={{width: '100%', padding: '6px 12px', fontSize: '11px'}}
                      >
                        View Resource
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Resource Detail Modal */}
      {showResourceModal && (
        <>
          <div 
            id="resource-modal-backdrop" 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 9998
            }}
            onClick={closeResourceModal}
          />
          <dialog 
            id="resource-modal" 
            open
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
              width: '90%',
              maxWidth: '600px',
              maxHeight: '80vh',
              border: 'none',
              borderRadius: '12px',
              padding: 0,
              backgroundColor: 'rgba(30, 41, 59, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <button
              onClick={closeResourceModal}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(0, 0, 0, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                zIndex: 10000
              }}
            >
              ×
            </button>
            <div style={{padding: '24px'}}>
              <div style={{marginBottom: '16px'}}>
                <span className="badge" style={{
                  backgroundColor: selectedResource?.type === 'course' ? '#1e40af' : selectedResource?.type === 'video' ? '#d97706' : '#7c3aed',
                  color: 'white',
                  fontSize: '12px',
                  padding: '6px 12px',
                  marginBottom: '12px'
                }}>
                  {selectedResource?.type}
                </span>
              </div>
              <h2 style={{marginBottom: '16px', color: 'white'}}>{selectedResource?.title}</h2>
              <p style={{marginBottom: '24px', lineHeight: '1.6', color: '#cbd5e1'}}>{selectedResource?.description}</p>
              
              <div style={{marginBottom: '24px', padding: '16px', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155'}}>
                <h4 style={{marginBottom: '12px', color: 'white'}}>What you'll learn:</h4>
                <ul style={{paddingLeft: '20px', margin: 0, color: '#94a3b8'}}>
                  <li>Practical techniques you can implement immediately</li>
                  <li>Best practices from experienced farmers</li>
                  <li>Step-by-step guidance with real examples</li>
                  <li>Tips for adapting methods to your specific conditions</li>
                </ul>
              </div>
              
              <div className="row" style={{gap: '12px', justifyContent: 'flex-end'}}>
                <button className="btn btn-secondary" onClick={closeResourceModal}>
                  Close
                </button>
                <button className="btn btn-primary">
                  Access Resource
                </button>
              </div>
            </div>
          </dialog>
        </>
      )}
    </div>
  )
}
