import PropTypes from 'prop-types'

export default function SensorModal({ fields, sensorForm, setSensorForm, onSubmit, onClose }) {
  return (
    <dialog id="sensor-modal" style={{
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
      <form className="modal-card" onSubmit={onSubmit} method="dialog" style={{
        minWidth: 'min(480px, 90vw)', 
        maxWidth: 'min(600px, 90vw)', 
        maxHeight: '85vh', 
        overflowY: 'auto',
        backgroundColor: 'rgba(16, 24, 40, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(31, 42, 68, 0.8)',
        borderRadius: '10px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        color: '#e7ecf6'
      }}>
        <div className="modal-header">
          <div className="modal-title">Register Sensor</div>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        <div className="form-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16}}>
          <div>
            <label>Field</label>
            <select value={sensorForm.fieldId || ''} onChange={e=>setSensorForm(prev=>({...prev, fieldId: e.target.value}))} required>
              {fields.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label>Device Name</label>
            <input value={sensorForm.name || ''} onChange={e=>setSensorForm(prev=>({...prev, name: e.target.value}))} required />
          </div>
        </div>
        <div style={{marginBottom: 16}}>
          <label>Type</label>
          <select value={sensorForm.type || 'soil'} onChange={e=>setSensorForm(prev=>({...prev, type: e.target.value}))}>
            <option value="soil">Soil</option>
            <option value="weather">Weather</option>
          </select>
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
          <button className="btn btn-primary">Register</button>
        </div>
      </form>
    </dialog>
  )
}

SensorModal.propTypes = {
  fields: PropTypes.array.isRequired,
  sensorForm: PropTypes.object.isRequired,
  setSensorForm: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}
