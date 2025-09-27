// import React from 'react';
// import { useState, useEffect, useRef } from 'react';
// import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import { 
//   FireIcon, 
//   BeakerIcon, 
//   SunIcon, 
//   BoltIcon, 
//   BellIcon, 
//   MapPinIcon, 
//   ClockIcon, 
//   UserIcon, 
//   TruckIcon, 
//   ArrowDownTrayIcon, 
//   ExclamationTriangleIcon,
//   ArrowTrendingUpIcon,
//   ArrowTrendingDownIcon,
//   BuildingStorefrontIcon,
//   ChartBarIcon,
//   ShieldCheckIcon,
//   CheckIcon,
//   ArrowPathIcon,
//   ArrowLeftIcon,
//   MapIcon,
//   ChatBubbleLeftRightIcon,
//   PaperAirplaneIcon
// } from '@heroicons/react/24/solid';

// // Fix for default markers in react-leaflet
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// });

// // Custom icons with modern styling
// const createCustomIcon = (color, iconType) => {
//   const icons = {
//     driver: '🚗',
//     destination: '🏁',
//     warehouse: '🏭'
//   };
  
//   return L.divIcon({
//     html: `
//       <div style="
//         background: linear-gradient(135deg, ${color}, ${color}dd);
//         width: 48px;
//         height: 48px;
//         border-radius: 50%;
//         border: 3px solid white;
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         font-size: 20px;
//         box-shadow: 0 8px 32px rgba(0,0,0,0.3);
//         backdrop-filter: blur(10px);
//       ">
//         ${icons[iconType]}
//       </div>
//     `,
//     className: 'custom-marker',
//     iconSize: [48, 48],
//     iconAnchor: [24, 24],
//   });
// };

// const driverIcon = createCustomIcon('#3B82F6', 'driver');
// const destinationIcon = createCustomIcon('#10B981', 'destination');
// const warehouseIcon = createCustomIcon('#8B5CF6', 'warehouse');

// const PostHarvest = () => {
//   const [selectedCrop, setSelectedCrop] = useState(null);
//   const [realTimeData, setRealTimeData] = useState({
//     tomatoes: {
//       temperature: 4.2,
//       humidity: 85,
//       lightExposure: 12,
//       shock: 0.3,
//       ethylene: 2.1,
//       co2: 380,
//     },
//     maize: {
//       temperature: 18.5,
//       humidity: 14,
//       lightExposure: 0,
//       shock: 0.1,
//       moisture: 13.2,
//       co2: 420,
//     },
//     mangoes: {
//       temperature: 10.5,
//       humidity: 80,
//       lightExposure: 8,
//       shock: 0.5,
//       ethylene: 3.2,
//       co2: 390,
//     },
//     avocados: {
//       temperature: 4.0,
//       humidity: 90,
//       lightExposure: 2,
//       shock: 0.2,
//       ethylene: 1.8,
//       co2: 370,
//     }
//   });

//   const [driverPositions, setDriverPositions] = useState({
//     tomatoes: { lat: -1.2921, lng: 36.8219 },
//     mangoes: { lat: -1.5123, lng: 37.2612 }
//   });

//   const [chatMessages, setChatMessages] = useState({
//     tomatoes: [
//       { id: 1, sender: 'ai', message: 'Hello! I\'m monitoring your tomatoes. Current temperature is optimal at 4.2°C.', timestamp: new Date(Date.now() - 300000) },
//       { id: 2, sender: 'farmer', message: 'Any issues with shelf life?', timestamp: new Date(Date.now() - 240000) },
//       { id: 3, sender: 'ai', message: 'Shelf life is good - 3 days remaining. I recommend Market B for better pricing.', timestamp: new Date(Date.now() - 180000) }
//     ],
//     maize: [
//       { id: 1, sender: 'ai', message: 'Your maize is stored optimally. Moisture levels are perfect at 13.2%.', timestamp: new Date(Date.now() - 600000) }
//     ],
//     mangoes: [
//       { id: 1, sender: 'ai', message: 'Mangoes are en route to Mombasa. ETA 3h 45m. Temperature stable.', timestamp: new Date(Date.now() - 900000) }
//     ],
//     avocados: [
//       { id: 1, sender: 'ai', message: 'Avocados in cold storage. All parameters within optimal range.', timestamp: new Date(Date.now() - 1200000) }
//     ]
//   });

//   const [newMessage, setNewMessage] = useState('');
//   const chatEndRef = useRef(null);

