// import React from 'react'

// function StatCard({ title, value, subtitle, trend }) {
//   const up = (trend?.delta || 0) >= 0
//   return (
//     <div className="card kpi">
//       <div className="kpi-meta">
//         <div className="kpi-label">{title}</div>
//         <div className="kpi-icon">{up ? '↗' : '↘'}</div>
//       </div>
//       <div className="kpi-value mt-1">{value}</div>
//       {subtitle && <div className="text-slate-400 text-xs mt-1">{subtitle}</div>}
//       {trend && (
//         <div className={`kpi-trend mt-2 ${up ? 'trend-up' : 'trend-down'}`}>
//           {up ? '▲' : '▼'} {Math.abs(trend.delta)}% vs last week
//         </div>
//       )}
//     </div>
//   )
// }

// function UtilizationCell({ value }) {
//   const pct = Math.max(0, Math.min(100, value))
//   return (
//     <div>
//       <div className="progress" aria-label={`Utilization ${pct}%`}>
//         <div className="progress-bar" style={{ width: pct + '%' }} />
//       </div>
//       <div className="text-xs text-slate-400 mt-1">{pct}%</div>
//     </div>
//   )
// }

// function StatusBadge({ status }) {
//   const cls = status === 'optimal' ? 'badge-success' : status === 'attention' ? 'badge-warning' : 'badge-danger'
//   const dot = status === 'optimal' ? 'status-ok' : status === 'attention' ? 'status-warn' : 'status-bad'
//   return (
//     <span className={`badge ${cls}`}>
//       <span className={`status-dot ${dot}`} />{status}
//     </span>
//   )
// }

// function FacilityRow({ facility }) {
//   return (
//     <tr>
//       <td>
//         <div className="text-slate-200 font-medium">{facility.name}</div>
//         <div className="text-slate-400 text-xs">{facility.location}</div>
//       </td>
//       <td>{facility.capacityTons.toLocaleString()} t</td>
//       <td><UtilizationCell value={facility.utilization} /></td>
//       <td>{facility.avgTemp.toFixed(1)}°C</td>
//       <td>{facility.avgHumidity}%</td>
//       <td><StatusBadge status={facility.status} /></td>
//     </tr>
//   )
// }

// export default function ColdStorageDashboard() {
//   // Sample data (static for now)
//   const summary = {
//     facilities: 4,
//     totalCapacity: 9200, // tons
//     currentStock: 6120, // tons
//     avgUtilization: 66.5,
//     alertsOpen: 3
//   }

//   const facilities = [
//     { id: 'cs-001', name: 'North Hub A', location: 'Nakuru, Kenya', capacityTons: 3000, utilization: 72, avgTemp: 3.4, avgHumidity: 85, status: 'optimal' },
//     { id: 'cs-002', name: 'Valley Store', location: 'Eldoret, Kenya', capacityTons: 1800, utilization: 54, avgTemp: 4.1, avgHumidity: 82, status: 'attention' },
//     { id: 'cs-003', name: 'Delta Chambers', location: 'Kisumu, Kenya', capacityTons: 2200, utilization: 69, avgTemp: 2.8, avgHumidity: 88, status: 'optimal' },
//     { id: 'cs-004', name: 'Coast Fresh', location: 'Mombasa, Kenya', capacityTons: 1200, utilization: 56, avgTemp: 5.2, avgHumidity: 80, status: 'issue' },
//   ]

//   const conditions = [
//     { metric: 'Avg Temperature', value: '3.9°C', target: '2–5°C', status: 'Within range' },
//     { metric: 'Avg Humidity', value: '84%', target: '80–90%', status: 'Within range' },
//     { metric: 'Power Uptime (7d)', value: '99.2%', target: '>= 99%', status: 'OK' },
//     { metric: 'Door Open Events (24h)', value: '18', target: '<= 24', status: 'OK' },
//   ]

//   const stockPct = Math.round((summary.currentStock / summary.totalCapacity) * 100)

