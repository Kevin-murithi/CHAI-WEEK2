// export default PostHarvest;
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  FireIcon, 
  BeakerIcon, 
  SunIcon, 
  BoltIcon, 
  BellIcon, 
  MapPinIcon, 
  ClockIcon, 
  UserIcon, 
  TruckIcon, 
  ArrowDownTrayIcon, 
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CheckIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  MapIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/solid';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons - simple emoji markers
const createCustomIcon = (iconType) => {
  const icons = {
    driver: '🚛',
    destination: '📍',
    warehouse: '🏭'
  };
  
  return L.divIcon({
    html: `
      <div style="
        font-size: 32px;
        line-height: 1;
        text-align: center;
      ">
        ${icons[iconType]}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const driverIcon = createCustomIcon('driver');
const destinationIcon = createCustomIcon('destination');
const warehouseIcon = createCustomIcon('warehouse');

const PostHarvest = () => {
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [realTimeData, setRealTimeData] = useState({
    tomatoes: {
      temperature: 4.2,
      humidity: 85,
      lightExposure: 12,
      shock: 0.3,
      ethylene: 2.1,
      co2: 380,
    },
    maize: {
      temperature: 18.5,
      humidity: 14,
      lightExposure: 0,
      shock: 0.1,
      moisture: 13.2,
      co2: 420,
    },
    mangoes: {
      temperature: 10.5,
      humidity: 80,
      lightExposure: 8,
      shock: 0.5,
      ethylene: 3.2,
      co2: 390,
    },
    avocados: {
      temperature: 4.0,
      humidity: 90,
      lightExposure: 2,
      shock: 0.2,
      ethylene: 1.8,
      co2: 370,
    }
  });

  const [driverPositions, setDriverPositions] = useState({
    tomatoes: { lat: -1.2921, lng: 36.8219 },
    mangoes: { lat: -1.5123, lng: 37.2612 }
  });

  const [chatMessages, setChatMessages] = useState({
    tomatoes: [
      { id: 1, sender: 'ai', message: 'Hello! I\'m monitoring your tomatoes. Current temperature is optimal at 4.2°C.', timestamp: new Date(Date.now() - 300000) },
      { id: 2, sender: 'farmer', message: 'Any issues with shelf life?', timestamp: new Date(Date.now() - 240000) },
      { id: 3, sender: 'ai', message: 'Shelf life is good - 3 days remaining. I recommend Market B for better pricing.', timestamp: new Date(Date.now() - 180000) }
    ],
    maize: [
      { id: 1, sender: 'ai', message: 'Your maize is stored optimally. Moisture levels are perfect at 13.2%.', timestamp: new Date(Date.now() - 600000) }
    ],
    mangoes: [
      { id: 1, sender: 'ai', message: 'Mangoes are en route to Mombasa. ETA 3h 45m. Temperature stable.', timestamp: new Date(Date.now() - 900000) }
    ],
    avocados: [
      { id: 1, sender: 'ai', message: 'Avocados in cold storage. All parameters within optimal range.', timestamp: new Date(Date.now() - 1200000) }
    ]
  });

  const cropData = {
    tomatoes: {
      name: "Tomatoes",
      emoji: "🍅",
      status: "In Transit",
      location: "Cold Transport Truck",
      driver: "James Mwangi",
      numberPlate: "KCA 123X",
      distanceRemaining: "47.2 km",
      timeRemaining: "1h 23m",
      destination: "Nairobi Central Market",
      destinationCoords: { lat: -1.2864, lng: 36.8172 },
      shelfLife: "3 days",
      quality: "Good",
      notifications: 2,
      progress: 65,
      route: [
        { lat: -1.2921, lng: 36.8219 },  // Start position
        { lat: -1.2915, lng: 36.8210 },
        { lat: -1.2908, lng: 36.8202 },
        { lat: -1.2900, lng: 36.8195 },
        { lat: -1.2892, lng: 36.8188 },
        { lat: -1.2885, lng: 36.8180 },
        { lat: -1.2878, lng: 36.8175 },
        { lat: -1.2870, lng: 36.8172 },
        { lat: -1.2864, lng: 36.8172 }   // Nairobi Central Market
      ]
    },
    maize: {
      name: "Maize",
      emoji: "🌽",
      status: "In Storage",
      location: "Dry Silo #3",
      operator: "Sarah Wanjiku",
      siloId: "SILO-003",
      capacity: "85%",
      timeInStorage: "12 days",
      destination: "Export Terminal",
      locationCoords: { lat: -1.3733, lng: 36.8473 },
      shelfLife: "45 days",
      quality: "Excellent",
      notifications: 1,
    },
    mangoes: {
      name: "Mangoes",
      emoji: "🥭",
      status: "In Transit",
      location: "Refrigerated Container",
      driver: "Michael Omondi",
      numberPlate: "KDB 456Y",
      distanceRemaining: "156.8 km",
      timeRemaining: "3h 45m",
      destination: "Mombasa Port",
      destinationCoords: { lat: -4.0435, lng: 39.6682 },
      shelfLife: "2 days",
      quality: "Fair",
      notifications: 1,
      progress: 32,
      route: [
        { lat: -1.5123, lng: 37.2612 },  // Start - Embu area
        { lat: -1.6500, lng: 37.4500 },
        { lat: -1.8200, lng: 37.6800 },
        { lat: -2.0500, lng: 37.9000 },
        { lat: -2.2800, lng: 38.1500 },
        { lat: -2.5200, lng: 38.4000 },
        { lat: -2.7500, lng: 38.6500 },
        { lat: -3.0000, lng: 38.9000 },
        { lat: -3.2200, lng: 39.1500 },
        { lat: -3.4500, lng: 39.3500 },
        { lat: -3.6800, lng: 39.5000 },
        { lat: -3.9000, lng: 39.6200 },
        { lat: -4.0435, lng: 39.6682 }   // Mombasa Port
      ]
    },
    avocados: {
      name: "Avocados",
      emoji: "🥑",
      status: "In Storage",
      location: "Cold Room #2",
      operator: "Grace Akinyi",
      siloId: "COLD-002",
      capacity: "72%",
      timeInStorage: "5 days",
      destination: "European Export",
      locationCoords: { lat: -1.2833, lng: 36.8167 },
      shelfLife: "14 days",
      quality: "Excellent",
      notifications: 1,
    }
  };


  const generatePDF = (crop) => {
    const data = cropData[crop];
    const sensors = realTimeData[crop];
    const cropChat = chatMessages[crop];

    const pdfContent = `
POST-HARVEST MONITORING REPORT
==============================

Crop: ${data.name}
Status: ${data.status}
Location: ${data.location}
Generated: ${new Date().toLocaleString()}

CURRENT CONDITIONS:
- Temperature: ${sensors.temperature}°C
- Humidity: ${sensors.humidity}%
- Light Exposure: ${sensors.lightExposure} lux
- Shock Level: ${sensors.shock}g
${crop === "maize" ? `- Moisture: ${sensors.moisture}%` : `- Ethylene: ${sensors.ethylene} ppm`}
- CO2: ${sensors.co2} ppm

LOGISTICS:
${
  crop === "tomatoes" || crop === "mangoes"
    ? `- Driver: ${data.driver}
- Vehicle: ${data.numberPlate}
- Distance Remaining: ${data.distanceRemaining}
- ETA: ${data.timeRemaining}
- Progress: ${data.progress}%`
    : `- Operator: ${data.operator}
- ${crop === "maize" ? "Silo" : "Cold Room"} ID: ${data.siloId}
- Capacity: ${data.capacity}
- Storage Duration: ${data.timeInStorage}`
}

AI CONVERSATION:
${cropChat.map((msg) => `[${msg.sender.toUpperCase()}] ${msg.message}`).join("\n")}

QUALITY ASSESSMENT: ${data.quality}
SHELF LIFE: ${data.shelfLife}
    `;

    const blob = new Blob([pdfContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.name}_Report_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };


  const StatCard = React.memo(({ icon: IconComponent, label, value, unit, color = "text-blue-400", bgColor = "bg-blue-500/20" }) => (
    <div className="group rounded-xl border border-slate-800/50 bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-sm p-4 hover:border-slate-700/50 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <IconComponent className={`w-5 h-5 ${color}`} />
            </div>
            <span className="text-sm text-slate-300 font-medium">{label}</span>
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-200">
          {value} <span className="text-base text-slate-400">{unit}</span>
        </div>
        <div className="mt-2 w-full bg-slate-700/60 rounded-full h-1.5">
          <div 
            className="h-1.5 rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-blue-600"
            style={{ width: `${Math.min(100, (parseFloat(value) / 10) * 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  ));

  const ChatInterface = React.memo(({ crop }) => {
    const messages = chatMessages[crop];
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesContainerRef = useRef(null);
    
    // Auto-scroll to bottom when messages change
    useEffect(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, [messages, isTyping]);
    
    const sendMessage = async () => {
      if (!newMessage.trim()) return;

      const newUserMessage = {
        id: Date.now(),
        sender: 'farmer',
        message: newMessage,
        timestamp: new Date()
      };

      setChatMessages(prev => ({
        ...prev,
        [crop]: [...prev[crop], newUserMessage]
      }));

      const userQuery = newMessage;
      setNewMessage('');

      // Get crop-specific data
      const cropInfo = cropData[crop];
      const sensorData = realTimeData[crop];

      // Show typing indicator
      setIsTyping(true);
      console.log('Typing indicator set to true');

      try {
        // Call backend API for AI response
        const response = await fetch('http://localhost:3000/api/chatbot/post-harvest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userQuery,
            cropData: {
              cropInfo,
              realTimeData: sensorData
            },
            sensorData: {
              moisture: crop === "maize" ? sensorData.moisture : null,
              ethylene: crop !== "maize" ? sensorData.ethylene : null
            }
          })
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to get AI response');
        }

        const aiMessage = {
          id: Date.now() + 1,
          sender: 'ai',
          message: data.response,
          timestamp: new Date()
        };

        setChatMessages(prev => ({
          ...prev,
          [crop]: [...prev[crop], aiMessage]
        }));
        console.log('Response received, typing indicator set to false');
        setIsTyping(false);
      } catch (error) {
        console.error('Error calling chatbot API:', error);
        console.error('Error details:', error.message);
        const errorMessage = {
          id: Date.now() + 1,
          sender: 'ai',
          message: `Error: ${error.message || 'Unable to connect to AI service. Please try again.'}`,
          timestamp: new Date()
        };

        setChatMessages(prev => ({
          ...prev,
          [crop]: [...prev[crop], errorMessage]
        }));
        console.log('Error occurred, typing indicator set to false');
        setIsTyping(false);
      }
    };
    
    return (
      <div className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-xl p-4 h-full min-h-[320px] flex flex-col shadow-xl">
        <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="w-5 h-5 text-emerald-400" />
          AI Assistant
        </h2>
        
        <div 
          ref={messagesContainerRef} 
          className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2 hide-scrollbar" 
          style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 rounded-2xl max-w-[85%] backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${
                msg.sender === 'ai' 
                  ? 'bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 border border-emerald-500/30 mr-auto shadow-lg shadow-emerald-500/5' 
                  : 'bg-gradient-to-br from-blue-500/15 to-blue-600/10 border border-blue-500/30 ml-auto shadow-lg shadow-blue-500/5'
              }`}
            >
              <div className="text-slate-200 text-sm leading-relaxed">{msg.message}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-1.5 h-1.5 rounded-full ${msg.sender === 'ai' ? 'bg-emerald-400' : 'bg-blue-400'}`}></div>
                <div className="text-slate-400 text-xs">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="p-4 rounded-2xl max-w-[85%] backdrop-blur-sm bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 border border-emerald-500/30 mr-auto shadow-lg shadow-emerald-500/5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
                <span className="text-slate-400 text-xs">AI is thinking...</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask AI anything..."
            className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-400 placeholder-slate-500 focus:outline-none focus:border-slate-600 focus:bg-slate-800 transition-all duration-200"
          />
          <button
            onClick={sendMessage}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 px-4 py-3 rounded-xl text-white transition-all duration-200 flex items-center justify-center hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30"
          >
            <PaperAirplaneIcon className="w-5 h-5 rotate-45" />
          </button>
        </div>
      </div>
    );
  });

  const TransitMap = ({ crop }) => {
    const cropDataItem = cropData[crop];
    const currentPosition = driverPositions[crop];
    const [actualRoute, setActualRoute] = useState([]);
    const [isLoadingRoute, setIsLoadingRoute] = useState(true);
    const [routeInfo, setRouteInfo] = useState({ distance: null, duration: null });

    // Fetch actual road route from OSRM API
    useEffect(() => {
      const fetchRoute = async () => {
        try {
          setIsLoadingRoute(true);
          const start = cropDataItem.route[0];
          const end = cropDataItem.destinationCoords;
          
          // OSRM API endpoint for routing
          const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
          
          const response = await fetch(url);
          const data = await response.json();
          
          if (data.code === 'Ok' && data.routes && data.routes[0]) {
            // Convert GeoJSON coordinates to Leaflet format [lat, lng]
            const coordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
            setActualRoute(coordinates);
            
            // Store route information
            setRouteInfo({
              distance: (data.routes[0].distance / 1000).toFixed(1), // Convert to km
              duration: Math.round(data.routes[0].duration / 60) // Convert to minutes
            });
          } else {
            // Fallback to manual route if API fails
            setActualRoute(cropDataItem.route);
          }
        } catch (error) {
          console.error('Error fetching route:', error);
          // Fallback to manual route
          setActualRoute(cropDataItem.route);
        } finally {
          setIsLoadingRoute(false);
        }
      };

      fetchRoute();
    }, [crop]);

    // Calculate completed portion of the route
    const completedRouteIndex = Math.ceil(actualRoute.length * (cropDataItem.progress / 100));
    const completedRoute = actualRoute.slice(0, completedRouteIndex);

    return (
      <div className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-blue-400" />
            Live Transit Tracking
          </h3>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            Live updating
          </div>
        </div>

        {/* Route Info */}
        {routeInfo.distance && (
          <div className="mb-3 flex gap-3 text-sm">
            <div className="flex-1 bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2">
              <div className="text-slate-400 text-xs">Total Distance</div>
              <div className="text-blue-300 font-semibold">{routeInfo.distance} km</div>
            </div>
            <div className="flex-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
              <div className="text-slate-400 text-xs">Est. Duration</div>
              <div className="text-emerald-300 font-semibold">{Math.floor(routeInfo.duration / 60)}h {routeInfo.duration % 60}m</div>
            </div>
          </div>
        )}
        
        {/* Progress Bar */}
        <div className="mb-4 p-3 bg-slate-800/60 rounded-lg">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-300">Progress</span>
            <span className="text-blue-400 font-medium">{cropDataItem.progress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 relative"
              style={{ width: `${cropDataItem.progress}%` }}
            >
              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Start</span>
            <span>{cropDataItem.destination}</span>
          </div>
        </div>
        
        <div className="h-72 sm:h-80 md:h-[500px] lg:h-[600px] xl:h-[700px] rounded-lg overflow-hidden border border-slate-700/30">
          <MapContainer
            center={currentPosition}
            zoom={crop === 'mangoes' ? 13 : 18}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            key={crop}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Driver marker */}
            <Marker position={currentPosition} icon={driverIcon}>
              <Popup>
                <div className="text-center">
                  <strong>{cropDataItem.driver}</strong><br />
                  {cropDataItem.numberPlate}<br />
                  <em>En route to {cropDataItem.destination}</em><br />
                  <strong>Progress: {cropDataItem.progress}%</strong>
                </div>
              </Popup>
            </Marker>
            
            {/* Destination marker */}
            <Marker position={cropDataItem.destinationCoords} icon={destinationIcon}>
              <Popup>
                <div className="text-center">
                  <strong>{cropDataItem.destination}</strong><br />
                  Final Destination
                </div>
              </Popup>
            </Marker>
            
            {/* Loading indicator */}
            {isLoadingRoute && (
              <div className="absolute top-4 right-4 bg-slate-800/90 px-3 py-2 rounded-lg text-slate-300 text-sm z-[1000]">
                Loading route...
              </div>
            )}
            
            {/* Full route - Road path (planned) */}
            {actualRoute.length > 0 && (
              <Polyline
                positions={actualRoute}
                pathOptions={{
                  color: '#3B82F6',
                  weight: 5,
                  opacity: 0.6,
                  dashArray: '10, 5',
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />
            )}
            
            {/* Completed route - solid green line */}
            {completedRoute.length > 0 && (
              <Polyline
                positions={completedRoute}
                pathOptions={{
                  color: '#10B981',
                  weight: 6,
                  opacity: 0.9,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />
            )}
          </MapContainer>
        </div>
        
        {/* Map Legend */}
        <div className="mt-4 bg-slate-800/60 p-3 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-slate-400">
              <span className="text-emerald-400">●</span> Using real road data from OpenStreetMap
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-blue-500 rounded-full" style={{opacity: 0.7}}></div>
              <span className="text-slate-300">Planned Route</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-emerald-500 rounded-full"></div>
              <span className="text-slate-300">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl">🚛</div>
              <span className="text-slate-300">Current Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl">📍</div>
              <span className="text-slate-300">Destination</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StorageMap = ({ crop }) => {
    const cropDataItem = cropData[crop];
    
    return (
      <div className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <BuildingStorefrontIcon className="w-5 h-5 text-purple-400" />
            Storage Location
          </h3>
        </div>
        
        <div className="h-80 rounded-lg overflow-hidden">
          <MapContainer
            center={cropDataItem.locationCoords}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            key={crop}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            <Marker position={cropDataItem.locationCoords} icon={warehouseIcon}>
              <Popup>
                <div className="text-center">
                  <strong>{cropDataItem.location}</strong><br />
                  {cropDataItem.siloId}<br />
                  <em>Operator: {cropDataItem.operator}</em><br />
                  <strong>Capacity: {cropDataItem.capacity}</strong>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
        
        <div className="mt-4 bg-slate-800/60 p-3 rounded-lg border border-slate-700">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-slate-300">Storage Location</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CropCard = ({ cropKey, crop }) => {
    const cropNotifications = chatMessages[cropKey].filter(msg => msg.sender === 'ai').length;
    
    return (
      <div
        onClick={() => setSelectedCrop(cropKey)}
        className="group cursor-pointer transform hover:scale-[1.02] transition-all duration-300"
      >
        <div className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-xl p-6 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 h-full relative overflow-hidden">
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300"></div>
          <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                <span className="text-2xl">{crop.emoji}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-200">{crop.name}</h3>
                <p className="text-slate-400 text-sm">{crop.status}</p>
              </div>
            </div>
            <div className="relative">
              {cropNotifications > 0 && (
                <>
                  <BellIcon className="w-5 h-5 text-amber-400" />
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{cropNotifications}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Location</span>
              <span className="text-slate-200 font-medium text-sm">{crop.location}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Quality</span>
              <span className={`font-semibold text-sm ${
                crop.quality === "Excellent" ? "text-emerald-400" :
                crop.quality === "Good" ? "text-blue-400" :
                "text-amber-400"
              }`}>
                {crop.quality}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Shelf Life</span>
              <span className="text-slate-200 font-semibold text-sm">{crop.shelfLife}</span>
            </div>
            {crop.progress && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Progress</span>
                <span className="text-blue-400 font-semibold text-sm">{crop.progress}%</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
            <span className="text-slate-500 text-xs group-hover:text-blue-400 transition-colors">Click to view details</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <svg className="w-4 h-4 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
          </div>
        </div>
      </div>
    );
  };

  if (selectedCrop) {
    const crop = cropData[selectedCrop];
    const sensors = realTimeData[selectedCrop];
    const isInTransit = crop.status === "In Transit";

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 overflow-y-auto relative">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedCrop(null)}
                className="group rounded-xl border border-slate-700/60 bg-gradient-to-r from-slate-800/80 to-slate-800/60 backdrop-blur-xl hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 px-4 py-3 text-slate-200 transition-all duration-200 flex items-center gap-2"
              >
                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </button>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                  <span className="text-3xl">{crop.emoji}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-200">{crop.name} Monitoring</h1>
                  <p className="text-slate-400">
                    {crop.status} • {crop.location}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => generatePDF(selectedCrop)}
                className="group rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20 backdrop-blur-xl px-6 py-3 text-blue-200 flex items-center gap-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/20"
              >
                <ArrowDownTrayIcon className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                Download Report
              </button>
            </div>
          </div>

          {/* Top Section: Logistics, Sensors, and Chat in 2 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Left Column: Logistics and Sensors stacked */}
            <div className="lg:col-span-2 space-y-6">
              {/* Logistics Info */}
              <div className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-xl p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  {isInTransit ? <TruckIcon className="w-5 h-5 text-blue-400" /> : <BuildingStorefrontIcon className="w-5 h-5 text-purple-400" />}
                  Logistics Information
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {isInTransit ? (
                    <>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/60">
                        <UserIcon className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-400">Driver</p>
                          <p className="text-slate-200 font-medium">{crop.driver}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/60">
                        <TruckIcon className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-400">Vehicle</p>
                          <p className="text-slate-200 font-medium">{crop.numberPlate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/60">
                        <MapPinIcon className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-400">Distance</p>
                          <p className="text-slate-200 font-medium">{crop.distanceRemaining}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/60">
                        <ClockIcon className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-400">ETA</p>
                          <p className="text-slate-200 font-medium">{crop.timeRemaining}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/60">
                        <UserIcon className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-400">Operator</p>
                          <p className="text-slate-200 font-medium">{crop.operator}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/60">
                        <BuildingStorefrontIcon className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-400">Storage ID</p>
                          <p className="text-slate-200 font-medium">{crop.siloId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/60">
                        <ChartBarIcon className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-400">Capacity</p>
                          <p className="text-slate-200 font-medium">{crop.capacity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/60">
                        <ClockIcon className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-sm text-slate-400">Duration</p>
                          <p className="text-slate-200 font-medium">{crop.timeInStorage}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Real-time Statistics */}
              <div className="rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                    <ArrowPathIcon className="w-5 h-5 text-emerald-400 animate-spin" />
                    Real-time Sensor Data
                  </h2>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    Live updating
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <StatCard
                    icon={FireIcon}
                    label="Temperature"
                    value={sensors.temperature.toFixed(1)}
                    unit="°C"
                    color="text-red-400"
                    bgColor="bg-red-500/20"
                  />
                  <StatCard
                    icon={BeakerIcon}
                    label="Humidity"
                    value={sensors.humidity.toFixed(1)}
                    unit="%"
                    color="text-blue-400"
                    bgColor="bg-blue-500/20"
                  />
                  <StatCard
                    icon={SunIcon}
                    label="Light Exposure"
                    value={sensors.lightExposure.toFixed(1)}
                    unit="lux"
                    color="text-yellow-400"
                    bgColor="bg-yellow-500/20"
                  />
                  <StatCard
                    icon={BoltIcon}
                    label="Shock Level"
                    value={sensors.shock.toFixed(2)}
                    unit="g"
                    color="text-orange-400"
                    bgColor="bg-orange-500/20"
                  />
                  {selectedCrop === "maize" ? (
                    <StatCard
                      icon={BeakerIcon}
                      label="Moisture"
                      value={sensors.moisture.toFixed(1)}
                      unit="%"
                      color="text-cyan-400"
                      bgColor="bg-cyan-500/20"
                    />
                  ) : (
                    <StatCard
                      icon={BeakerIcon}
                      label="Ethylene"
                      value={sensors.ethylene.toFixed(1)}
                      unit="ppm"
                      color="text-green-400"
                      bgColor="bg-green-500/20"
                    />
                  )}
                  <StatCard
                    icon={SunIcon}
                    label="CO2 Level"
                    value={sensors.co2.toFixed(0)}
                    unit="ppm"
                    color="text-purple-400"
                    bgColor="bg-purple-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: AI Assistant */}
            <div className="lg:col-span-1 flex lg:h-[70vh] min-h-[360px]">
              <div className="w-full h-full">
                <ChatInterface crop={selectedCrop} />
              </div>
            </div>
          </div>

          {/* Map Section - Full Width Below */}
          <div className="mb-6">
            {isInTransit ? (
              <TransitMap crop={selectedCrop} />
            ) : (
              <StorageMap crop={selectedCrop} />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 overflow-y-auto relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-4">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-300 font-medium">Live Monitoring Active</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-100 via-blue-100 to-slate-100 bg-clip-text text-transparent mb-3">
            Post-Harvest Monitoring
          </h1>
          <p className="text-slate-400 text-lg">AI-Powered Cold Chain Management System</p>
        </div>

        {/* Crop Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(cropData).map(([key, crop]) => (
            <CropCard key={key} cropKey={key} crop={crop} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostHarvest;