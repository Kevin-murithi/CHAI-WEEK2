import { useState } from 'react'
import Tabs from '../components/ui/Tabs.jsx'
import Card from '../components/ui/Card.jsx'

export default function LenderApplication() {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'financials', label: 'Financials' },
    { key: 'collateral', label: 'Collateral' },
    { key: 'risk', label: 'Risk' },
    { key: 'notes', label: 'Notes' },
  ]

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Application Detail & Underwriting</h1>
        <p className="text-slate-400 text-sm">Compact, tabbed workspace for lenders. Tailwind-only UI.</p>
      </div>

      <Card className="overflow-hidden">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

        <div className="mt-4">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <div className="text-slate-400 text-[11px] uppercase tracking-wide">Farmer</div>
                <div className="text-slate-200 text-sm font-medium">Name Placeholder</div>
                <div className="text-slate-400 text-xs mt-1">Region • Program</div>
              </section>
              <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <div className="text-slate-400 text-[11px] uppercase tracking-wide">Requested Amount</div>
                <div className="text-green-400 font-semibold text-sm">$—</div>
                <div className="text-slate-400 text-xs mt-1">Tenor • Rate • Purpose</div>
              </section>
              <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <div className="text-slate-400 text-[11px] uppercase tracking-wide">ClimaScore</div>
                <div className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-700/60 text-slate-200 mt-1">N/A</div>
              </section>
            </div>
          )}

          {activeTab === 'financials' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <section className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <div className="text-slate-200 font-medium mb-2">Cashflows</div>
                <div className="text-slate-400 text-sm">Cashflow table/graph placeholder.</div>
              </section>
              <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <div className="text-slate-200 font-medium mb-2">Ratios</div>
                <ul className="text-slate-300 text-sm space-y-1">
                  <li className="flex justify-between"><span>DSCR</span><span>—</span></li>
                  <li className="flex justify-between"><span>LTV</span><span>—</span></li>
                  <li className="flex justify-between"><span>Gross Margin</span><span>—</span></li>
                </ul>
              </section>
            </div>
          )}

          {activeTab === 'collateral' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <div className="text-slate-200 font-medium mb-2">Assets</div>
                <div className="text-slate-400 text-sm">List of pledged assets placeholder.</div>
              </section>
              <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <div className="text-slate-200 font-medium mb-2">Insurance</div>
                <div className="text-slate-400 text-sm">Insurance details placeholder.</div>
              </section>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <section className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <div className="text-slate-200 font-medium mb-2">Risk Assessment</div>
                <div className="text-slate-400 text-sm">Qualitative/quantitative risk summary placeholder.</div>
              </section>
              <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <div className="text-slate-200 font-medium mb-2">Flags</div>
                <ul className="text-slate-300 text-sm space-y-1">
                  <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-yellow-400"></span><span>Missing doc</span></li>
                  <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400"></span><span>Good history</span></li>
                </ul>
              </section>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <div className="text-slate-200 font-medium mb-2">Lender Notes</div>
                <textarea className="w-full rounded-md bg-slate-950/40 border border-slate-800 text-slate-200 text-sm p-2 outline-none focus:ring-2 focus:ring-blue-500/40" rows="6" placeholder="Type your notes here..." />
                <div className="mt-2 flex justify-end">
                  <button className="inline-flex items-center rounded-md bg-blue-600/90 hover:bg-blue-600 text-white text-sm px-3 py-1.5">Save</button>
                </div>
              </section>
              <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <div className="text-slate-200 font-medium mb-2">Decision</div>
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center rounded-md border border-emerald-500/40 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-100 text-sm px-3 py-1.5">Approve</button>
                  <button className="inline-flex items-center rounded-md border border-rose-500/40 bg-rose-600/20 hover:bg-rose-600/30 text-rose-100 text-sm px-3 py-1.5">Decline</button>
                  <button className="inline-flex items-center rounded-md border border-amber-500/40 bg-amber-600/20 hover:bg-amber-600/30 text-amber-100 text-sm px-3 py-1.5">Request Info</button>
                </div>
              </section>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
