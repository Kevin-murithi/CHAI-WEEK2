import { useMemo, useState } from 'react'
import '../App.css'

const API_BASE = 'http://localhost:3000'

// Charts
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import { Doughnut, Radar, Line } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, CategoryScale, LinearScale)

function SourceBadge({ source }) {
  const label = source === 'nasa-power' || source === 'nasa' ? 'NASA POWER' : source === 'open-meteo' ? 'Open-Meteo' : (source||'').toUpperCase()
  return <span className="badge">{label}</span>
}

function RiskPill({ label, level }) {
  return (
    <div className={`pill ${level}`}>
      <span className="pill-label">{label}</span>
      <span className="pill-level">{level}</span>
    </div>
  )
}

function Gauge({ value }) {
  const clamped = Math.max(0, Math.min(100, Number(value)||0))
  const data = useMemo(() => ({
    labels: ['Score','Remaining'],
    datasets: [{
      data: [clamped, 100 - clamped],
      backgroundColor: ['#22c55e', '#1f2a44'],
      borderWidth: 0,
      cutout: '70%'
    }]
  }), [clamped])
  const options = useMemo(() => ({
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    rotation: -90,
    circumference: 180,
    responsive: true,
    maintainAspectRatio: false
  }), [])
  return (
    <div style={{ position:'relative', height: 160 }}>
      <Doughnut data={data} options={options} />
      <div className="gauge-text" style={{top: 60, position:'absolute', left:0, right:0, textAlign:'center', fontSize:24, fontWeight:700}}>{clamped}</div>
    </div>
  )
}

function RiskRadar({ breakdown }) {
  if (!breakdown) return null
  const map = { low: 20, medium: 60, high: 90 }
  const drought = map[breakdown.drought_risk] ?? 50
  const flood = map[breakdown.flood_risk] ?? 50
  const heat = map[breakdown.heat_stress_risk] ?? 50
  const data = {
    labels: ['Drought','Flood','Heat'],
    datasets: [{
      label: 'Risk Level',
      data: [drought, flood, heat],
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: '#3b82f6',
      pointBackgroundColor: '#93c5fd'
    }]
  }
  const options = { plugins: { legend: { display: false } }, scales: { r: { beginAtZero: true, max: 100, grid: { color: '#223154' }, angleLines: { color: '#223154' } } } }
  return <div style={{height: 260}}><Radar data={data} options={options} /></div>
}

function Timeline({ debug }) {
  // Expect optional debug.timeseries = { dates: [], precip: [], tmax: [] }
  const ts = debug?.timeseries
  if (!ts || !Array.isArray(ts.dates) || !ts.dates.length) return null
  const data = {
    labels: ts.dates,
    datasets: [
      { label: 'Precip (mm)', data: ts.precip || [], borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.2)', yAxisID: 'y' },
      { label: 'Tmax (°C)', data: ts.tmax || [], borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.2)', yAxisID: 'y1' }
    ]
  }
  const options = { responsive: true, interaction: { mode: 'index', intersect: false }, stacked: false, plugins: { legend: { labels: { color: '#cfe1ff' } } }, scales: { x: { ticks: { color: '#93a4c7' }, grid: { color: '#223154' } }, y: { position: 'left', ticks: { color: '#93a4c7' }, grid: { color: '#223154' } }, y1: { position: 'right', ticks: { color: '#93a4c7' }, grid: { drawOnChartArea: false } } } }
  return <div style={{height: 240}}><Line data={data} options={options} /></div>
}

