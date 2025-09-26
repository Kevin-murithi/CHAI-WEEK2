import PropTypes from 'prop-types'

export default function ApplyFundingModal({
  fields,
  form,
  setForm,
  submitting,
  onSubmit,
  onClose,
}) {
  const selectedField = fields.find(f => f._id === form.fieldId)
  const crops = Array.isArray(selectedField?.metadata?.crops) ? selectedField.metadata.crops : []
  const hasCropOptions = crops.length > 0

  return (
    <dialog id="apply-modal" style={{
      position: 'fixed', 
      top: '50%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)', 
      padding: 0, 
      border: 'none', 
      borderRadius: '10px', 
      backgroundColor: 'transparent',
      maxHeight: '90vh', 
      maxWidth: '90vw', 
      width: 'auto',
      zIndex: 999
    }}>
      <form className="modal-card" onSubmit={onSubmit} style={{
        minWidth: 'min(500px, 90vw)', 
        maxWidth: 'min(700px, 90vw)', 
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
          <div className="modal-title">Apply for Funding</div>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        <div className="form-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 16}}>
          <div>
            <label>Field</label>
            <select value={form.fieldId || ''} onChange={e=>{
              const nextFieldId = e.target.value
              const f = fields.find(x => x._id === nextFieldId)
              const fCrops = Array.isArray(f?.metadata?.crops) ? f.metadata.crops : []
              setForm(prev=>({
                ...prev,
                fieldId: nextFieldId,
                crop: prev.crop && fCrops.includes(prev.crop) ? prev.crop : (fCrops[0] || ''),
              }))
            }} required>
              <option value="">Select a field</option>
              {fields.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label>Crop Type</label>
            {hasCropOptions ? (
              <select value={form.crop || ''} onChange={e=>setForm(prev=>({...prev, crop: e.target.value}))}>
                {crops.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            ) : (
              <input placeholder="Enter crop" value={form.crop || ''} onChange={e=>setForm(prev=>({...prev, crop: e.target.value}))} />
            )}
          </div>
        </div>
        <div className="form-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 16}}>
          <div>
            <label>Planting Date</label>
            <input type="date" value={form.plantingDate || ''} onChange={e=>setForm(prev=>({...prev, plantingDate: e.target.value}))} required />
          </div>
          <div>
            <label>Requested Amount (USD)</label>
            <input type="number" value={form.requestedAmount || ''} onChange={e=>setForm(prev=>({...prev, requestedAmount: Number(e.target.value)}))} required min="100" max="50000" />
          </div>
        </div>
        <div className="form-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 16}}>
          <div>
            <label>Funding Purpose</label>
            <select value={form.purpose || ''} onChange={e=>setForm(prev=>({...prev, purpose: e.target.value}))}>
              <option value="">Select purpose</option>
              <option value="seeds">Seeds & Planting Materials</option>
              <option value="fertilizer">Fertilizers & Nutrients</option>
              <option value="equipment">Farm Equipment</option>
              <option value="irrigation">Irrigation Systems</option>
              <option value="general">General Farm Operations</option>
            </select>
          </div>
          <div>
            <label>Expected Harvest Date</label>
            <input type="date" value={form.expectedHarvest || ''} onChange={e=>setForm(prev=>({...prev, expectedHarvest: e.target.value}))} />
          </div>
        </div>
        <div style={{marginBottom: 16}}>
          <label>Additional Notes</label>
          <textarea rows="3" placeholder="Any additional information about your funding request..." value={form.notes || ''} onChange={e=>setForm(prev=>({...prev, notes: e.target.value}))} style={{width: '100%', resize: 'vertical'}}></textarea>
        </div>
        <div className="form-actions" style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8}}>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

ApplyFundingModal.propTypes = {
  fields: PropTypes.array.isRequired,
  form: PropTypes.object.isRequired,
  setForm: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
}
