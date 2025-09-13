import PropTypes from 'prop-types'

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-slate-800/60 px-1 py-1">
        {tabs.map(t => {
          const isActive = t.key === active
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={`whitespace-nowrap inline-flex items-center gap-2 rounded-md text-sm font-medium transition-colors duration-150 px-2.5 py-1.5 border focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${isActive ? '!bg-blue-600/20 !text-blue-100 !border-blue-500/50' : '!bg-transparent text-slate-300 !border-blue-500/30 hover:!bg-blue-500/10 hover:text-slate-100'}`}
            >
              {t.icon && <span>{t.icon}</span>}
              <span>{t.label}</span>
              {typeof t.count === 'number' && (
                <span className={`text-xs rounded-full px-2 py-0.5 ${isActive ? '!bg-blue-500/30 !text-blue-100' : 'bg-slate-700/60 text-slate-300'}`}>{t.count}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({ key: PropTypes.string.isRequired, label: PropTypes.string.isRequired, icon: PropTypes.node, count: PropTypes.number })).isRequired,
  active: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}
