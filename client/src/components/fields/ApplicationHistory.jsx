import PropTypes from 'prop-types'
import StatusChip from './StatusChip'

export default function ApplicationHistory({ applications }) {
  if (!applications || applications.length === 0) return null

  return (
    <div className="application-history" style={{marginBottom: 16}}>
      <div className="card" style={{
        backgroundColor: 'rgba(16, 24, 40, 0.6)',
        border: '1px solid rgba(31, 42, 68, 0.5)',
        color: '#e7ecf6'
      }}>
        <div className="card-header">
          <h4>Application History</h4>
          <span className="muted small">{applications.length} application(s)</span>
        </div>
        <div style={{maxHeight: 200, overflowY: 'auto'}}>
          {applications.map((app, idx) => (
            <div key={app._id} className="application-item" style={{padding: 12, borderBottom: idx < applications.length - 1 ? '1px solid #e5e7eb' : 'none'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4}}>
                <div style={{fontWeight: 'bold'}}>{app.crop} - ${app.requestedAmount}</div>
                <StatusChip status={app.status} />
              </div>
              <div className="muted small">
                Applied: {new Date(app.createdAt).toLocaleDateString()}
                {app.plantingDate && ` • Planting: ${new Date(app.plantingDate).toLocaleDateString()}`}
              </div>
              {app.lenderNotes && (
                <div className="muted small" style={{marginTop: 4, fontStyle: 'italic'}}>
                  Note: {app.lenderNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

ApplicationHistory.propTypes = {
  applications: PropTypes.array,
}
