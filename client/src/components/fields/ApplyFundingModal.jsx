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
      borderRadius: '14px', 
      backgroundColor: 'transparent',
      maxHeight: '90vh', 
      maxWidth: '92vw', 
      width: 'auto',
      zIndex: 999
    }}>
      <form className="modal-card" onSubmit={onSubmit} style={{
        minWidth: 'min(560px, 92vw)', 
        maxWidth: 'min(760px, 92vw)', 
        maxHeight: '86vh', 
        overflowY: 'auto',
        backgroundColor: 'rgba(16, 24, 40, 0.92)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        border: '1px solid rgba(31, 42, 68, 0.7)',
        borderRadius: '14px',
        boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(31, 42, 68, 0.35)',
        color: '#e7ecf6'
      }}>
        <div className="modal-header" style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid rgba(31,42,68,0.6)'}}>
          <div className="modal-title" style={{display:'flex', alignItems:'center', gap:8, fontWeight:700}}>
            <span role="img" aria-label="apply">💳</span>
            Apply for Funding
          </div>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        <div style={{padding:16}}>
          {selectedField && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:16}}>
              <div style={{background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.25)', borderRadius:8, padding:'10px 12px'}}>
                <div style={{fontSize:11, opacity:0.8}}>Field</div>
                <div style={{fontWeight:700}}>{selectedField.name}</div>
              </div>
              <div style={{background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:8, padding:'10px 12px'}}>
                <div style={{fontSize:11, opacity:0.8}}>Area</div>
                <div style={{fontWeight:700}}>{(selectedField.areaHa || 0).toFixed(2)} ha</div>
              </div>
              <div style={{background:'rgba(234,179,8,0.08)', border:'1px solid rgba(234,179,8,0.25)', borderRadius:8, padding:'10px 12px'}}>
                <div style={{fontSize:11, opacity:0.8}}>ClimaScore</div>
                <div style={{fontWeight:700}}>{selectedField.latestClimaScore ?? '—'}</div>
              </div>
            </div>
          )}

          <div className="form-grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:14, marginBottom:12}}>
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

          <div className="form-grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:14, marginBottom:12}}>
            <div>
              <label>Planting Date</label>
              <input type="date" value={form.plantingDate || ''} onChange={e=>setForm(prev=>({...prev, plantingDate: e.target.value}))} required />
            </div>
            <div>
              <label>Requested Amount (USD)</label>
              <input type="number" value={form.requestedAmount || ''} onChange={e=>setForm(prev=>({...prev, requestedAmount: Number(e.target.value)}))} required min="100" max="50000" />
            </div>
          </div>

          <div className="form-grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:14, marginBottom:12}}>
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

          <div style={{marginBottom: 8}}>
            <label>Additional Notes</label>
            <textarea rows="3" placeholder="Any additional information about your funding request..." value={form.notes || ''} onChange={e=>setForm(prev=>({...prev, notes: e.target.value}))} style={{width: '100%', resize: 'vertical'}}></textarea>
          </div>
        </div>

        <div className="form-actions" style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, padding:'12px 16px', borderTop:'1px solid rgba(31,42,68,0.6)'}}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting} style={{padding:'8px 12px'}}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting} style={{padding:'8px 14px'}}>
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
