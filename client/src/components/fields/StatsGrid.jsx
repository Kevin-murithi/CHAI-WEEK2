import PropTypes from 'prop-types'

export default function StatsGrid({ fields, apps }) {
  const totalArea = fields.reduce((sum, f) => sum + (f.areaHa || 0), 0).toFixed(1)
  const pending = apps.filter(a => a.status === 'pending').length

  const itemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(31, 41, 55, 0.5)',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    borderRadius: 8,
    padding: '8px 10px',
    minHeight: 44,
  }

  const labelStyle = { color: '#94a3b8', fontSize: 12, whiteSpace: 'nowrap' }
  const valueStyle = { fontSize: 16, fontWeight: 700 }

  return (
    <div className="stats-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 16}}>
      <div style={itemStyle}>
        <span style={{...labelStyle}}>Total Fields</span>
        <span style={{...valueStyle, color: '#22c55e'}}>{fields.length}</span>
      </div>
      <div style={itemStyle}>
        <span style={{...labelStyle}}>Total Area</span>
        <span style={{...valueStyle, color: '#3b82f6'}}>{totalArea} ha</span>
      </div>
      <div style={itemStyle}>
        <span style={{...labelStyle}}>Active Applications</span>
        <span style={{...valueStyle, color: '#eab308'}}>{pending}</span>
      </div>
    </div>
  )
}

StatsGrid.propTypes = {
  fields: PropTypes.array.isRequired,
  apps: PropTypes.array.isRequired,
}
