import PropTypes from 'prop-types'

export default function LatestSensors({ readings }) {
  if (!readings) return null
  return (
    <div className="card" style={{
      marginBottom: 16,
      backgroundColor: 'rgba(16, 24, 40, 0.6)',
      border: '1px solid rgba(31, 42, 68, 0.5)',
      color: '#e7ecf6'
    }}>
      <div className="card-header"><h4>Latest Sensors</h4></div>
      {!readings.length && <div className="muted small">No readings yet.</div>}
      {readings.map((r, idx) => (
        <div key={idx} className="row" style={{justifyContent:'space-between'}}>
          <div className="muted small">{r.device?.name} • {r.device?.type}</div>
          <div className="muted small">{new Date(r.capturedAt).toLocaleString()}</div>
          <div className="row">
            {Object.entries(r.metrics||{}).map(([k,v]) => (
              <div key={k} className="pill low"><span className="pill-label">{k}</span><span className="pill-level">{String(v)}</span></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

LatestSensors.propTypes = {
  readings: PropTypes.array,
}
