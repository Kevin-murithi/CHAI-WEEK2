import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
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
        setFields(data.fields || []);
        onFieldsChanged?.(data.fields || []);
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

  const handleCreated = useCallback(async (e) => {
    try {
      const layer = e.layer;
      const geo = layer.toGeoJSON();
      const name = window.prompt('Name this field (e.g., North Maize Field):');
      
      if (!name) return;
      
      const body = { 
        name, 
        geometry: geo.geometry 
      };
      
      const response = await fetch(`${API_BASE_URL}/api/farmer/fields`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create field');
      }
      
      await loadFields();
    } catch (err) {
      setError(err.message || 'An error occurred while creating the field');
    }
  }, [loadFields]);

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
    <div className="card map-card">
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
      
      <div className="map-container">
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
          {fields.map((field) => (
            <GeoJSON 
              key={field._id}
              data={field.geometry}
              style={{
                color: scoreToColor(field.latestClimaScore),
                weight: 2,
                fillOpacity: 0.2,
              }}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