//   const cropData = {
//     tomatoes: {
//       name: "Tomatoes",
//       emoji: "🍅",
//       status: "In Transit",
//       location: "Cold Transport Truck",
//       driver: "James Mwangi",
//       numberPlate: "KCA 123X",
//       distanceRemaining: "47.2 km",
//       timeRemaining: "1h 23m",
//       destination: "Nairobi Central Market",
//       destinationCoords: { lat: -1.2864, lng: 36.8172 },
//       shelfLife: "3 days",
//       quality: "Good",
//       notifications: 2,
//       progress: 65,
//       route: [
//         { lat: -1.2921, lng: 36.8219 },
//         { lat: -1.2900, lng: 36.8200 },
//         { lat: -1.2880, lng: 36.8180 },
//         { lat: -1.2864, lng: 36.8172 }
//       ]
//     },
//     maize: {
//       name: "Maize",
//       emoji: "🌽",
//       status: "In Storage",
//       location: "Dry Silo #3",
//       operator: "Sarah Wanjiku",
//       siloId: "SILO-003",
//       capacity: "85%",
//       timeInStorage: "12 days",
//       destination: "Export Terminal",
//       locationCoords: { lat: -1.3733, lng: 36.8473 },
//       shelfLife: "45 days",
//       quality: "Excellent",
//       notifications: 1,
//     },
//     mangoes: {
//       name: "Mangoes",
//       emoji: "🥭",
//       status: "In Transit",
//       location: "Refrigerated Container",
//       driver: "Michael Omondi",
//       numberPlate: "KDB 456Y",
//       distanceRemaining: "156.8 km",
//       timeRemaining: "3h 45m",
//       destination: "Mombasa Port",
//       destinationCoords: { lat: -4.0435, lng: 39.6682 },
//       shelfLife: "2 days",
//       quality: "Fair",
//       notifications: 1,
//       progress: 32,
//       route: [
//         { lat: -1.5123, lng: 37.2612 },
//         { lat: -1.8000, lng: 37.5000 },
//         { lat: -2.5000, lng: 38.2000 },
//         { lat: -3.0000, lng: 38.8000 },
//         { lat: -4.0435, lng: 39.6682 }
//       ]
//     },
//     avocados: {
//       name: "Avocados",
//       emoji: "🥑",
//       status: "In Storage",
//       location: "Cold Room #2",
//       operator: "Grace Akinyi",
//       siloId: "COLD-002",
//       capacity: "72%",
//       timeInStorage: "5 days",
//       destination: "European Export",
//       locationCoords: { lat: -1.2833, lng: 36.8167 },
//       shelfLife: "14 days",
//       quality: "Excellent",
//       notifications: 1,
//     }
//   };

//   // Scroll to bottom of chat
//   const scrollToBottom = () => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [chatMessages]);

//   // Simulate real-time data updates and driver movement (only when a crop is selected)
//   useEffect(() => {
//     if (!selectedCrop) return;

//     const interval = setInterval(() => {
//       setRealTimeData((prev) => {
//         const newData = { ...prev };
        
//         // Only update the selected crop to reduce unnecessary re-renders
//         if (newData[selectedCrop]) {
//           const current = newData[selectedCrop];
//           newData[selectedCrop] = {
//             ...current,
//             temperature: Math.max(3.8, Math.min(25, current.temperature + (Math.random() - 0.5) * 0.1)),
//             humidity: Math.max(10, Math.min(95, current.humidity + (Math.random() - 0.5) * 1)),
//             lightExposure: Math.max(0, Math.min(20, current.lightExposure + (Math.random() - 0.5) * 0.5)),
//             shock: Math.max(0, Math.min(1, current.shock + (Math.random() - 0.5) * 0.05)),
//             ...(selectedCrop === "maize" ? {
//               moisture: Math.max(12, Math.min(15, current.moisture + (Math.random() - 0.5) * 0.1))
//             } : {
//               ethylene: Math.max(1.5, Math.min(4, current.ethylene + (Math.random() - 0.5) * 0.05))
//             }),
//             co2: Math.max(350, Math.min(450, current.co2 + (Math.random() - 0.5) * 2))
//           };
//         }
        
//         return newData;
//       });

//       // Only update driver position if crop is in transit
//       const cropInfo = cropData[selectedCrop];
//       if (cropInfo?.status === "In Transit") {
//         setDriverPositions(prev => ({
//           ...prev,
//           [selectedCrop]: {
//             lat: prev[selectedCrop].lat - 0.00005,
//             lng: prev[selectedCrop].lng - 0.00005
//           }
//         }));
//       }
//     }, 5000); // Increased to 5 seconds to reduce frequency

