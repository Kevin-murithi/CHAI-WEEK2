import PropTypes from 'prop-types'

function scoreToColor(score) {
  if (score == null) return '#64748b' // slate for unknown
  if (score >= 67) return '#22c55e' // green
  if (score >= 34) return '#eab308' // yellow
  return '#ef4444' // red
}

export default function FieldInfoCard({ field }) {
  if (!field) return null
  return (
    <div className="card">
      <div className="card-header"><h4>Field Information</h4></div>
      <div><strong>Name:</strong> {field.name}</div>
      <div><strong>Area:</strong> {field.areaHa?.toFixed?.(2)} ha</div>
      <div><strong>ClimaScore:</strong>
        <span style={{color: scoreToColor(field.latestClimaScore), fontWeight: 'bold', marginLeft: 4}}>
          {field.latestClimaScore || 'Not calculated'}
        </span>
      </div>
    </div>
  )
}

FieldInfoCard.propTypes = {
  field: PropTypes.object,
}