//   return (
//     <div className="space-y-4">
//       <div className="section-title">
//         <div className="title">Cold Storage Overview</div>
//         <div className="section-sub">Last updated just now</div>
//       </div>

//       {/* Top stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
//         <StatCard title="Facilities" value={summary.facilities} subtitle="Active sites" trend={{ delta: 0 }} />
//         <StatCard title="Total Capacity" value={`${summary.totalCapacity.toLocaleString()} t`} subtitle="All locations" trend={{ delta: 2.1 }} />
//         <StatCard title="Current Stock" value={`${summary.currentStock.toLocaleString()} t`} subtitle={`${stockPct}% of capacity`} trend={{ delta: -1.4 }} />
//         <StatCard title="Avg Utilization" value={`${summary.avgUtilization}%`} subtitle="Last 7 days" trend={{ delta: 0.8 }} />
//         <StatCard title="Open Alerts" value={summary.alertsOpen} subtitle="Temperature/Humidity" trend={{ delta: -25.0 }} />
//       </div>

//       {/* Facilities table */}
//       <div className="card">
//         <div className="section-title">
//           <div className="title">Facilities</div>
//           <div className="section-sub">Capacity, utilization and conditions</div>
//         </div>
//         <div className="table-responsive">
//           <table className="table-compact">
//             <thead>
//               <tr>
//                 <th>Facility</th>
//                 <th>Capacity</th>
//                 <th>Utilization</th>
//                 <th>Avg Temp</th>
//                 <th>Avg Humidity</th>
//                 <th>Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {facilities.map(f => <FacilityRow key={f.id} facility={f} />)}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Conditions snapshot */}
//       <div className="card">
//         <div className="section-title">
//           <div className="title">Conditions Snapshot</div>
//           <div className="section-sub">Environment ranges vs targets</div>
//         </div>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
//           {conditions.map((c, idx) => (
//             <div key={idx} className="p-2 rounded border border-slate-800 bg-slate-900/40">
//               <div className="text-slate-400 text-xs">{c.metric}</div>
//               <div className="text-slate-100 text-lg font-semibold">{c.value}</div>
//               <div className="text-slate-400 text-xs">Target: {c.target}</div>
//               <div className="mt-1 text-xs text-green-400">{c.status}</div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Notes */}
//       <div className="text-slate-400 text-xs">
//         Data shown is sample/demo content. Wire to real sensors and inventory data in a future iteration.
//       </div>
//     </div>
//   )
// }


import React, { useState, useEffect, useRef } from 'react';
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
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  HomeIcon,
  CubeIcon,
  SignalIcon
} from '@heroicons/react/24/solid';

function StatCard({ title, value, subtitle, trend, icon: IconComponent, color = "text-blue-400", bgColor = "bg-blue-500/20" }) {
  const up = (trend?.delta || 0) >= 0;
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:bg-slate-800/80 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center`}>
            <IconComponent className={`w-5 h-5 ${color}`} />
          </div>
          <span className="text-sm text-slate-300 font-medium">{title}</span>
        </div>
        <div className={`text-xs px-2 py-1 rounded-full ${up ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          {up ? '↗' : '↘'}
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-200 mb-1">{value}</div>
      {subtitle && <div className="text-slate-400 text-xs">{subtitle}</div>}
      {trend && (
        <div className={`text-xs mt-2 flex items-center gap-1 ${up ? 'text-emerald-400' : 'text-red-400'}`}>
          {up ? '▲' : '▼'} {Math.abs(trend.delta)}% vs last week
        </div>
      )}
    </div>
  );
}