//     return () => clearInterval(interval);
//   }, [selectedCrop]);

//   const generatePDF = (crop) => {
//     const data = cropData[crop];
//     const sensors = realTimeData[crop];
//     const cropChat = chatMessages[crop];

//     const pdfContent = `
// POST-HARVEST MONITORING REPORT
// ==============================

// Crop: ${data.name}
// Status: ${data.status}
// Location: ${data.location}
// Generated: ${new Date().toLocaleString()}

// CURRENT CONDITIONS:
// - Temperature: ${sensors.temperature}°C
// - Humidity: ${sensors.humidity}%
// - Light Exposure: ${sensors.lightExposure} lux
// - Shock Level: ${sensors.shock}g
// ${crop === "maize" ? `- Moisture: ${sensors.moisture}%` : `- Ethylene: ${sensors.ethylene} ppm`}
// - CO2: ${sensors.co2} ppm

// LOGISTICS:
// ${
//   crop === "tomatoes" || crop === "mangoes"
//     ? `- Driver: ${data.driver}
// - Vehicle: ${data.numberPlate}
// - Distance Remaining: ${data.distanceRemaining}
// - ETA: ${data.timeRemaining}
// - Progress: ${data.progress}%`
//     : `- Operator: ${data.operator}
// - ${crop === "maize" ? "Silo" : "Cold Room"} ID: ${data.siloId}
// - Capacity: ${data.capacity}
// - Storage Duration: ${data.timeInStorage}`
// }

// AI CONVERSATION:
// ${cropChat.map((msg) => `[${msg.sender.toUpperCase()}] ${msg.message}`).join("\n")}

// QUALITY ASSESSMENT: ${data.quality}
// SHELF LIFE: ${data.shelfLife}
//     `;

//     const blob = new Blob([pdfContent], { type: "text/plain" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `${data.name}_Report_${new Date().toISOString().split("T")[0]}.txt`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const sendMessage = (crop) => {
//     if (!newMessage.trim()) return;

//     const newUserMessage = {
//       id: Date.now(),
//       sender: 'farmer',
//       message: newMessage,
//       timestamp: new Date()
//     };

//     setChatMessages(prev => ({
//       ...prev,
//       [crop]: [...prev[crop], newUserMessage]
//     }));

//     setNewMessage('');

//     // Simulate AI response after 1 second
//     setTimeout(() => {
//       const aiResponses = [
//         "I'm analyzing your query regarding the storage conditions...",
//         "Based on current sensor data, your crops are maintaining optimal conditions.",
//         "I recommend checking the temperature settings for better preservation.",
//         "The quality metrics show excellent results for this batch.",
//         "Would you like me to provide more detailed analysis?"
//       ];

//       const aiMessage = {
//         id: Date.now() + 1,
//         sender: 'ai',
//         message: aiResponses[Math.floor(Math.random() * aiResponses.length)],
//         timestamp: new Date()
//       };

//       setChatMessages(prev => ({
//         ...prev,
//         [crop]: [...prev[crop], aiMessage]
//       }));
//     }, 1000);
//   };

//   const StatCard = React.memo(({ icon: IconComponent, label, value, unit, color = "text-blue-400", bgColor = "bg-blue-500/20" }) => (
//     <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:bg-slate-800/80 transition-all duration-200">
//       <div className="flex items-center justify-between mb-2">
//         <div className="flex items-center gap-2">
//           <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center`}>
//             <IconComponent className={`w-5 h-5 ${color}`} />
//           </div>
//           <span className="text-sm text-slate-300 font-medium">{label}</span>
//         </div>
//       </div>
//       <div className="text-2xl font-bold text-slate-200">
//         {value} <span className="text-base text-slate-400">{unit}</span>
//       </div>
//       <div className="mt-2 w-full bg-slate-700/60 rounded-full h-1.5">
//         <div 
//           className="h-1.5 rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-blue-600"
//           style={{ width: `${Math.min(100, (parseFloat(value) / 10) * 100)}%` }}
//         ></div>
//       </div>
//     </div>
//   ));

//   const ChatInterface = ({ crop }) => {
//     const messages = chatMessages[crop];
    
//     return (
//       <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 h-[500px] flex flex-col">
//         <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
//           <ChatBubbleLeftRightIcon className="w-5 h-5 text-emerald-400" />
//           AI Assistant
//         </h2>
        
