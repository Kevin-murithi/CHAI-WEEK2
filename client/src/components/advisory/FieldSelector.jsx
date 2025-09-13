import PropTypes from 'prop-types'
import Card from '../ui/Card.jsx'

export default function FieldSelector({ fields, selectedField, onSelect }) {
  if (!fields?.length) return null
  return (
    <Card title="Field Analytics" className="mb-4">
      <div className="grid grid-cols-1 gap-3 max-w-lg">
        <label className="text-slate-300 text-sm">Select Field for Detailed Analytics</label>
        <select
          value={selectedField}
          onChange={e => onSelect(e.target.value)}
          className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition"
        >
          <option value="">Choose a field...</option>
          {fields.map(f => (
            <option key={f._id} value={f._id}>
              {f.name} ({typeof f.areaHa === 'number' ? f.areaHa.toFixed(1) : f.areaHa} ha)
            </option>
          ))}
        </select>
      </div>
    </Card>
  )
}

FieldSelector.propTypes = {
  fields: PropTypes.array,
  selectedField: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
}
