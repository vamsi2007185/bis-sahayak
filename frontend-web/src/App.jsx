import React, { useState } from 'react';
import { 
  MessageSquare, ShieldCheck, Box, MapPin, Camera, Bell, 
  Search, AlertTriangle, CheckCircle, FileText, Globe 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [query, setQuery] = useState('');
  const [chatLog, setChatLog] = useState([
    {
      sender: 'bot',
      text: 'Namaste! I am BIS Sahayak (मानक सहायक). How can I assist you with Indian Standards, ISI licensing, CAD compliance, or lab testing today?'
    }
  ]);

  const [cadStatus, setCadStatus] = useState(null);
  const [isiStatus, setIsiStatus] = useState(null);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setChatLog((prev) => [...prev, userMsg]);
    setQuery('');

    // Simulated quick response
    setTimeout(() => {
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'As per IS 10500:2012, Clause 4.1 & Table 1: Acceptable limit for Total Dissolved Solids (TDS) is 500 mg/l Max, with permissible limit in absence of alternate sources as 2000 mg/l Max.',
          citation: 'IS 10500:2012, Clause 4.1'
        }
      ]);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white text-blue-900 p-2 rounded-lg font-bold text-xl tracking-wider">
              BIS
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">BIS Sahayak (मानक सहायक)</h1>
              <p className="text-xs text-blue-200">SIH 2026 Smart Automation • Indian Standards AI Assistant</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <span className="bg-blue-800 px-3 py-1 rounded-full text-blue-200 flex items-center space-x-1">
              <Globe className="w-3.5 h-3.5" />
              <span>Bhashini 22 Indic Languages</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex space-x-1 overflow-x-auto">
          {[
            { id: 'chat', label: 'Multilingual Chat', icon: MessageSquare },
            { id: 'cad', label: '3D CAD Scanner', icon: Box },
            { id: 'photo', label: 'Photo-to-Standard (OCR)', icon: Camera },
            { id: 'labs', label: 'Hyper-Local Lab Router', icon: MapPin },
            { id: 'gazette', label: 'Gazette Amendments', icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  active
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {activeTab === 'chat' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[600px] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-xl">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold">Strict Citation Anti-Hallucination Guardrail Active</span>
              </div>
              <span className="text-xs text-slate-500">FastAPI • FAISS • Bhashini</span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {chatLog.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xl rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                    }`}
                  >
                    <p>{msg.text}</p>
                    {msg.citation && (
                      <div className="mt-2 pt-2 border-t border-slate-300 text-xs font-mono text-blue-700 flex items-center space-x-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Verified Citation: {msg.citation}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="p-3 border-t border-slate-200 flex space-x-2 bg-white rounded-b-xl">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask in Hindi, Tamil, Telugu, English (e.g. पानी में TDS की लिमिट क्या है?)..."
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        )}

        {activeTab === 'cad' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-3xl mx-auto space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Box className="w-5 h-5 text-blue-600" />
                <span>Automated 3D CAD Compliance Scanner</span>
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Upload .stl mesh files to verify dimensional tolerances against BIS standards before physical tooling.
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
              <Box className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Drag and drop your 3D CAD model (.stl)</p>
              <p className="text-xs text-slate-400 mt-1">Supports binary & ASCII STL meshes (Up to 50MB)</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900">Supported Target Standards</h3>
              <ul className="text-xs text-blue-800 mt-2 space-y-1 list-disc list-inside">
                <li>IS 15652:2006 — Electrical Insulation Mats (Sheet thickness tolerances)</li>
                <li>IS 1363:2002 — Hexagon Head Bolts & Screws (Metric M6 to M36 dimensions)</li>
                <li>IS 4984:2016 — High Density Polyethylene (HDPE) Pipes (Outer Diameter & Wall Thickness)</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'labs' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-red-600" />
                <span>Hyper-Local BIS Testing Laboratory Router</span>
              </h2>
              <p className="text-sm text-slate-500">
                Instantly locate accredited testing facilities from the CARE database using Haversine geospatial proximity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {[
                { name: 'BIS Central Laboratory (CL)', city: 'Ghaziabad, UP', dist: '18.4 km', scope: 'Chemical, Electrical, Water, Mechanical' },
                { name: 'BIS Western Regional Lab (WROL)', city: 'Mumbai, MH', dist: '1,164 km', scope: 'Electrical, Electronics, Plastics' },
                { name: 'BIS Northern Regional Lab (NROL)', city: 'Mohali, PB', dist: '235 km', scope: 'Mechanical, Water, Agriculture' }
              ].map((lab, i) => (
                <div key={i} className="p-4 rounded-lg border border-slate-200 hover:shadow-md transition-shadow bg-slate-50">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{lab.dist} away</span>
                  <h4 className="font-semibold text-slate-900 text-sm mt-1">{lab.name}</h4>
                  <p className="text-xs text-slate-500">{lab.city}</p>
                  <p className="text-xs text-slate-600 mt-2 font-medium">Scope: {lab.scope}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'photo' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-2xl mx-auto space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Camera className="w-5 h-5 text-emerald-600" />
              <span>Photo-to-Standard ISI Mark OCR Authenticator</span>
            </h2>
            <p className="text-sm text-slate-500">
              Snap or upload an image of an ISI stamp to verify CM/L registration authenticity and safety ratings.
            </p>
            <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-xl p-8 text-center cursor-pointer">
              <Camera className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-emerald-900">Upload Product Label Photo</p>
              <p className="text-xs text-emerald-700 mt-1">Automatic CM/L license code extraction</p>
            </div>
          </div>
        )}

        {activeTab === 'gazette' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Bell className="w-5 h-5 text-amber-500" />
              <span>Proactive Gazette Amendment Feed & WhatsApp Webhooks</span>
            </h2>
            <div className="border-l-4 border-blue-600 bg-blue-50 p-4 rounded-r-lg space-y-1">
              <div className="flex justify-between text-xs text-blue-900 font-bold">
                <span>IS 10500:2012 / Amendment 3</span>
                <span>Effective: 2026-10-01</span>
              </div>
              <p className="text-sm text-blue-950 font-semibold">Revised Microplastics & Heavy Metal Testing Protocols</p>
              <p className="text-xs text-blue-800">Automatic WhatsApp delta summary dispatched to registered beverage & water MSMEs.</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        © 2026 BIS Sahayak • Smart India Hackathon (Smart Automation) • Developed for Indian MSMEs & Consumers
      </footer>
    </div>
  );
}