//         <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2">
//           {messages.map((msg) => (
//             <div
//               key={msg.id}
//               className={`p-3 rounded-lg max-w-[85%] ${
//                 msg.sender === 'ai' 
//                   ? 'bg-emerald-500/10 border border-emerald-500/30 mr-auto' 
//                   : 'bg-blue-500/10 border border-blue-500/30 ml-auto'
//               }`}
//             >
//               <div className="text-slate-200 text-sm leading-relaxed">{msg.message}</div>
//               <div className="text-slate-400 text-xs mt-1 text-right">
//                 {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//               </div>
//             </div>
//           ))}
//           <div ref={chatEndRef} />
//         </div>
        
//         <div className="flex gap-2">
//           <input
//             type="text"
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             onKeyPress={(e) => e.key === 'Enter' && sendMessage(crop)}
//             placeholder="Type your message..."
//             className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//           <button
//             onClick={() => sendMessage(crop)}
//             className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-white transition-all duration-200 flex items-center justify-center"
//           >
//             <PaperAirplaneIcon className="w-4 h-4" />
//           </button>
//         </div>
//       </div>
//     );
//   };

//   const TransitMap = ({ crop }) => {
//     const cropDataItem = cropData[crop];
//     const currentPosition = driverPositions[crop];

//     return (
//       <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
//             <MapIcon className="w-5 h-5 text-blue-400" />
//             Live Transit Tracking
//           </h3>
//           <div className="flex items-center gap-2 text-slate-400 text-sm">
//             <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
//             Live updating
//           </div>
//         </div>

//         {/* Progress Bar */}
//         <div className="mb-4 p-3 bg-slate-800/60 rounded-lg">
//           <div className="flex justify-between text-sm mb-2">
//             <span className="text-slate-300">Progress</span>
//             <span className="text-blue-400 font-medium">{cropDataItem.progress}%</span>
//           </div>
//           <div className="w-full bg-slate-700 rounded-full h-2">
//             <div 
//               className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 relative"
//               style={{ width: `${cropDataItem.progress}%` }}
//             >
//               <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
//             </div>
//           </div>
//           <div className="flex justify-between text-xs text-slate-400 mt-1">
//             <span>Start</span>
//             <span>{cropDataItem.destination}</span>
//           </div>
//         </div>
        
//         <div className="h-80 rounded-lg overflow-hidden">
//           <MapContainer
//             center={currentPosition}
//             zoom={13}
//             style={{ height: '100%', width: '100%' }}
//             scrollWheelZoom={true}
//             key={`${crop}-${currentPosition.lat}`}
//           >
//             <TileLayer
//               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//             />
            
//             {/* Driver marker */}
//             <Marker position={currentPosition} icon={driverIcon}>
//               <Popup>
//                 <div className="text-center">
//                   <strong>{cropDataItem.driver}</strong><br />
//                   {cropDataItem.numberPlate}<br />
//                   <em>En route to {cropDataItem.destination}</em><br />
//                   <strong>Progress: {cropDataItem.progress}%</strong>
//                 </div>
//               </Popup>
//             </Marker>
            
//             {/* Destination marker */}
//             <Marker position={cropDataItem.destinationCoords} icon={destinationIcon}>
//               <Popup>
//                 <div className="text-center">
//                   <strong>{cropDataItem.destination}</strong><br />
//                   Final Destination
//                 </div>
//               </Popup>
//             </Marker>
            
//             {/* Route polyline */}
//             <Polyline
//               positions={cropDataItem.route}
//               color="#3B82F6"
//               weight={4}
//               opacity={0.8}
//             />
//           </MapContainer>
//         </div>
//       </div>
//     );
//   };

//   const StorageMap = ({ crop }) => {
//     const cropDataItem = cropData[crop];
    
//     return (
//       <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
//             <BuildingStorefrontIcon className="w-5 h-5 text-purple-400" />
//             Storage Location
//           </h3>
//         </div>
        
//         <div className="h-80 rounded-lg overflow-hidden">
//           <MapContainer
//             center={cropDataItem.locationCoords}
//             zoom={15}
//             style={{ height: '100%', width: '100%' }}
//             scrollWheelZoom={true}
//             key={crop}
//           >
//             <TileLayer
//               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//             />
            
