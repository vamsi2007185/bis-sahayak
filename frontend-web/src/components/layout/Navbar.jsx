import React, { useState } from 'react';
import { 
  Globe, Bell, Shield, User, CheckCircle2, ChevronDown, 
  ExternalLink, FileText, AlertCircle, HelpCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useUserMode } from '../../context/UserModeContext';

export default function Navbar({ onNavigate, notifications = [] }) {
  const { lang, setLang, languages } = useLanguage();
  const { mode, setMode, isMSME } = useUserMode();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-bis-900 text-white shadow-md sticky top-0 z-40 border-b border-bis-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="bg-white text-bis-900 font-extrabold text-base tracking-wider px-2.5 py-1 rounded shadow-sm group-hover:scale-105 transition-transform">
            BIS
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight">BIS Sahayak</span>
              <span className="text-xs bg-bis-800 text-blue-200 px-2 py-0.5 rounded-full font-mono border border-bis-700">
                मानक सहायक
              </span>
            </div>
            <p className="text-[11px] text-blue-200 hidden sm:block">
              AI Intelligent Assistant for Indian Standards • SIH 2026
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* User Mode Toggle: Consumer vs MSME */}
          <div className="bg-bis-950/70 p-0.5 rounded-lg border border-bis-700/60 flex items-center text-xs">
            <button
              onClick={() => setMode('consumer')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                !isMSME 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Consumer
            </button>
            <button
              onClick={() => setMode('msme')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                isMSME 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              MSME / Industry
            </button>
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-bis-800/80 hover:bg-bis-700 text-xs font-medium border border-bis-700 transition-colors"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-blue-300" />
              <span>{languages.find(l => l.code === lang)?.native || 'English'}</span>
              <ChevronDown className="w-3 h-3 text-slate-300" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-slate-800 text-xs z-50 max-h-80 overflow-y-auto">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Bhashini (IndicTrans2)
                </div>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-blue-50 transition-colors ${
                      lang === l.code ? 'font-bold text-blue-700 bg-blue-50/60' : 'text-slate-700'
                    }`}
                  >
                    <span>{l.native}</span>
                    <span className="text-slate-400 text-[11px]">{l.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg bg-bis-800/80 hover:bg-bis-700 text-slate-200 hover:text-white border border-bis-700 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 text-xs z-50 overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between font-semibold">
                  <span>Regulatory Alerts</span>
                  <span className="text-[11px] text-blue-600 cursor-pointer" onClick={() => onNavigate('updates')}>
                    View All
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-500">No new alerts.</div>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={i} className="p-3 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onNavigate('updates')}>
                        <div className="flex items-center space-x-1.5 text-blue-700 font-semibold mb-0.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{n.standard_id || 'Gazette Update'}</span>
                        </div>
                        <p className="text-slate-600 line-clamp-2 text-[11px]">{n.delta_summary || n.title}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">Effective: {n.effective_date || 'Recent'}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile / Demo Indicator */}
          <div 
            onClick={() => onNavigate('settings')}
            className="flex items-center space-x-2 pl-2 border-l border-bis-800 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs border border-blue-400 shadow-sm">
              {isMSME ? 'M' : 'C'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
