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

        {/* Demo Mode Notice */}
        <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl text-blue-950 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-sm text-blue-900">
            <Info className="w-4 h-4 text-blue-700" />
            <span>SIH 2026 Demonstration Configuration</span>
          </div>
          <p className="text-[11px] text-blue-900 leading-relaxed">
            The platform is running in Smart India Hackathon Demonstration Mode. Core RAG queries, 3D CAD mesh parsing, photo OCR, and Haversine lab calculations are processed locally on the FastAPI backend without external cloud bottlenecks.
          </p>
          <div className="text-[10px] font-mono text-blue-800 bg-blue-100/60 p-2 rounded-lg mt-2">
            Backend Endpoint: http://localhost:8000 • Database: PostgreSQL / Local Registry • FAISS CPU
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
