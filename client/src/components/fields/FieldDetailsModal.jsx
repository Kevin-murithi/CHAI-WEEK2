import PropTypes from 'prop-types'
import FieldInfoCard from './FieldInfoCard'
import AnalyticsPanel from './AnalyticsPanel'
import LatestSensors from './LatestSensors'
import ApplicationHistory from './ApplicationHistory'

export default function FieldDetailsModal({
  selectedField,
  analytics,
  applications,
  latestReadings,
  onClose,
  onRegisterSensor,
  onViewSensors,
  canApply,
  onApply,
}) {
  return (
    <dialog id="field-details-modal" style={{
      position: 'fixed', 
      top: '50%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)', 
      margin: 0, 
      padding: 0, 
      border: 'none', 
      borderRadius: 8, 
      backgroundColor: 'transparent', 
      maxHeight: '90vh', 
      maxWidth: '90vw', 
      width: 'auto',
      zIndex: 999
    }}>
      <div className="modal-card" style={{
        minWidth: 'min(600px, 90vw)', 
        maxWidth: 'min(900px, 90vw)', 
        maxHeight: '85vh', 
        overflowY: 'auto',
        backgroundColor: 'rgba(16, 24, 40, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(31, 42, 68, 0.8)',
        borderRadius: '10px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(31, 42, 68, 0.3)',
        color: '#e7ecf6'
      }}>
        <div className="modal-header">
          <div className="modal-title">{selectedField?.name || 'Field Details'}</div>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        {selectedField && (
          <div>
            <div className="field-info-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16}}>
              <FieldInfoCard field={selectedField} />
            </div>

            {analytics && (
              <AnalyticsPanel analytics={analytics} />
            )}

            {latestReadings && (
              <LatestSensors readings={latestReadings} />
            )}

            {applications && applications.length > 0 && (
              <ApplicationHistory applications={applications} />
            )}

            <div className="action-buttons" style={{display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between'}}>
              <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                <button className="btn btn-secondary" onClick={onRegisterSensor}>Register Sensor</button>
                <button className="btn btn-secondary" onClick={onViewSensors}>View Sensors</button>
              </div>
              <button
                className={`btn ${canApply ? 'btn-primary' : 'btn-secondary'}`}
                onClick={canApply ? onApply : undefined}
                disabled={!canApply}
                title={!canApply ? 'Cannot apply - you have a pending or approved application' : 'Apply for funding'}
              >
                {canApply ? 'Apply for Funding' : 'Application active'}
              </button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  )
}

FieldDetailsModal.propTypes = {
  selectedField: PropTypes.object,
  analytics: PropTypes.object,
  applications: PropTypes.array,
  latestReadings: PropTypes.array,
  onClose: PropTypes.func.isRequired,
  onRegisterSensor: PropTypes.func.isRequired,
  onViewSensors: PropTypes.func.isRequired,
  canApply: PropTypes.bool,
  onApply: PropTypes.func,
}
