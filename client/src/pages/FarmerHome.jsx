import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FarmerMap from '../components/FarmerMap.jsx'
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
      } catch { /* ignore */ }
    }
    load()
  }, [])

  const stats = useMemo(() => {
    const totalFields = fields.length
    const activeLoans = (apps||[]).filter(x => x.status === 'approved').length
    const scores = (fields||[]).map(f => f.latestClimaScore).filter(s => typeof s === 'number')
    const avgScore = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : '—'
    const advisories = 0 // placeholder until we wire advisories
    return { totalFields, activeLoans, avgScore, advisories }
  }, [fields, apps])

  return (
    <div>
      <div className="card" style={{borderLeft:'4px solid #eab308'}}>
        <strong>Weather Alert</strong>: No critical alerts at this time. Check back later.
      </div>
      <div className="row" style={{marginTop:12}}>
        <StatCard label="Total Fields" value={stats.totalFields} />
        <StatCard label="Active Loans" value={stats.activeLoans} />
        <StatCard label="Average Field Score" value={stats.avgScore} />
        <StatCard label="Advisory Notices" value={stats.advisories} />
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
