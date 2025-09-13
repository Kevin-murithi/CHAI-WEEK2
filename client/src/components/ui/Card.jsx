import PropTypes from 'prop-types'

export default function Card({ title, subtitle, children, className = '', headerRight }) {
  return (
    <section className={`bg-slate-900/70 border border-slate-800 rounded-xl shadow-sm shadow-slate-900/40 ${className}`}>
      {(title || subtitle || headerRight) && (
        <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-slate-800">
          <div>
            {title && <h3 className="text-slate-200 font-semibold">{title}</h3>}
            {subtitle && <div className="text-slate-400 text-sm">{subtitle}</div>}
          </div>
          {headerRight}
        </div>
      )}
      <div className="px-4 py-4">
        {children}
      </div>
    </section>
  )
}

Card.propTypes = {
  title: PropTypes.node,
  subtitle: PropTypes.node,
  headerRight: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
}
