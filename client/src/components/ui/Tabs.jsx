import PropTypes from 'prop-types'

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-1 py-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`whitespace-nowrap inline-flex items-center gap-2 rounded-xl text-sm font-medium transition-all duration-150 px-3 py-1.5 focus:outline-none ring-1 ${(t.key === active) ? 'bg-blue-600/20 text-blue-100 ring-blue-400/40 shadow-md shadow-blue-900/30' : 'bg-slate-800/50 text-slate-300 ring-white/5 hover:bg-slate-800/70 hover:text-slate-100 hover:ring-white/10'}`}
          >
            {t.icon && <span>{t.icon}</span>}
            <span>{t.label}</span>
            {typeof t.count === 'number' && (
              <span className={`text-xs rounded-full px-2 py-0.5 ${(t.key === active) ? 'bg-blue-500/40 text-blue-100' : 'bg-slate-700/70 text-slate-300'}`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({ key: PropTypes.string.isRequired, label: PropTypes.string.isRequired, icon: PropTypes.node, count: PropTypes.number })).isRequired,
  active: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}