function Sensors({ sensors }) {
  if (!sensors || typeof sensors !== 'object') return null
  const entries = Object.entries(sensors)
  if (!entries.length) return null
  return (
    <div className="card sub">
      <div className="card-header"><h4>IoT Sensor Readings</h4></div>
      <div className="row">
        {entries.map(([k,v]) => (
          <div key={k} className="col" style={{minWidth:160}}>
            <div className="muted small">{k}</div>
            <div style={{fontWeight:600}}>{String(v)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SingleResult({ data }) {
  if (!data) return null
  const { climascore, risk_breakdown, recommended_loan_terms, data_sources_used, debug } = data
  return (
    <div className="card">
      <div className="card-header">
        <h3>ClimaScore</h3>
        {(data_sources_used||[]).map(s => <SourceBadge key={s} source={s} />)}
      </div>
      <Gauge value={climascore} />
      <div className="row" style={{marginTop: 8}}>
        <RiskPill label="Drought" level={risk_breakdown?.drought_risk} />
        <RiskPill label="Flood" level={risk_breakdown?.flood_risk} />
        <RiskPill label="Heat" level={risk_breakdown?.heat_stress_risk} />
      </div>
      <div className="card sub" style={{marginTop: 8}}>
        <div className="card-header"><h4>Risk Breakdown</h4></div>
        <RiskRadar breakdown={risk_breakdown} />
      </div>
      <div className="card sub" style={{marginTop: 8}}>
        <div className="card-header"><h4>Historical & Forecast Timeline</h4></div>
        <Timeline debug={debug} />
        {!debug?.timeseries && <div className="muted small">Timeline data unavailable for this source.</div>}
      </div>
      <div className="row terms" style={{marginTop: 8}}>
        <div>
          <div className="muted">Amount</div>
          <div>${recommended_loan_terms?.amount}</div>
        </div>
        <div>
          <div className="muted">Interest</div>
          <div>{recommended_loan_terms?.interest_rate}%</div>
        </div>
        <div>
          <div className="muted">Confidence</div>
          <div>{recommended_loan_terms?.confidence}</div>
        </div>
      </div>
      <Sensors sensors={debug?.sensors} />
      <details className="debug">
        <summary>Debug</summary>
        <pre>{JSON.stringify(debug, null, 2)}</pre>
      </details>
    </div>
  )
}

function CompareResults({ data }) {
  if (!data) return null
  const { sources = [], suggested_sources = [], rationale, period, cache_hit } = data
  return (
    <div className="card">
      <div className="card-header">
        <h3>Compare Sources</h3>
        {cache_hit && <span className="badge">Cache</span>}
      </div>
      <div className="muted" style={{marginBottom: 8}}>Period: {period?.start} to {period?.end}</div>
      {rationale && <div className="muted" style={{marginBottom: 8}}>Suggested pair: {suggested_sources.join(' + ')} — {rationale}</div>}
      <div className="grid">
        {sources.map((s, idx) => (
          <div key={idx} className={`card sub ${suggested_sources.includes(s.source) ? 'highlight' : ''}`}>
            <div className="card-header">
              <SourceBadge source={s.source} />
            </div>
            {s.error ? (
              <div className="error">{s.error}</div>
            ) : (
              <>
                <Gauge value={s.climascore} />
                <div className="row">
                  <RiskPill label="Drought" level={s.risk_breakdown?.drought_risk} />
                  <RiskPill label="Flood" level={s.risk_breakdown?.flood_risk} />
                  <RiskPill label="Heat" level={s.risk_breakdown?.heat_stress_risk} />
                </div>
                <div className="row terms">
                  <div>
                    <div className="muted">Amount</div>
                    <div>${s.recommended_loan_terms?.amount}</div>
                  </div>
                  <div>
                    <div className="muted">Interest</div>
                    <div>{s.recommended_loan_terms?.interest_rate}%</div>
                  </div>
                  <div>
                    <div className="muted">Confidence</div>
                    <div>{s.recommended_loan_terms?.confidence}</div>
                  </div>
                </div>
                <details className="debug">
                  <summary>Debug</summary>
                  <pre>{JSON.stringify(s.debug, null, 2)}</pre>
                </details>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ClimaPanel({ defaultCompare=false }) {
  const [lat, setLat] = useState('')
  const [lon, setLon] = useState('')
  const [crop, setCrop] = useState('maize')
  const [plantingDate, setPlantingDate] = useState('2025-03-15')
  const [compare, setCompare] = useState(defaultCompare)
  const [source, setSource] = useState('nasa')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [single, setSingle] = useState(null)
  const [comparison, setComparison] = useState(null)

  const presets = [
    { name: 'Nkubu', lat: '-0.0646591', lon: '37.667929' },
    { name: 'Eldoret', lat: '0.5200', lon: '35.2698' },
    { name: 'Demo 3', lat: '-1.107664', lon: '36.652616' },
  ]

  async function onSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true); setSingle(null); setComparison(null)
    try {
      const params = new URLSearchParams()
      params.set('lat', lat)
      params.set('lon', lon)
      params.set('crop', crop)
      if (plantingDate) params.set('planting_date', plantingDate)
      if (compare) {
        params.set('compare', 'true')
      } else if (source && source !== 'default') {
        params.set('source', source)
      }
      const url = `${API_BASE}/climascore?${params.toString()}`
      const resp = await fetch(url, { credentials: 'include' })
      if (!resp.ok) throw new Error(`Request failed: ${resp.status}`)
      const data = await resp.json()
      if (compare || data.compare) setComparison(data)
      else setSingle(data)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form className="card form" onSubmit={onSubmit}>
        <div className="row">
          <div className="col">
            <label>Latitude</label>
            <input value={lat} onChange={e=>setLat(e.target.value)} placeholder="e.g. -0.0646591" required />
          </div>
          <div className="col">
            <label>Longitude</label>
            <input value={lon} onChange={e=>setLon(e.target.value)} placeholder="e.g. 37.667929" required />
          </div>
          <div className="col">
            <label>Crop</label>
            <select value={crop} onChange={e=>setCrop(e.target.value)}>
              <option value="maize">Maize</option>
              <option value="wheat">Wheat</option>
              <option value="sorghum">Sorghum</option>
            </select>
          </div>
          <div className="col">
            <label>Planting date</label>
            <input type="date" value={plantingDate} onChange={e=>setPlantingDate(e.target.value)} />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <label>Mode</label>
            <div className="row">
              <label className="inline"><input type="checkbox" checked={compare} onChange={e=>setCompare(e.target.checked)} /> Compare sources</label>
            </div>
          </div>
          {!compare && (
            <div className="col">
              <label>Source</label>
              <select value={source} onChange={e=>setSource(e.target.value)}>
                <option value="nasa">NASA POWER (default)</option>
                <option value="open-meteo">Open-Meteo</option>
                <option value="era5">ERA5</option>
                <option value="default">Auto</option>
              </select>
            </div>
          )}
          <div className="col end">
            <button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Get ClimaScore'}</button>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="muted small">Presets:</div>
            {presets.map(p => (
              <button type="button" key={p.name} className="link" onClick={()=>{setLat(p.lat); setLon(p.lon)}}>{p.name}</button>
            ))}
          </div>
        </div>
      </form>

      {error && <div className="error card">{error}</div>}

      {!compare && single && <SingleResult data={single} />}
      {compare && comparison && <CompareResults data={comparison} />}
    </div>
  )
}
