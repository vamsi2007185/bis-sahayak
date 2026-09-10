import React from 'react';
import { 
  Globe, Shield, User, Bell, MapPin, 
  HelpCircle, ExternalLink, Info, CheckCircle2 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useUserMode } from '../context/UserModeContext';

export default function Settings() {
  const { lang, setLang, languages } = useLanguage();
  const { mode, setMode } = useUserMode();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Platform Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">Preferences, user role customization, and system diagnostics</p>
      </div>

      <div className="space-y-4 text-xs">
        {/* User Role */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>Operational Mode</span>
          </h3>
          <p className="text-slate-500">
            Switching modes customizes the dashboard actions and priorities for either citizen consumer safety or MSME manufacturing compliance.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => setMode('consumer')}
              className={`p-3 rounded-xl border text-left transition-all ${
                mode === 'consumer'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div>Consumer Safety</div>
              <span className="text-[11px] font-normal text-slate-500 block mt-0.5">
                Focus on product certification verification, lab search, and reporting fake marks.
              </span>
            </button>

            <button
              onClick={() => setMode('msme')}
              className={`p-3 rounded-xl border text-left transition-all ${
                mode === 'msme'
                  ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 font-bold'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div>MSME / Manufacturer</div>
              <span className="text-[11px] font-normal text-slate-500 block mt-0.5">
                Focus on 3D CAD pre-tooling scans, standard amendments, and audit reports.
              </span>
            </button>
          </div>
        </div>

        {/* Language */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Bhashini Language Selection (22 Indic Languages)</span>
          </h3>
          <p className="text-slate-500">
            Select your preferred regional language for natural language translation and query synthesis.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  lang === l.code
                    ? 'border-blue-600 bg-blue-600 text-white font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>{l.native}</div>
                <div className="text-[10px] opacity-75">{l.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Backend & Deployment Configuration */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Compliance Engine & API Endpoint</span>
          </h3>
          <p className="text-slate-500">
            When running on GitHub Pages, the platform automatically utilizes its built-in Autonomous Regulatory Engine to deliver instant BIS standards citations and compliance guidance without requiring an active cloud server.
          </p>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-950">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-xs">Autonomous Regulatory Engine: Active</span>
            </div>
            <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-mono px-2 py-0.5 rounded-full">
              Zero Latency Fallback
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-semibold text-slate-700 block">
              Optional Cloud or Local Backend URL:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                defaultValue={localStorage.getItem('bis_api_url') || import.meta.env.VITE_API_BASE_URL || ''}
                id="backendUrlInput"
                placeholder={import.meta.env.VITE_API_BASE_URL || "https://your-backend.onrender.com or http://localhost:8000"}
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                onClick={() => {
                  const val = document.getElementById('backendUrlInput')?.value?.trim();
                  if (val) {
                    localStorage.setItem('bis_api_url', val);
                    alert('Backend endpoint updated to: ' + val);
                    window.location.reload();
                  }
                }}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('bis_api_url');
                  alert('Reset to default endpoint.');
                  window.location.reload();
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs transition-colors"
              >
                Reset
              </button>
            </div>
            <span className="text-[10px] text-slate-400 block">
              If running locally, start your server with: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">uvicorn app.main:app --reload</code>
            </span>
          </div>
        </div>

        {/* Attribution */}
        <div className="p-4 text-center text-slate-400 text-[11px]">
          BIS Sahayak v2.0 • Smart India Hackathon 2026 • Designed for Indian MSMEs and Consumers
        </div>
      </div>
    </div>
  );
}