function UtilizationCell({ value }) {
  const pct = Math.max(0, Math.min(100, value));
  const getColor = () => {
    if (pct >= 80) return 'from-red-500 to-red-600';
    if (pct >= 60) return 'from-amber-500 to-amber-600';
    return 'from-emerald-500 to-emerald-600';
  };

  return (
    <div>
      <div className="w-full bg-slate-700/60 rounded-full h-2 mb-1">
        <div 
          className={`h-2 rounded-full transition-all duration-500 bg-gradient-to-r ${getColor()}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-xs text-slate-400">{pct}%</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    optimal: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
    attention: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-400' },
    issue: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-400' }
  };
  
  const { bg, text, border, dot } = config[status] || config.issue;
  
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${bg} ${text} ${border} text-xs font-medium`}>
      <div className={`w-2 h-2 rounded-full ${dot} animate-pulse`} />
      {status}
    </span>
  );
}

function FarmerStorageCard({ farmer, onClick }) {
  const totalCrops = farmer.crops.length;
  const totalWeight = farmer.crops.reduce((sum, crop) => sum + crop.weight, 0);
  
  return (
    <div
      onClick={() => onClick(farmer)}
      className="group cursor-pointer transform hover:scale-[1.02] transition-all duration-300"
    >
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 hover:bg-slate-800/80 transition-all duration-300 h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
              <UserIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-200">{farmer.name}</h3>
              <p className="text-slate-400 text-sm">{farmer.location}</p>
            </div>
          </div>
          <StatusBadge status={farmer.status} />
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Storage Unit</span>
            <span className="text-slate-200 font-medium text-sm">{farmer.storageUnit}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Crops Stored</span>
            <span className="text-slate-200 font-semibold text-sm">{totalCrops} types</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Total Weight</span>
            <span className="text-slate-200 font-semibold text-sm">{totalWeight.toLocaleString()} kg</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Storage Duration</span>
            <span className="text-slate-200 font-semibold text-sm">{farmer.storageDuration}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-slate-400 text-sm mb-2">Crop Distribution</div>
          <div className="flex flex-wrap gap-2">
            {farmer.crops.slice(0, 3).map((crop, idx) => (
              <span key={idx} className="text-xs bg-slate-800/60 text-slate-300 px-2 py-1 rounded-full flex items-center gap-1">
                <span>{crop.type}</span>
                <span className="text-slate-500">{crop.weight}kg</span>
              </span>
            ))}
            {farmer.crops.length > 3 && (
              <span className="text-xs bg-slate-800/60 text-slate-400 px-2 py-1 rounded-full">
                +{farmer.crops.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <span className="text-slate-500 text-xs">Click to view details</span>
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

function ChatInterface({ farmer }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', message: `Welcome! I'm monitoring ${farmer.name}'s crops. All storage conditions are optimal.`, timestamp: new Date(Date.now() - 300000) },
    { id: 2, sender: 'farmer', message: 'How are the temperature levels looking?', timestamp: new Date(Date.now() - 240000) },
    { id: 3, sender: 'ai', message: `Temperature is excellent at ${farmer.conditions.avgTemp}°C. All crops are within optimal storage parameters.`, timestamp: new Date(Date.now() - 180000) }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const newUserMessage = {
      id: Date.now(),
      sender: 'storage_owner',
      message: newMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setNewMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        `Based on current data, ${farmer.name}'s crops are in excellent condition.`,
        "All environmental parameters are within optimal ranges for maximum freshness.",
        "I recommend maintaining current settings for best quality preservation.",
        "Storage efficiency is at 94% - excellent management by your facility.",
        "Would you like me to generate a detailed quality report?"
      ];

      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        message: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };
    
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 h-[500px] flex flex-col">
      <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <ChatBubbleLeftRightIcon className="w-5 h-5 text-emerald-400" />
        AI Storage Analysis
      </h2>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-lg max-w-[85%] ${
              msg.sender === 'ai' 
                ? 'bg-emerald-500/10 border border-emerald-500/30 mr-auto' 
                : msg.sender === 'farmer'
                ? 'bg-blue-500/10 border border-blue-500/30 ml-auto'
                : 'bg-purple-500/10 border border-purple-500/30 ml-auto'
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
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about storage conditions..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-white transition-all duration-200 flex items-center justify-center"
        >
          <PaperAirplaneIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function ColdStorageDashboard() {
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [realTimeData, setRealTimeData] = useState({});

  // Sample data with farmer-crop relationships
  const summary = {
    facilities: 4,
    totalCapacity: 9200,
    currentStock: 6120,
    avgUtilization: 66.5,
    alertsOpen: 3,
    activeFarmers: 12
  };

  const farmers = [
    {
      id: 'farmer-001',
      name: 'James Mwangi',
      location: 'Nakuru, Kenya',
      storageUnit: 'Cold Room A-1',
      status: 'optimal',
      storageDuration: '8 days',
      crops: [
        { type: 'Tomatoes', weight: 1500, shelfLife: '12 days', quality: 'Premium' },
        { type: 'Lettuce', weight: 800, shelfLife: '6 days', quality: 'Good' },
        { type: 'Carrots', weight: 1200, shelfLife: '21 days', quality: 'Premium' }
      ],
      conditions: {
        avgTemp: 3.2,
        avgHumidity: 87,
        lightExposure: 2.1,
        co2Level: 385
      }
    },
    {
      id: 'farmer-002',
      name: 'Sarah Wanjiku',
      location: 'Eldoret, Kenya',
      storageUnit: 'Cold Room B-2',
      status: 'attention',
      storageDuration: '15 days',
      crops: [
        { type: 'Spinach', weight: 600, shelfLife: '4 days', quality: 'Good' },
        { type: 'Kale', weight: 900, shelfLife: '7 days', quality: 'Premium' }
      ],
      conditions: {
        avgTemp: 4.8,
        avgHumidity: 82,
        lightExposure: 3.2,
        co2Level: 420
      }
    },
    {
      id: 'farmer-003',
      name: 'Michael Omondi',
      location: 'Kisumu, Kenya',
      storageUnit: 'Cold Room C-1',
      status: 'optimal',
      storageDuration: '5 days',
      crops: [
        { type: 'Mangoes', weight: 2200, shelfLife: '18 days', quality: 'Premium' },
        { type: 'Avocados', weight: 1800, shelfLife: '14 days', quality: 'Good' }
      ],
      conditions: {
        avgTemp: 2.9,
        avgHumidity: 89,
        lightExposure: 1.8,
        co2Level: 375
      }
    },
    {
      id: 'farmer-004',
      name: 'Grace Akinyi',
      location: 'Mombasa, Kenya',
      storageUnit: 'Cold Room D-3',
      status: 'issue',
      storageDuration: '22 days',
      crops: [
        { type: 'Broccoli', weight: 400, shelfLife: '2 days', quality: 'Fair' },
        { type: 'Cauliflower', weight: 600, shelfLife: '3 days', quality: 'Fair' }
      ],
      conditions: {
        avgTemp: 5.8,
        avgHumidity: 78,
        lightExposure: 4.1,
        co2Level: 450
      }
    }
  ];

  // Simulate real-time updates for selected farmer
  useEffect(() => {
    if (!selectedFarmer) return;

    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        [selectedFarmer.id]: {
          temperature: selectedFarmer.conditions.avgTemp + (Math.random() - 0.5) * 0.2,
          humidity: selectedFarmer.conditions.avgHumidity + (Math.random() - 0.5) * 2,
          lightExposure: selectedFarmer.conditions.lightExposure + (Math.random() - 0.5) * 0.3,
          co2Level: selectedFarmer.conditions.co2Level + (Math.random() - 0.5) * 5,
          timestamp: new Date()
        }
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedFarmer]);

  const generateReport = (farmer) => {
    const data = realTimeData[farmer.id] || farmer.conditions;
    const reportContent = `
COLD STORAGE REPORT - ${farmer.name}
====================================

Farmer: ${farmer.name}
Location: ${farmer.location}
Storage Unit: ${farmer.storageUnit}
Storage Duration: ${farmer.storageDuration}
Generated: ${new Date().toLocaleString()}

CURRENT CONDITIONS:
- Temperature: ${data.temperature?.toFixed(1) || farmer.conditions.avgTemp}°C
- Humidity: ${data.humidity?.toFixed(1) || farmer.conditions.avgHumidity}%
- Light Exposure: ${data.lightExposure?.toFixed(1) || farmer.conditions.lightExposure} lux
- CO2 Level: ${data.co2Level?.toFixed(0) || farmer.conditions.co2Level} ppm

STORED CROPS:
${farmer.crops.map(crop => `- ${crop.type}: ${crop.weight}kg (${crop.quality} quality, ${crop.shelfLife} shelf life)`).join('\n')}

TOTAL WEIGHT: ${farmer.crops.reduce((sum, crop) => sum + crop.weight, 0).toLocaleString()}kg
STATUS: ${farmer.status.toUpperCase()}
    `;

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${farmer.name.replace(' ', '_')}_Storage_Report_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (selectedFarmer) {
    const currentData = realTimeData[selectedFarmer.id] || selectedFarmer.conditions;
    
    return (
      <div className="min-h-screen bg-slate-950 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedFarmer(null)}
                className="group rounded-xl border border-slate-700/60 bg-slate-800/60 hover:bg-slate-800 px-4 py-3 text-slate-200 transition-all duration-200 flex items-center gap-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Dashboard
              </button>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                  <UserIcon className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-200">{selectedFarmer.name}</h1>
                  <p className="text-slate-400">
                    {selectedFarmer.location} • {selectedFarmer.storageUnit}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => generateReport(selectedFarmer)}
                className="group rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/15 px-6 py-3 text-blue-200 flex items-center gap-2 transition-all duration-200 hover:scale-[1.02]"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Download Report
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Storage Info */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <CubeIcon className="w-5 h-5 text-purple-400" />
                  Storage Information
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/60">
                    <HomeIcon className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">Storage Unit</p>
                      <p className="text-slate-200 font-medium">{selectedFarmer.storageUnit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/60">
                    <ClockIcon className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">Duration</p>
                      <p className="text-slate-200 font-medium">{selectedFarmer.storageDuration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/60">
                    <ChartBarIcon className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">Total Weight</p>
                      <p className="text-slate-200 font-medium">{selectedFarmer.crops.reduce((sum, crop) => sum + crop.weight, 0).toLocaleString()}kg</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/60">
                    <ShieldCheckIcon className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">Status</p>
                      <StatusBadge status={selectedFarmer.status} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Conditions */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                    <SignalIcon className="w-5 h-5 text-emerald-400 animate-pulse" />
                    Live Storage Conditions
                  </h2>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    Live updating
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    icon={FireIcon}
                    title="Temperature"
                    value={`${(currentData.temperature || selectedFarmer.conditions.avgTemp).toFixed(1)}°C`}
                    color="text-red-400"
                    bgColor="bg-red-500/20"
                  />
                  <StatCard
                    icon={BeakerIcon}
                    title="Humidity"
                    value={`${(currentData.humidity || selectedFarmer.conditions.avgHumidity).toFixed(1)}%`}
                    color="text-blue-400"
                    bgColor="bg-blue-500/20"
                  />
                  <StatCard
                    icon={SunIcon}
                    title="Light Exposure"
                    value={`${(currentData.lightExposure || selectedFarmer.conditions.lightExposure).toFixed(1)} lux`}
                    color="text-yellow-400"
                    bgColor="bg-yellow-500/20"
                  />
                  <StatCard
                    icon={BeakerIcon}
                    title="CO2 Level"
                    value={`${(currentData.co2Level || selectedFarmer.conditions.co2Level).toFixed(0)} ppm`}
                    color="text-purple-400"
                    bgColor="bg-purple-500/20"
                  />
                </div>
              </div>

              {/* Stored Crops */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <CubeIcon className="w-5 h-5 text-emerald-400" />
                  Stored Crops
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedFarmer.crops.map((crop, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-slate-700 bg-slate-800/60">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-slate-200">{crop.type}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          crop.quality === 'Premium' ? 'bg-emerald-500/20 text-emerald-400' :
                          crop.quality === 'Good' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {crop.quality}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Weight</span>
                          <span className="text-slate-200">{crop.weight.toLocaleString()}kg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Shelf Life</span>
                          <span className="text-slate-200">{crop.shelfLife}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <ChatInterface farmer={selectedFarmer} />

              {/* Quick Stats */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5 text-blue-400" />
                  Storage Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg border border-slate-700 bg-slate-800/60">
                    <span className="text-slate-400">Crop Varieties</span>
                    <span className="text-slate-200 font-semibold">{selectedFarmer.crops.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border border-slate-700 bg-slate-800/60">
                    <span className="text-slate-400">Total Weight</span>
                    <span className="text-slate-200 font-semibold">
                      {selectedFarmer.crops.reduce((sum, crop) => sum + crop.weight, 0).toLocaleString()}kg
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border border-slate-700 bg-slate-800/60">
                    <span className="text-slate-400">Avg Quality</span>
                    <span className="text-emerald-400 font-semibold">Premium</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg border border-slate-700 bg-slate-800/60">
                    <span className="text-slate-400">Storage Cost</span>
                    <span className="text-slate-200 font-semibold">KES 2,400/day</span>
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-200 mb-2">
            Cold Storage Management
          </h1>
          <p className="text-slate-400 text-lg">Monitor farmers' crops and storage conditions</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <StatCard 
            icon={BuildingStorefrontIcon}
            title="Facilities" 
            value={summary.facilities} 
            subtitle="Active sites" 
            trend={{ delta: 0 }}
            color="text-blue-400"
            bgColor="bg-blue-500/20"
          />
          <StatCard 
            icon={ChartBarIcon}
            title="Total Capacity" 
            value={`${summary.totalCapacity.toLocaleString()}t`} 
            subtitle="All locations" 
            trend={{ delta: 2.1 }}
            color="text-purple-400"
            bgColor="bg-purple-500/20"
          />
          <StatCard 
            icon={CubeIcon}
            title="Current Stock" 
            value={`${summary.currentStock.toLocaleString()}t`} 
            subtitle={`${Math.round((summary.currentStock / summary.totalCapacity) * 100)}% of capacity`} 
            trend={{ delta: -1.4 }}
            color="text-emerald-400"
            bgColor="bg-emerald-500/20"
          />
          <StatCard 
            icon={SignalIcon}
            title="Avg Utilization" 
            value={`${summary.avgUtilization}%`} 
            subtitle="Last 7 days" 
            trend={{ delta: 0.8 }}
            color="text-cyan-400"
            bgColor="bg-cyan-500/20"
          />
          <StatCard 
            icon={BellIcon}
            title="Open Alerts" 
            value={summary.alertsOpen} 
            subtitle="Temperature/Humidity" 
            trend={{ delta: -25.0 }}
            color="text-amber-400"
            bgColor="bg-amber-500/20"
          />
          <StatCard 
            icon={UserIcon}
            title="Active Farmers" 
            value={summary.activeFarmers} 
            subtitle="Using storage" 
            trend={{ delta: 8.3 }}
            color="text-indigo-400"
            bgColor="bg-indigo-500/20"
          />
        </div>

        {/* Farmers Storage Cards */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-200">Farmers & Their Crops</h2>
            <div className="text-slate-400 text-sm">Click on any farmer to view detailed storage information</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {farmers.map((farmer) => (
              <FarmerStorageCard 
                key={farmer.id} 
                farmer={farmer} 
                onClick={setSelectedFarmer} 
              />
            ))}
          </div>
        </div>

        {/* Facility Overview */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
              <BuildingStorefrontIcon className="w-6 h-6 text-blue-400" />
              Storage Facilities Overview
            </h2>
            <div className="text-slate-400 text-sm">Real-time facility monitoring</div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-300 font-medium">Facility</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-medium">Capacity</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-medium">Utilization</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-medium">Avg Temp</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-medium">Avg Humidity</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4">
                    <div className="text-slate-200 font-medium">North Hub A</div>
                    <div className="text-slate-400 text-sm">Nakuru, Kenya</div>
                  </td>
                  <td className="py-4 px-4 text-slate-200">3,000t</td>
                  <td className="py-4 px-4"><UtilizationCell value={72} /></td>
                  <td className="py-4 px-4 text-slate-200">3.4°C</td>
                  <td className="py-4 px-4 text-slate-200">85%</td>
                  <td className="py-4 px-4"><StatusBadge status="optimal" /></td>
                </tr>
                <tr className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4">
                    <div className="text-slate-200 font-medium">Valley Store</div>
                    <div className="text-slate-400 text-sm">Eldoret, Kenya</div>
                  </td>
                  <td className="py-4 px-4 text-slate-200">1,800t</td>
                  <td className="py-4 px-4"><UtilizationCell value={54} /></td>
                  <td className="py-4 px-4 text-slate-200">4.1°C</td>
                  <td className="py-4 px-4 text-slate-200">82%</td>
                  <td className="py-4 px-4"><StatusBadge status="attention" /></td>
                </tr>
                <tr className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4">
                    <div className="text-slate-200 font-medium">Delta Chambers</div>
                    <div className="text-slate-400 text-sm">Kisumu, Kenya</div>
                  </td>
                  <td className="py-4 px-4 text-slate-200">2,200t</td>
                  <td className="py-4 px-4"><UtilizationCell value={69} /></td>
                  <td className="py-4 px-4 text-slate-200">2.8°C</td>
                  <td className="py-4 px-4 text-slate-200">88%</td>
                  <td className="py-4 px-4"><StatusBadge status="optimal" /></td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4">
                    <div className="text-slate-200 font-medium">Coast Fresh</div>
                    <div className="text-slate-400 text-sm">Mombasa, Kenya</div>
                  </td>
                  <td className="py-4 px-4 text-slate-200">1,200t</td>
                  <td className="py-4 px-4"><UtilizationCell value={56} /></td>
                  <td className="py-4 px-4 text-slate-200">5.2°C</td>
                  <td className="py-4 px-4 text-slate-200">80%</td>
                  <td className="py-4 px-4"><StatusBadge status="issue" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Environmental Conditions */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
              <BeakerIcon className="w-6 h-6 text-emerald-400" />
              Environmental Conditions
            </h2>
            <div className="text-slate-400 text-sm">System-wide environmental metrics</div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/60">
              <div className="text-slate-400 text-sm mb-1">Avg Temperature</div>
              <div className="text-2xl font-bold text-slate-200 mb-1">3.9°C</div>
              <div className="text-slate-400 text-xs mb-2">Target: 2–5°C</div>
              <div className="text-emerald-400 text-sm font-medium">✓ Within range</div>
            </div>
            <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/60">
              <div className="text-slate-400 text-sm mb-1">Avg Humidity</div>
              <div className="text-2xl font-bold text-slate-200 mb-1">84%</div>
              <div className="text-slate-400 text-xs mb-2">Target: 80–90%</div>
              <div className="text-emerald-400 text-sm font-medium">✓ Within range</div>
            </div>
            <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/60">
              <div className="text-slate-400 text-sm mb-1">Power Uptime (7d)</div>
              <div className="text-2xl font-bold text-slate-200 mb-1">99.2%</div>
              <div className="text-slate-400 text-xs mb-2">Target: {'>='} 99%</div>
              <div className="text-emerald-400 text-sm font-medium">✓ OK</div>
            </div>
            <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/60">
              <div className="text-slate-400 text-sm mb-1">Door Events (24h)</div>
              <div className="text-2xl font-bold text-slate-200 mb-1">18</div>
              <div className="text-slate-400 text-xs mb-2">Target: &le; 24</div>
              <div className="text-emerald-400 text-sm font-medium">✓ OK</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-400 text-sm mt-8">
          Data updates in real-time from IoT sensors • Last refresh: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}