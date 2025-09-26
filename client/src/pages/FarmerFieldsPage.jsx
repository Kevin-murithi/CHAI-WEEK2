import { useState } from 'react'
import FarmerMap from '../components/FarmerMap.jsx'
import FarmerFields from '../components/FarmerFields.jsx'

export default function FarmerFieldsPage() {
  const [fieldsCount, setFieldsCount] = useState(0)
  return (
    <div className="space-y-4">
      {/* Mapping intro and quick tips */}
      <div className="rounded-lg border border-slate-800/60 bg-slate-900/60 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="text-slate-200 font-semibold text-base">Map your fields</div>
            <div className="text-slate-400 text-sm">Use the polygon tool on the map to draw field boundaries. Save to create fields and unlock AI insights, sensors, and financing.</div>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-300">
            <div className="inline-flex items-center gap-1" title="High score (≥ 67)">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500"></span>
              <span className="hidden sm:inline">High</span>
            </div>
            <div className="inline-flex items-center gap-1" title="Medium (34–66)">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-500"></span>
              <span className="hidden sm:inline">Medium</span>
            </div>
            <div className="inline-flex items-center gap-1" title="Low (≤ 33)">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-rose-500"></span>
              <span className="hidden sm:inline">Low</span>
            </div>
            <div className="inline-flex items-center gap-1" title="Unknown">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-slate-500"></span>
              <span className="hidden sm:inline">Unknown</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Map with drawing tools */}
      <div id="fields-map">
        <FarmerMap onFieldsChanged={(f)=> setFieldsCount((f||[]).length)} />
      </div>

      {/* Empty state nudge */}
      {fieldsCount === 0 && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-slate-300">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <span className="font-medium text-blue-200">No fields yet.</span> Use the polygon tool on the map to draw your first field boundary.
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-md border border-blue-500/40 bg-blue-600/20 px-3 py-1.5 text-blue-100 hover:bg-blue-600/30"
              onClick={()=>{
                const el = document.getElementById('fields-map');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              Start mapping
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* Field management, details, financing etc. */}
      <FarmerFields showMap={false} />
    </div>
  )
}
