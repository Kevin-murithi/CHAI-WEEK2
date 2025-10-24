import { useState } from 'react'
import FarmerMap from '../components/FarmerMap.jsx'
import FarmerFields from '../components/FarmerFields.jsx'

export default function FarmerFieldsPage() {
  const [fieldsCount, setFieldsCount] = useState(0)
  const [lrForm, setLrForm] = useState({ number: '', county: '', registryMapSheet: '', name: '' })
  const [preview, setPreview] = useState(null)
  const [previewMeta, setPreviewMeta] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const API_BASE_URL = window.REACT_APP_API_URL || 'http://localhost:3000'

  async function previewParcel() {
    try {
      setError('')
      setSubmitting(true)
      const res = await fetch(`${API_BASE_URL}/api/farmer/fields/resolve-lr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ number: lrForm.number, county: lrForm.county, registryMapSheet: lrForm.registryMapSheet })
      })
      if (!res.ok) throw new Error('Failed to resolve parcel')
      const data = await res.json()
      setPreview(data.preview?.geometry || null)
      setPreviewMeta(data.preview?.parcelMeta || null)
      if (!lrForm.name && data.preview?.suggestedName) {
        setLrForm(prev => ({ ...prev, name: data.preview.suggestedName }))
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function saveParcelAsField() {
    try {
      setError('')
      setSubmitting(true)
      const res = await fetch(`${API_BASE_URL}/api/farmer/fields/from-lr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ number: lrForm.number, county: lrForm.county, registryMapSheet: lrForm.registryMapSheet, name: lrForm.name })
      })
      if (!res.ok) throw new Error('Failed to create field from parcel')
      setPreview(null)
      setLrForm({ number: '', county: '', registryMapSheet: '', name: '' })
      setPreviewMeta(null)
      setReloadKey(k => k + 1)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <div className="space-y-4">
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

      <div className="rounded-xl border border-slate-800/70 bg-gradient-to-br from-slate-900/70 to-slate-900/40 p-4 sm:p-5 shadow-lg shadow-black/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="text-slate-200 font-semibold">Find by LR/Parcel Number (Kenya)</div>
          </div>
          {preview && (
            <div className="hidden sm:inline-flex items-center gap-2 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-red-500/80"></span>
              <span>Preview active</span>
            </div>
          )}
        </div>
        {error && <div className="text-rose-400 text-sm mb-2 border border-rose-500/30 bg-rose-500/10 rounded px-2 py-1">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-3">
          <input className="bg-slate-800/70 border border-slate-700/80 focus:border-blue-500/50 outline-none rounded-md px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500" placeholder="LR No. 209/12345 or Kisumu/Muhoroni/237" value={lrForm.number} onChange={e=>setLrForm(prev=>({...prev, number:e.target.value}))} />
          <input className="bg-slate-800/70 border border-slate-700/80 focus:border-blue-500/50 outline-none rounded-md px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500" placeholder="County (optional)" value={lrForm.county} onChange={e=>setLrForm(prev=>({...prev, county:e.target.value}))} />
          <input className="bg-slate-800/70 border border-slate-700/80 focus:border-blue-500/50 outline-none rounded-md px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500" placeholder="Registry Map Sheet (optional)" value={lrForm.registryMapSheet} onChange={e=>setLrForm(prev=>({...prev, registryMapSheet:e.target.value}))} />
          <input className="bg-slate-800/70 border border-slate-700/80 focus:border-blue-500/50 outline-none rounded-md px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500" placeholder="Field Name (optional)" value={lrForm.name} onChange={e=>setLrForm(prev=>({...prev, name:e.target.value}))} />
          <div className="flex gap-2">
            <button disabled={!lrForm.number || submitting} onClick={previewParcel} className={`flex-1 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm transition ${(!lrForm.number || submitting) ? 'opacity-60 cursor-not-allowed' : 'hover:translate-y-[-1px]'} border border-blue-500/40 bg-blue-600/20 text-blue-100 hover:bg-blue-600/30`}>
              {submitting ? 'Previewing…' : 'Preview'}
            </button>
            <button disabled={!lrForm.number || submitting} onClick={saveParcelAsField} className={`flex-1 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm transition ${(!lrForm.number || submitting) ? 'opacity-60 cursor-not-allowed' : 'hover:translate-y-[-1px]'} border border-emerald-500/40 bg-emerald-600/20 text-emerald-100 hover:bg-emerald-600/30`}>
              {submitting ? 'Saving…' : 'Save Field'}
            </button>
          </div>
        </div>
      </div>

      <div id="fields-map">
        <FarmerMap onFieldsChanged={(f)=> setFieldsCount((f||[]).length)} previewGeometry={preview} previewMeta={previewMeta} reloadKey={reloadKey} />
      </div>

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

      <FarmerFields showMap={false} />
    </div>
  )
}
