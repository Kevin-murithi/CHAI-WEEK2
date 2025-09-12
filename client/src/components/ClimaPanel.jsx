import { useState } from 'react'
import '../App.css'

const API_BASE = 'http://localhost:3000'

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
  return (
    <div className="gauge">
      <div className="gauge-fill" style={{ width: `${clamped}%` }} />
      <div className="gauge-text">{clamped}</div>
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
      <div className="row">
        <RiskPill label="Drought" level={risk_breakdown?.drought_risk} />
        <RiskPill label="Flood" level={risk_breakdown?.flood_risk} />
        <RiskPill label="Heat" level={risk_breakdown?.heat_stress_risk} />
      </div>
      <div className="row terms">
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
