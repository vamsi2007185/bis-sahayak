import React, { useState } from 'react';
import { 
  MapPin, Navigation, ShieldCheck, Activity, 
  ExternalLink, Layers, CheckCircle2, ChevronRight, Phone 
} from 'lucide-react';

const REGIONAL_HUBS = [
  {
    id: 'HUB-NCR',
    name: 'BIS Central Laboratory (CL)',
    city: 'Sahibabad, NCR',
    state: 'Uttar Pradesh',
    zone: 'Northern Hub',
    status: 'OPERATIONAL',
    accreditation: 'NABL TC-5012',
    capacity: '78%',
    turnaround: '3.8 Days',
    categories: ['Electrical', 'Drinking Water', 'Mechanical', 'Chemical'],
    coords: '28.6946, 77.3489',
    phone: '+91-120-4177100'
  },
  {
    id: 'HUB-MUM',
    name: 'BIS Western Regional Laboratory (WRL)',
    city: 'Andheri (E), Mumbai',
    state: 'Maharashtra',
    zone: 'Western Hub',
    status: 'OPERATIONAL',
    accreditation: 'NABL TC-5088',
    capacity: '64%',
    turnaround: '4.2 Days',
    categories: ['Electronics & IT', 'Plastics', 'Textiles', 'Electrical'],
    coords: '19.1173, 72.8687',
    phone: '+91-22-28329295'
  },
  {
    id: 'HUB-CHN',
    name: 'National Test House (Southern Region)',
    city: 'Tharamani, Chennai',
    state: 'Tamil Nadu',
    zone: 'Southern Hub',
    status: 'OPERATIONAL',
    accreditation: 'NABL TC-5431',
    capacity: '82%',
    turnaround: '3.5 Days',
    categories: ['Civil & Cement', 'Mechanical', 'Electrical'],
    coords: '13.0012, 80.2056',
    phone: '+91-44-22541150'
  },
  {
    id: 'HUB-KOL',
    name: 'BIS Eastern Regional Laboratory (ERL)',
    city: 'Salt Lake, Kolkata',
    state: 'West Bengal',
    zone: 'Eastern Hub',
    status: 'OPERATIONAL',
    accreditation: 'NABL TC-5120',
    capacity: '59%',
    turnaround: '4.0 Days',
    categories: ['Steel & Rebars', 'Water Testing', 'Food'],
    coords: '22.5855, 88.4232',
    phone: '+91-33-23207099'
  }
];

export default function TelemetryMapCard({ onNavigate }) {
  const [selectedHub, setSelectedHub] = useState(REGIONAL_HUBS[0]);
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredHubs = activeCategory === 'All' 
    ? REGIONAL_HUBS 
    : REGIONAL_HUBS.filter(h => h.categories.some(c => c.toLowerCase().includes(activeCategory.toLowerCase())));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
      {/* Card Header */}
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">National Testing Laboratory Telemetry</h3>
            <p className="text-[11px] text-slate-500">Real-time capacity and sample intake at accredited BIS facilities</p>
          </div>
        </div>

        {/* Discipline filter chips */}
        <div className="flex items-center space-x-1.5 text-[10px] font-medium overflow-x-auto">
          {['All', 'Electrical', 'Water', 'Electronics'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-full transition-colors ${
                activeCategory === cat 
                  ? 'bg-blue-600 text-white font-bold' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map & Telemetry Body */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Stylized Radar / Map View (7 cols) */}
        <div className="lg:col-span-7 bg-radial from-slate-900 to-slate-950 rounded-xl p-5 text-white relative min-h-[220px] flex flex-col justify-between overflow-hidden border border-slate-800">
          {/* Subtle Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />

          {/* Header on map */}
          <div className="relative z-10 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-emerald-400 text-[11px] font-semibold">ALL 4 ZONAL HUBS ONLINE</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">GEO-LAT: 20.5937° N, 78.9629° E</span>
          </div>

          {/* Stylized Hub Hotspots */}
          <div className="relative z-10 py-6 grid grid-cols-2 gap-3">
            {filteredHubs.map(hub => {
              const isSelected = selectedHub.id === hub.id;
              return (
                <div
                  key={hub.id}
                  onClick={() => setSelectedHub(hub)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer backdrop-blur-md ${
                    isSelected 
                      ? 'bg-blue-600/30 border-blue-400 shadow-lg text-white' 
                      : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="flex items-center space-x-1.5">
                      <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                      <span>{hub.zone}</span>
                    </span>
                    <span className="text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.2 rounded">
                      {hub.capacity} load
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-300 mt-1 line-clamp-1">{hub.name}</div>
                </div>
              );
            })}
          </div>

          {/* Map Footer */}
          <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800">
            <span>BIS CARE Verified Geolocation</span>
            <button 
              onClick={() => onNavigate('labs')}
              className="text-blue-400 hover:text-blue-300 flex items-center space-x-1 font-semibold"
            >
              <span>Explore All 42 Labs</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right Active Hub Dossier (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase font-bold">
              <span>Selected Hub Telemetry</span>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-sans">
                Sample Intake Open
              </span>
            </div>

            <h4 className="font-bold text-sm text-slate-900 mt-1">{selectedHub.name}</h4>
            <p className="text-[11px] text-slate-600 mt-0.5">{selectedHub.city}, {selectedHub.state}</p>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Accreditation</span>
                <span className="font-mono font-bold text-slate-800 text-[11px]">{selectedHub.accreditation}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Avg Turnaround</span>
                <span className="font-bold text-blue-700 text-[11px]">{selectedHub.turnaround}</span>
              </div>
            </div>

            {/* Disciplines */}
            <div className="mt-3">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Testing Capabilities</span>
              <div className="flex flex-wrap gap-1">
                {selectedHub.categories.map(c => (
                  <span key={c} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center space-x-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${selectedHub.coords}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions</span>
            </a>
            <button
              onClick={() => onNavigate('labs')}
              className="py-2 px-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Book Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}