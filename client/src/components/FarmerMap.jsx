import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.js'
import 'leaflet-draw/dist/leaflet.draw.css'

function scoreToColor(score) {
  if (score == null) return '#64748b' // slate for unknown
  if (score >= 67) return '#22c55e' // green
  if (score >= 34) return '#eab308' // yellow
  return '#ef4444' // red
}

function DrawControl({ onCreated }) {
  const map = useMap()
  const controlRef = useRef(null)
  useEffect(() => {
    if (!map) return
    // Initialize draw control (polygon only)
    const drawControl = new L.Control.Draw({
      draw: {
        polygon: { allowIntersection: false, showArea: true },
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
      },
      edit: false
    })
    controlRef.current = drawControl
    map.addControl(drawControl)

    function created(e) { onCreated && onCreated(e) }
    map.on(L.Draw.Event.CREATED, created)
    return () => {
      map.off(L.Draw.Event.CREATED, created)
      if (controlRef.current) map.removeControl(controlRef.current)
    }
  }, [map, onCreated])
  return null
}

export default function FarmerMap({ onFieldsChanged }) {
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function loadFields() {
    try {
      setLoading(true)
      const resp = await fetch('http://localhost:3000/api/farmer/fields', { credentials: 'include' })
      if (!resp.ok) throw new Error('Failed to load fields')
      const data = await resp.json()
      setFields(data.fields || [])
      onFieldsChanged && onFieldsChanged(data.fields || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadFields() }, [])

  async function handleCreated(e) {
    try {
      const layer = e.layer
      const geo = layer.toGeoJSON()
      const name = window.prompt('Name this field (e.g., North Maize Field):')
      if (!name) return
      const body = { name, geometry: geo.geometry }
      const resp = await fetch('http://localhost:3000/api/farmer/fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      })
      if (!resp.ok) throw new Error('Failed to create field')
      await loadFields()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="card" style={{height: 500}}>
      <div className="card-header"><h3>Map your fields</h3></div>
      {error && <div className="error" style={{marginBottom:8}}>{error}</div>}
      <div className="map-container">
        <MapContainer center={[-0.1, 37.6]} zoom={9} style={{height: '420px', borderRadius: 8}}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
          <DrawControl onCreated={handleCreated} />
          {fields.map(f => (
            <GeoJSON key={f._id}
              data={f.geometry}
              style={{ color: scoreToColor(f.latestClimaScore), weight: 2, fillOpacity: 0.2 }}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