//             <Marker position={cropDataItem.locationCoords} icon={warehouseIcon}>
//               <Popup>
//                 <div className="text-center">
//                   <strong>{cropDataItem.location}</strong><br />
//                   {cropDataItem.siloId}<br />
//                   <em>Operator: {cropDataItem.operator}</em><br />
//                   <strong>Capacity: {cropDataItem.capacity}</strong>
//                 </div>
//               </Popup>
//             </Marker>
//           </MapContainer>
//         </div>
        
//         <div className="mt-4 bg-slate-800/60 p-3 rounded-lg border border-slate-700">
//           <div className="flex flex-wrap items-center gap-4 text-sm">
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
//               <span className="text-slate-300">Storage Location</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const CropCard = ({ cropKey, crop }) => {
//     const cropNotifications = chatMessages[cropKey].filter(msg => msg.sender === 'ai').length;
    
//     return (
//       <div
//         onClick={() => setSelectedCrop(cropKey)}
//         className="group cursor-pointer transform hover:scale-[1.02] transition-all duration-300"
//       >
//         <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 hover:bg-slate-800/80 transition-all duration-300 h-full">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center gap-3">
//               <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
//                 <span className="text-2xl">{crop.emoji}</span>
//               </div>
//               <div>
//                 <h3 className="text-xl font-bold text-slate-200">{crop.name}</h3>
//                 <p className="text-slate-400 text-sm">{crop.status}</p>
//               </div>
//             </div>
//             <div className="relative">
//               {cropNotifications > 0 && (
//                 <>
//                   <BellIcon className="w-5 h-5 text-amber-400" />
//                   <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
//                     <span className="text-xs text-white font-bold">{cropNotifications}</span>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>

//           <div className="space-y-3 mb-4">
//             <div className="flex justify-between items-center">
//               <span className="text-slate-400 text-sm">Location</span>
//               <span className="text-slate-200 font-medium text-sm">{crop.location}</span>
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-slate-400 text-sm">Quality</span>
//               <span className={`font-semibold text-sm ${
//                 crop.quality === "Excellent" ? "text-emerald-400" :
//                 crop.quality === "Good" ? "text-blue-400" :
//                 "text-amber-400"
//               }`}>
//                 {crop.quality}
//               </span>
//             </div>
//             <div className="flex justify-between items-center">
//               <span className="text-slate-400 text-sm">Shelf Life</span>
//               <span className="text-slate-200 font-semibold text-sm">{crop.shelfLife}</span>
//             </div>
//             {crop.progress && (
//               <div className="flex justify-between items-center">
//                 <span className="text-slate-400 text-sm">Progress</span>
//                 <span className="text-blue-400 font-semibold text-sm">{crop.progress}%</span>
//               </div>
//             )}
//           </div>

//           <div className="flex items-center justify-between pt-4 border-t border-slate-700">
//             <span className="text-slate-500 text-xs">Click to view details</span>
//             <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   if (selectedCrop) {
//     const crop = cropData[selectedCrop];
//     const sensors = realTimeData[selectedCrop];
//     const isInTransit = crop.status === "In Transit";

