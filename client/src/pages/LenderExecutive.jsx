import LenderConsole from '../components/LenderConsole.jsx'

export default function LenderExecutive() {
  return (
    <div>
      <h1>Executive Overview</h1>
      <div className="muted">High-level portfolio health (MVP shows queue summary below).</div>
      <LenderConsole />
    </div>
  )
}
