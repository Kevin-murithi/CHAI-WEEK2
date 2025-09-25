import React from 'react'

function StatCard({ title, value, subtitle, trend }) {
  const up = (trend?.delta || 0) >= 0
  return (
    <div className="card kpi">
      <div className="kpi-meta">
        <div className="kpi-label">{title}</div>
        <div className="kpi-icon">{up ? '↗' : '↘'}</div>
      </div>
      <div className="kpi-value mt-1">{value}</div>
      {subtitle && <div className="text-slate-400 text-xs mt-1">{subtitle}</div>}
      {trend && (
        <div className={`kpi-trend mt-2 ${up ? 'trend-up' : 'trend-down'}`}>
          {up ? '▲' : '▼'} {Math.abs(trend.delta)}% vs last week
        </div>
      )}
    </div>
  )
}

function UtilizationCell({ value }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div>
      <div className="progress" aria-label={`Utilization ${pct}%`}>
        <div className="progress-bar" style={{ width: pct + '%' }} />
      </div>
      <div className="text-xs text-slate-400 mt-1">{pct}%</div>
    </div>
  )
}

function StatusBadge({ status }) {
  const cls = status === 'optimal' ? 'badge-success' : status === 'attention' ? 'badge-warning' : 'badge-danger'
  const dot = status === 'optimal' ? 'status-ok' : status === 'attention' ? 'status-warn' : 'status-bad'
  return (
    <span className={`badge ${cls}`}>
      <span className={`status-dot ${dot}`} />{status}
    </span>
  )
}

function FacilityRow({ facility }) {
  return (
    <tr>
      <td>
        <div className="text-slate-200 font-medium">{facility.name}</div>
        <div className="text-slate-400 text-xs">{facility.location}</div>
      </td>
      <td>{facility.capacityTons.toLocaleString()} t</td>
      <td><UtilizationCell value={facility.utilization} /></td>
      <td>{facility.avgTemp.toFixed(1)}°C</td>
      <td>{facility.avgHumidity}%</td>
      <td><StatusBadge status={facility.status} /></td>
    </tr>
  )
}

export default function ColdStorageDashboard() {
  // Sample data (static for now)
  const summary = {
    facilities: 4,
    totalCapacity: 9200, // tons
    currentStock: 6120, // tons
    avgUtilization: 66.5,
    alertsOpen: 3
  }

  const facilities = [
    { id: 'cs-001', name: 'North Hub A', location: 'Nakuru, Kenya', capacityTons: 3000, utilization: 72, avgTemp: 3.4, avgHumidity: 85, status: 'optimal' },
    { id: 'cs-002', name: 'Valley Store', location: 'Eldoret, Kenya', capacityTons: 1800, utilization: 54, avgTemp: 4.1, avgHumidity: 82, status: 'attention' },
    { id: 'cs-003', name: 'Delta Chambers', location: 'Kisumu, Kenya', capacityTons: 2200, utilization: 69, avgTemp: 2.8, avgHumidity: 88, status: 'optimal' },
    { id: 'cs-004', name: 'Coast Fresh', location: 'Mombasa, Kenya', capacityTons: 1200, utilization: 56, avgTemp: 5.2, avgHumidity: 80, status: 'issue' },
  ]

  const conditions = [
    { metric: 'Avg Temperature', value: '3.9°C', target: '2–5°C', status: 'Within range' },
    { metric: 'Avg Humidity', value: '84%', target: '80–90%', status: 'Within range' },
    { metric: 'Power Uptime (7d)', value: '99.2%', target: '>= 99%', status: 'OK' },
    { metric: 'Door Open Events (24h)', value: '18', target: '<= 24', status: 'OK' },
  ]

  const stockPct = Math.round((summary.currentStock / summary.totalCapacity) * 100)

  return (
    <div className="space-y-4">
      <div className="section-title">
        <div className="title">Cold Storage Overview</div>
        <div className="section-sub">Last updated just now</div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard title="Facilities" value={summary.facilities} subtitle="Active sites" trend={{ delta: 0 }} />
        <StatCard title="Total Capacity" value={`${summary.totalCapacity.toLocaleString()} t`} subtitle="All locations" trend={{ delta: 2.1 }} />
        <StatCard title="Current Stock" value={`${summary.currentStock.toLocaleString()} t`} subtitle={`${stockPct}% of capacity`} trend={{ delta: -1.4 }} />
        <StatCard title="Avg Utilization" value={`${summary.avgUtilization}%`} subtitle="Last 7 days" trend={{ delta: 0.8 }} />
        <StatCard title="Open Alerts" value={summary.alertsOpen} subtitle="Temperature/Humidity" trend={{ delta: -25.0 }} />
      </div>

      {/* Facilities table */}
      <div className="card">
        <div className="section-title">
          <div className="title">Facilities</div>
          <div className="section-sub">Capacity, utilization and conditions</div>
        </div>
        <div className="table-responsive">
          <table className="table-compact">
            <thead>
              <tr>
                <th>Facility</th>
                <th>Capacity</th>
                <th>Utilization</th>
                <th>Avg Temp</th>
                <th>Avg Humidity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {facilities.map(f => <FacilityRow key={f.id} facility={f} />)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conditions snapshot */}
      <div className="card">
        <div className="section-title">
          <div className="title">Conditions Snapshot</div>
          <div className="section-sub">Environment ranges vs targets</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {conditions.map((c, idx) => (
            <div key={idx} className="p-2 rounded border border-slate-800 bg-slate-900/40">
              <div className="text-slate-400 text-xs">{c.metric}</div>
              <div className="text-slate-100 text-lg font-semibold">{c.value}</div>
              <div className="text-slate-400 text-xs">Target: {c.target}</div>
              <div className="mt-1 text-xs text-green-400">{c.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="text-slate-400 text-xs">
        Data shown is sample/demo content. Wire to real sensors and inventory data in a future iteration.
      </div>
    </div>
  )
}