//     return (
//       <div className="min-h-screen bg-slate-950 p-6 overflow-y-auto">
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <div className="flex items-center justify-between mb-8">
//             <div className="flex items-center gap-4">
//               <button
//                 onClick={() => setSelectedCrop(null)}
//                 className="group rounded-xl border border-slate-700/60 bg-slate-800/60 hover:bg-slate-800 px-4 py-3 text-slate-200 transition-all duration-200 flex items-center gap-2"
//               >
//                 <ArrowLeftIcon className="w-4 h-4" />
//                 Back to Dashboard
//               </button>
//               <div className="flex items-center gap-4">
//                 <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
//                   <span className="text-3xl">{crop.emoji}</span>
//                 </div>
//                 <div>
//                   <h1 className="text-3xl font-bold text-slate-200">{crop.name} Monitoring</h1>
//                   <p className="text-slate-400">
//                     {crop.status} • {crop.location}
//                   </p>
//                 </div>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => generatePDF(selectedCrop)}
//                 className="group rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/15 px-6 py-3 text-blue-200 flex items-center gap-2 transition-all duration-200 hover:scale-[1.02]"
//               >
//                 <ArrowDownTrayIcon className="w-4 h-4" />
//                 Download Report
//               </button>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* Main Content */}
//             <div className="lg:col-span-2 space-y-6">
//               {/* Logistics Info */}
//               <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
//                 <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
//                   {isInTransit ? <TruckIcon className="w-5 h-5 text-blue-400" /> : <BuildingStorefrontIcon className="w-5 h-5 text-purple-400" />}
//                   Logistics Information
//                 </h2>
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   {isInTransit ? (
//                     <>
//                       <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/60">
//                         <UserIcon className="w-5 h-5 text-slate-400" />
//                         <div>
//                           <p className="text-sm text-slate-400">Driver</p>
//                           <p className="text-slate-200 font-medium">{crop.driver}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/60">
//                         <TruckIcon className="w-5 h-5 text-slate-400" />
//                         <div>
//                           <p className="text-sm text-slate-400">Vehicle</p>
//                           <p className="text-slate-200 font-medium">{crop.numberPlate}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/60">
//                         <MapPinIcon className="w-5 h-5 text-slate-400" />
//                         <div>
//                           <p className="text-sm text-slate-400">Distance</p>
//                           <p className="text-slate-200 font-medium">{crop.distanceRemaining}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/60">
//                         <ClockIcon className="w-5 h-5 text-slate-400" />
//                         <div>
//                           <p className="text-sm text-slate-400">ETA</p>
//                           <p className="text-slate-200 font-medium">{crop.timeRemaining}</p>
//                         </div>
//                       </div>
//                     </>
//                   ) : (
//                     <>
//                       <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/60">
//                         <UserIcon className="w-5 h-5 text-slate-400" />
//                         <div>
//                           <p className="text-sm text-slate-400">Operator</p>
//                           <p className="text-slate-200 font-medium">{crop.operator}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/60">
//                         <BuildingStorefrontIcon className="w-5 h-5 text-slate-400" />
//                         <div>
//                           <p className="text-sm text-slate-400">Storage ID</p>
//                           <p className="text-slate-200 font-medium">{crop.siloId}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/60">
//                         <ChartBarIcon className="w-5 h-5 text-slate-400" />
//                         <div>
//                           <p className="text-sm text-slate-400">Capacity</p>
//                           <p className="text-slate-200 font-medium">{crop.capacity}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/60">
//                         <ClockIcon className="w-5 h-5 text-slate-400" />
//                         <div>
//                           <p className="text-sm text-slate-400">Duration</p>
//                           <p className="text-slate-200 font-medium">{crop.timeInStorage}</p>
//                         </div>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </div>

//               {/* Real-time Statistics */}
//               <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
//                     <ArrowPathIcon className="w-5 h-5 text-emerald-400 animate-spin" />
//                     Real-time Sensor Data
//                   </h2>
//                   <div className="flex items-center gap-2 text-slate-400 text-sm">
//                     <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
//                     Live updating
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                   <StatCard
//                     icon={FireIcon}
//                     label="Temperature"
//                     value={sensors.temperature.toFixed(1)}
//                     unit="°C"
//                     color="text-red-400"
//                     bgColor="bg-red-500/20"
//                   />
//                   <StatCard
//                     icon={BeakerIcon}
//                     label="Humidity"
//                     value={sensors.humidity.toFixed(1)}
//                     unit="%"
//                     color="text-blue-400"
//                     bgColor="bg-blue-500/20"
//                   />
//                   <StatCard
//                     icon={SunIcon}
//                     label="Light Exposure"
//                     value={sensors.lightExposure.toFixed(1)}
//                     unit="lux"
//                     color="text-yellow-400"
//                     bgColor="bg-yellow-500/20"
//                   />
//                   <StatCard
//                     icon={BoltIcon}
//                     label="Shock Level"
//                     value={sensors.shock.toFixed(2)}
//                     unit="g"
//                     color="text-orange-400"
//                     bgColor="bg-orange-500/20"
//                   />
//                   {selectedCrop === "maize" ? (
//                     <StatCard
//                       icon={BeakerIcon}
//                       label="Moisture"
//                       value={sensors.moisture.toFixed(1)}
//                       unit="%"
//                       color="text-cyan-400"
//                       bgColor="bg-cyan-500/20"
//                     />
//                   ) : (
//                     <StatCard
//                       icon={BeakerIcon}
//                       label="Ethylene"
//                       value={sensors.ethylene.toFixed(1)}
//                       unit="ppm"
//                       color="text-green-400"
//                       bgColor="bg-green-500/20"
//                     />
//                   )}
//                   <StatCard
//                     icon={SunIcon}
//                     label="CO2 Level"
//                     value={sensors.co2.toFixed(0)}
//                     unit="ppm"
//                     color="text-purple-400"
//                     bgColor="bg-purple-500/20"
//                   />
//                 </div>
//               </div>

//               {/* Map */}
//               {isInTransit ? (
//                 <TransitMap crop={selectedCrop} />
//               ) : (
//                 <StorageMap crop={selectedCrop} />
//               )}
//             </div>

//             {/* Sidebar */}
//             <div className="space-y-6">
//               <ChatInterface crop={selectedCrop} />

//               {/* Quality Summary */}
//               <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
//                 <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
//                   <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
//                   Quality Summary
//                 </h3>
//                 <div className="space-y-3">
//                   <div className="flex justify-between items-center p-3 rounded-lg border border-slate-700 bg-slate-800/60">
//                     <span className="text-slate-400">Overall Quality</span>
//                     <span className={`font-semibold ${
//                       crop.quality === "Excellent" ? "text-emerald-400" :
//                       crop.quality === "Good" ? "text-blue-400" :
//                       "text-amber-400"
//                     }`}>
//                       {crop.quality}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center p-3 rounded-lg border border-slate-700 bg-slate-800/60">
//                     <span className="text-slate-400">Shelf Life</span>
//                     <span className="text-slate-200 font-semibold">{crop.shelfLife}</span>
//                   </div>
//                   <div className="flex justify-between items-center p-3 rounded-lg border border-slate-700 bg-slate-800/60">
//                     <span className="text-slate-400">Destination</span>
//                     <span className="text-slate-200 font-medium text-sm">{crop.destination}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-950 p-6 overflow-y-auto">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8 text-center">
//           <h1 className="text-4xl font-bold text-slate-200 mb-2">
//             Post-Harvest Monitoring
//           </h1>
//           <p className="text-slate-400 text-lg">AI-Powered Cold Chain Management System</p>
//         </div>

//         {/* Crop Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {Object.entries(cropData).map(([key, crop]) => (
//             <CropCard key={key} cropKey={key} crop={crop} />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

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
  PaperAirplaneIcon,
  QrCodeIcon
} from '@heroicons/react/24/solid';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons with modern styling
const createCustomIcon = (color, iconType) => {
  const icons = {
    driver: '🚗',
    destination: '🏁',
    warehouse: '🏭'
  };
  
  return L.divIcon({
    html: `
      <div style="
        background: linear-gradient(135deg, ${color}, ${color}dd);
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        backdrop-filter: blur(10px);
      ">
        ${icons[iconType]}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
};

const driverIcon = createCustomIcon('#3B82F6', 'driver');
const destinationIcon = createCustomIcon('#10B981', 'destination');
const warehouseIcon = createCustomIcon('#8B5CF6', 'warehouse');

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

  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);

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
        { lat: -1.2921, lng: 36.8219 },
        { lat: -1.2900, lng: 36.8200 },
        { lat: -1.2880, lng: 36.8180 },
        { lat: -1.2864, lng: 36.8172 }
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
        { lat: -1.5123, lng: 37.2612 },
        { lat: -1.8000, lng: 37.5000 },
        { lat: -2.5000, lng: 38.2000 },
        { lat: -3.0000, lng: 38.8000 },
        { lat: -4.0435, lng: 39.6682 }
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

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Simulate real-time data updates and driver movement (only when a crop is selected)
  useEffect(() => {
    if (!selectedCrop) return;

    const interval = setInterval(() => {
      setRealTimeData((prev) => {
        const newData = { ...prev };
        
        // Only update the selected crop to reduce unnecessary re-renders
        if (newData[selectedCrop]) {
          const current = newData[selectedCrop];
          newData[selectedCrop] = {
            ...current,
            temperature: Math.max(3.8, Math.min(25, current.temperature + (Math.random() - 0.5) * 0.1)),
            humidity: Math.max(10, Math.min(95, current.humidity + (Math.random() - 0.5) * 1)),
            lightExposure: Math.max(0, Math.min(20, current.lightExposure + (Math.random() - 0.5) * 0.5)),
            shock: Math.max(0, Math.min(1, current.shock + (Math.random() - 0.5) * 0.05)),
            ...(selectedCrop === "maize" ? {
              moisture: Math.max(12, Math.min(15, current.moisture + (Math.random() - 0.5) * 0.1))
            } : {
              ethylene: Math.max(1.5, Math.min(4, current.ethylene + (Math.random() - 0.5) * 0.05))
            }),
            co2: Math.max(350, Math.min(450, current.co2 + (Math.random() - 0.5) * 2))
          };
        }
        
        return newData;
      });

      // Only update driver position if crop is in transit
      const cropInfo = cropData[selectedCrop];
      if (cropInfo?.status === "In Transit") {
        setDriverPositions(prev => ({
          ...prev,
          [selectedCrop]: {
            lat: prev[selectedCrop].lat - 0.00005,
            lng: prev[selectedCrop].lng - 0.00005
          }
        }));
      }
    }, 5000); // Increased to 5 seconds to reduce frequency

    return () => clearInterval(interval);
  }, [selectedCrop]);

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

  const sendMessage = (crop) => {
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

    setNewMessage('');

    // Simulate AI response after 1 second
    setTimeout(() => {
      const aiResponses = [
        "I'm analyzing your query regarding the storage conditions...",
        "Based on current sensor data, your crops are maintaining optimal conditions.",
        "I recommend checking the temperature settings for better preservation.",
        "The quality metrics show excellent results for this batch.",
        "Would you like me to provide more detailed analysis?"
      ];

      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        message: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date()
      };

      setChatMessages(prev => ({
        ...prev,
        [crop]: [...prev[crop], aiMessage]
      }));
    }, 1000);
  };

  const StatCard = React.memo(({ icon: IconComponent, label, value, unit, color = "text-blue-400", bgColor = "bg-blue-500/20" }) => (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:bg-slate-800/80 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center`}>
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
  ));

  const ChatInterface = ({ crop }) => {
    const messages = chatMessages[crop];
    
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 h-[500px] flex flex-col">
        <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="w-5 h-5 text-emerald-400" />
          AI Assistant
        </h2>
        
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg max-w-[85%] ${
                msg.sender === 'ai' 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 mr-auto' 
                  : 'bg-blue-500/10 border border-blue-500/30 ml-auto'
              }`}
            >
              <div className="text-slate-200 text-sm leading-relaxed">{msg.message}</div>
              <div className="text-slate-400 text-xs mt-1 text-right">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(crop)}
            placeholder="Type your message..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => sendMessage(crop)}
            className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-white transition-all duration-200 flex items-center justify-center"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const TransitMap = ({ crop }) => {
    const cropDataItem = cropData[crop];
    const currentPosition = driverPositions[crop];

    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
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
        
        <div className="h-80 rounded-lg overflow-hidden">
          <MapContainer
            center={currentPosition}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            key={`${crop}-${currentPosition.lat}`}
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
            
            {/* Route polyline */}
            <Polyline
              positions={cropDataItem.route}
              color="#3B82F6"
              weight={4}
              opacity={0.8}
            />
          </MapContainer>
        </div>
      </div>
    );
  };

  const StorageMap = ({ crop }) => {
    const cropDataItem = cropData[crop];
    
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
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
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 hover:bg-slate-800/80 transition-all duration-300 h-full">
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

          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
            <span className="text-slate-500 text-xs">Click to view details</span>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
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
      <div className="min-h-screen bg-slate-950 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedCrop(null)}
                className="group rounded-xl border border-slate-700/60 bg-slate-800/60 hover:bg-slate-800 px-4 py-3 text-slate-200 transition-all duration-200 flex items-center gap-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
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
                className="group rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/15 px-6 py-3 text-blue-200 flex items-center gap-2 transition-all duration-200 hover:scale-[1.02]"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Download Report
              </button>
              <button
                className="group rounded-xl border border-slate-500/30 bg-slate-500/10 hover:bg-slate-500/15 px-6 py-3 text-slate-200 flex items-center gap-2 transition-all duration-200 hover:scale-[1.02]"
              >
                <QrCodeIcon className="w-4 h-4" />
                QR Code
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Logistics Info */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
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
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
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

              {/* Map */}
              {isInTransit ? (
                <TransitMap crop={selectedCrop} />
              ) : (
                <StorageMap crop={selectedCrop} />
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <ChatInterface crop={selectedCrop} />

              {/* Quality Summary */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-emerald-400" />
                  Quality Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg border border-slate-700 bg-slate-800/60">
                    <span className="text-slate-400">Overall Quality</span>
                    <span className={`font-semibold ${
                      crop.quality === "Excellent" ? "text-emerald-400" :
                      crop.quality === "Good" ? "text-blue-400" :
                      "text-amber-400"
                    }`}>
                      {crop.quality}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border border-slate-700 bg-slate-800/60">
                    <span className="text-slate-400">Shelf Life</span>
                    <span className="text-slate-200 font-semibold">{crop.shelfLife}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border border-slate-700 bg-slate-800/60">
                    <span className="text-slate-400">Destination</span>
                    <span className="text-slate-200 font-medium text-sm">{crop.destination}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-200 mb-2">
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