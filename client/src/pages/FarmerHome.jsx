import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import GreetingHeader from '../components/home/GreetingHeader.jsx'
import FieldSnapshots from '../components/home/FieldSnapshots.jsx'
import AiPortfolioInsights from '../components/home/AiPortfolioInsights.jsx'
import { MapIcon, BanknotesIcon, CpuChipIcon, BookOpenIcon, ArrowRightIcon } from '@heroicons/react/24/solid'

// Home page focuses on summary and navigation; mapping moved to FarmerFieldsPage

export default function FarmerHome() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [fields, setFields] = useState([])
  const [apps, setApps] = useState([])
  const [aiSummary, setAiSummary] = useState(null)
  const [loadingAI, setLoadingAI] = useState(false)

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
    };
  };

  const loadAggregatedAISummary = useCallback(async (fieldsToAnalyze) => {
    if (!fieldsToAnalyze?.length) return;
    try {
      setLoadingAI(true);
      
      const analyticsPromises = fieldsToAnalyze.map(field => 
        fetch(`http://localhost:3000/api/ai/analytics/${field._id}?crop=maize`, { credentials: 'include' })
          .then(res => res.ok ? res.json() : null)
          .catch(() => null)
      );
      
      const results = await Promise.all(analyticsPromises);
      const validAnalytics = results.filter(r => r?.analytics).map(r => r.analytics);
      
      if (validAnalytics.length > 0) {
        const aggregated = aggregateAnalytics(validAnalytics, fieldsToAnalyze);
        setAiSummary(aggregated);
      }
    } catch (e) {
      console.error('Failed to load aggregated AI summary:', e);
    } finally {
      setLoadingAI(false);
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [fRes, aRes] = await Promise.all([
          fetch('http://localhost:3000/api/farmer/fields', { credentials: 'include' }),
          fetch('http://localhost:3000/api/farmer/applications', { credentials: 'include' })
        ]);
        const f = await fRes.json(); 
        const a = await aRes.json();
        setFields(f.fields || []);
        setApps(a.applications || []);
      } catch { /* ignore */ }
    }
    load();
  }, []);

  return (
    <div className="">
      {/* AI insights moved to the right column (sidebar) */}

      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <GreetingHeader user={user} aiSummary={aiSummary} />

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-200 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                className="group rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/15 text-left p-5 transition-all duration-200 hover:scale-[1.02]"
                onClick={()=>navigate('/dashboard/farmer/fields')}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-300">
                    <MapIcon className="w-6 h-6" />
                  </div>
                  <div className="text-slate-200 font-semibold">Manage Fields</div>
                  <ArrowRightIcon className="ml-auto w-4 h-4 text-blue-300 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-slate-400 text-sm">Map boundaries, register sensors, view analytics</div>
              </button>

              <button
                className="group rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/15 text-left p-5 transition-all duration-200 hover:scale-[1.02]"
                onClick={()=>navigate('/dashboard/farmer/applications')}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-300">
                    <BanknotesIcon className="w-6 h-6" />
                  </div>
                  <div className="text-slate-200 font-semibold">Financing</div>
                  <ArrowRightIcon className="ml-auto w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-slate-400 text-sm">Apply for funding, track applications</div>
              </button>

              <button
                className="group rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 text-left p-5 transition-all duration-200 hover:scale-[1.02]"
                onClick={()=>navigate('/dashboard/farmer/advisory')}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                    <CpuChipIcon className="w-6 h-6" />
                  </div>
                  <div className="text-slate-200 font-semibold">AI Advisory</div>
                  <ArrowRightIcon className="ml-auto w-4 h-4 text-emerald-300 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-slate-400 text-sm">Personalized recommendations, risk alerts</div>
              </button>

              <button
                className="group rounded-xl border border-slate-700/60 bg-slate-800/60 hover:bg-slate-800 text-left p-5 transition-all duration-200 hover:scale-[1.02]"
                onClick={()=>navigate('/dashboard/farmer/resources')}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-slate-700/60 flex items-center justify-center text-slate-300">
                    <BookOpenIcon className="w-6 h-6" />
                  </div>
                  <div className="text-slate-200 font-semibold">Resources</div>
                  <ArrowRightIcon className="ml-auto w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-slate-400 text-sm">Guides, best practices, learning materials</div>
              </button>
            </div>
          </div>

          {/* Field Snapshots */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-200">My Fields</h2>
              <button 
                onClick={() => navigate('/dashboard/farmer/fields')}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                View all →
              </button>
            </div>
            <FieldSnapshots fields={fields} onOpen={() => navigate('/dashboard/farmer/fields')} />
          </div>
        </div>

        {/* Sidebar (narrow column) */}
        <div className="space-y-6 border-[1.6px] border-gray-800 rounded-xl p-4 flex flex-col">
          {loadingAI ? (
            <AiPortfolioInsights loading={true} compact />
          ) : aiSummary ? (
            <AiPortfolioInsights aiSummary={aiSummary} onView={() => navigate('/dashboard/farmer/advisory')} compact />
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-sky-500/20 flex items-center justify-center">
                  <CpuChipIcon className="w-5 h-5 text-sky-300" />
                </div>
                <div className="text-slate-300 text-sm">
                  <div className="font-medium text-slate-200 mb-0.5">AI Analysis Available</div>
                  <div>Get personalized insights across all your fields.</div>
                </div>
              </div>
              <button className="mt-3 inline-flex items-center gap-1 rounded-md border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-sky-200 text-sm hover:bg-sky-500/15" onClick={() => loadAggregatedAISummary(fields)}>
                Load Portfolio Insights <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Application Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Approved</span>
                <span className="text-emerald-400 font-medium">{(apps||[]).filter(a=>a.status==='approved').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Pending</span>
                <span className="text-amber-400 font-medium">{(apps||[]).filter(a=>a.status==='pending').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Denied</span>
                <span className="text-rose-400 font-medium">{(apps||[]).filter(a=>a.status==='denied').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}