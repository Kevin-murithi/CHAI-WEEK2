import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.js';
import 'leaflet-draw/dist/leaflet.draw.css';

function scoreToColor(score) {
  if (score == null) return '#64748b' // slate for unknown
  if (score >= 67) return '#22c55e' // green
  if (score >= 34) return '#eab308' // yellow
  return '#ef4444' // red
}

function DrawControl({ onCreated }) {
  const map = useMap();
  const controlRef = useRef(null);
  
  useEffect(() => {
    if (!map) return undefined;
    
    // Initialize draw control (polygon only)
    const drawControl = new window.L.Control.Draw({
      draw: {
        polygon: { allowIntersection: false, showArea: true },
        polyline: false,
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
      },
      edit: false,
    });
    
    controlRef.current = drawControl;
    map.addControl(drawControl);

    function handleCreated(e) { 
      onCreated?.(e);
    }
    
    map.on(window.L.Draw.Event.CREATED, handleCreated);
    
    return () => {
      map.off(window.L.Draw.Event.CREATED, handleCreated);
      if (controlRef.current) {
        map.removeControl(controlRef.current);
      }
    };
  }, [map, onCreated]);
  
  return null;
}

DrawControl.propTypes = {
  onCreated: PropTypes.func,
};

const API_BASE_URL = window.REACT_APP_API_URL || 'http://localhost:3000';

FarmerMap.propTypes = {
  onFieldsChanged: PropTypes.func,
};

export default function FarmerMap({ onFieldsChanged }) {
  const [fields, setFields] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const isMounted = useRef(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingGeom, setPendingGeom] = useState(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    crops: '',
    plantingMethod: '',
    harvestingMethod: '',
    irrigation: '',
    soilType: '',
    ownership: '',
    notes: '',
  });

  const loadFields = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch(`${API_BASE_URL}/api/farmer/fields`, { 
        credentials: 'include' 
      });
      
      if (!response.ok) {
        throw new Error('Failed to load fields');
      }
      
      const data = await response.json();
      if (isMounted.current) {
        const list = data.fields || []
        setFields(list);
        onFieldsChanged?.(list);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err.message || 'An error occurred while loading fields');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [onFieldsChanged]);

  useEffect(() => {
    isMounted.current = true;
    loadFields();
    
    return () => {
      isMounted.current = false;
    };
  }, [loadFields]);

  function getFieldCenter(field) {
    try {
      const coords = field?.geometry?.coordinates?.[0] || []
      if (!coords.length) return [-0.1, 37.6]
      const lats = coords.map(c => c[1])
      const lngs = coords.map(c => c[0])
      return [
        (Math.min(...lats) + Math.max(...lats)) / 2,
        (Math.min(...lngs) + Math.max(...lngs)) / 2,
      ]
    } catch {
      return [-0.1, 37.6]
    }
  }

  const handleCreated = useCallback((e) => {
    const layer = e.layer;
    const geo = layer.toGeoJSON();
    setPendingGeom(geo.geometry);
    setCreateOpen(true);
  }, []);

  async function submitCreateField(ev) {
    ev.preventDefault();
    try {
      setError('');
      const metadata = {
        crops: createForm.crops.split(',').map(s => s.trim()).filter(Boolean),
        plantingMethod: createForm.plantingMethod,
        harvestingMethod: createForm.harvestingMethod,
        irrigation: createForm.irrigation,
        soilType: createForm.soilType,
        ownership: createForm.ownership,
        notes: createForm.notes,
      }
      const body = {
        name: createForm.name,
        geometry: pendingGeom,
        metadata,
      }
      const response = await fetch(`${API_BASE_URL}/api/farmer/fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error('Failed to create field');
      setCreateOpen(false);
      setPendingGeom(null);
      setCreateForm({ name:'', crops:'', plantingMethod:'', harvestingMethod:'', irrigation:'', soilType:'', ownership:'', notes:'' });
      await loadFields();
    } catch (err) {
      setError(err.message || 'An error occurred while creating the field');
    }
  }

  if (isLoading) {
    return (
      <div className="card map-card">
        <div className="card-header"><h3>Loading fields...</h3></div>
        <div className="map-placeholder">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="card map-card" style={{position:'relative'}}>
      <div className="card-header">
        <h3>Map your fields</h3>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
          <button 
            type="button" 
            className="retry-button" 
            onClick={loadFields}
            aria-label="Retry loading fields"
          >
            Retry
          </button>
        </div>
      )}
      
      <div className="map-container" style={{position:'relative'}}>
        <MapContainer 
          center={[-0.1, 37.6]} 
          zoom={9} 
          className="map-viewport"
        >
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
          />
          <DrawControl onCreated={handleCreated} />
          {fields.map((field) => {
            const center = getFieldCenter(field)
            return (
              <div key={field._id}>
                <GeoJSON 
                  data={field.geometry}
                  style={{
                    color: scoreToColor(field.latestClimaScore),
                    weight: 2,
                    fillOpacity: 0.2,
                  }}
                />
                <Marker position={center}>
                  <Popup>
                    <div style={{textAlign:'center'}}>
                      <div style={{fontWeight:600, marginBottom:4}}>{field.name || 'Field'}</div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => window.dispatchEvent(new CustomEvent('openFieldDetails', { detail: field._id }))}
                        style={{fontSize:'11px', padding:'4px 8px'}}
                      >
                        View Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              </div>
            )
          })}
        </MapContainer>
        {fields.length === 0 && !error && (
          <div style={{position:'absolute', inset:12, pointerEvents:'none', display:'flex', alignItems:'flex-end', justifyContent:'flex-end'}}>
            <div className="rounded-md border border-blue-500/30 bg-blue-600/20 text-blue-100 text-xs px-3 py-2 shadow-lg">
              Tip: Use the polygon tool to draw your first field, then save to create it.
            </div>
          </div>
        )}

        {/* Create Field Modal */}
        {createOpen && (
          <>
            <div 
              style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)', zIndex: 2000}}
              onClick={()=>setCreateOpen(false)}
            />
            <dialog open style={{position:'fixed', top:'50%', left:'50%', transform:'translate(-50%, -50%)', border:'none', padding:0, background:'transparent', zIndex:2001}}>
              <form onSubmit={submitCreateField} className="modal-card" style={{minWidth:'min(560px, 90vw)', maxWidth:'min(760px, 90vw)', maxHeight:'85vh', overflowY:'auto', background:'rgba(16,24,40,0.95)', border:'1px solid rgba(31, 42, 68, 0.8)', borderRadius:10, color:'#e7ecf6'}}>
                <div className="modal-header">
                  <div className="modal-title">Create Field</div>
                  <button type="button" className="modal-close" aria-label="Close" onClick={()=>setCreateOpen(false)}>✕</button>
                </div>
                <div className="form-grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:12}}>
                  <div>
                    <label>Name</label>
                    <input required value={createForm.name} onChange={e=>setCreateForm(prev=>({...prev, name:e.target.value}))} />
                  </div>
                  <div>
                    <label>Crops (comma-separated)</label>
                    <input placeholder="maize, beans" value={createForm.crops} onChange={e=>setCreateForm(prev=>({...prev, crops:e.target.value}))} />
                  </div>
                  <div>
                    <label>Planting Method</label>
                    <input placeholder="direct seeding / transplanting" value={createForm.plantingMethod} onChange={e=>setCreateForm(prev=>({...prev, plantingMethod:e.target.value}))} />
                  </div>
                  <div>
                    <label>Harvesting Method</label>
                    <input placeholder="mechanical / manual" value={createForm.harvestingMethod} onChange={e=>setCreateForm(prev=>({...prev, harvestingMethod:e.target.value}))} />
                  </div>
                  <div>
                    <label>Irrigation</label>
                    <input placeholder="rainfed / drip / flood" value={createForm.irrigation} onChange={e=>setCreateForm(prev=>({...prev, irrigation:e.target.value}))} />
                  </div>
                  <div>
                    <label>Soil Type</label>
                    <input placeholder="loam / clay / sandy" value={createForm.soilType} onChange={e=>setCreateForm(prev=>({...prev, soilType:e.target.value}))} />
                  </div>
                  <div>
                    <label>Ownership</label>
                    <input placeholder="owned / leased / communal" value={createForm.ownership} onChange={e=>setCreateForm(prev=>({...prev, ownership:e.target.value}))} />
                  </div>
                  <div style={{gridColumn:'1 / -1'}}>
                    <label>Notes</label>
                    <textarea rows={3} value={createForm.notes} onChange={e=>setCreateForm(prev=>({...prev, notes:e.target.value}))} />
                  </div>
                </div>
                <div className="form-actions" style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                  <button type="button" className="btn btn-secondary" onClick={()=>setCreateOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Field</button>
                </div>
              </form>
            </dialog>
          </>
        )}
      </div>
    </div>
  )
}
