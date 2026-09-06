import React from 'react';
import { 
  MessageSquare, ShieldCheck, Box, MapPin, Bell, 
  ArrowRight, ShieldAlert, CheckCircle2, AlertTriangle, 
  FileText, Sparkles, Building2, UserCheck, Search 
} from 'lucide-react';
import { useUserMode } from '../context/UserModeContext';
import { useLanguage } from '../context/LanguageContext';
import StatusBadge from '../components/common/StatusBadge';

export default function Dashboard({ onNavigate, reports = [], amendments = [] }) {
  const { isMSME } = useUserMode();
  const { t } = useLanguage();

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="bg-linear-to-r from-bis-900 via-blue-900 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs text-blue-200 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Smart India Hackathon 2026 • Smart Automation</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('goodMorning')}
          </h2>
          <p className="text-sm text-blue-100/90 leading-relaxed font-normal">
            <strong>BIS Sahayak (मानक सहायक)</strong> is your intelligent compliance and quality assurance platform for Bureau of Indian Standards regulations, ISI certification, and 3D pre-tooling validation.
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <span className="bg-blue-800/60 px-3 py-1 rounded-lg border border-blue-700/50">
              Active Mode: <strong className="text-white">{isMSME ? 'MSME / Manufacturer' : 'Consumer Safety'}</strong>
            </span>
            <span className="bg-blue-800/60 px-3 py-1 rounded-lg border border-blue-700/50">
              Bhashini IndicTrans2 Active
            </span>
          </div>
        </div>

        {/* Decorative Watermark */}
        <div className="absolute -right-10 -bottom-10 text-white/5 font-black text-9xl select-none pointer-events-none">
          BIS
        </div>
      </div>

      {/* Main Action Cards (Tailored to Role) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-slate-900">
            {isMSME ? 'MSME Engineering & Compliance Actions' : 'Consumer Verification Services'}
          </h3>
          <span className="text-xs text-slate-500">Quick Access Tools</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Ask BIS */}
          <div
            onClick={() => onNavigate('chat')}
            className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">{t('askCardTitle')}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{t('askCardDesc')}</p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
              <span>Start consultation</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 2: Verify Product */}
          <div
            onClick={() => onNavigate('verify')}
            className="bg-white p-5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">{t('verifyCardTitle')}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{t('verifyCardDesc')}</p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform">
              <span>Verify license</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 3: CAD Scanner (MSME) OR Report Fake (Consumer) */}
          {isMSME ? (
            <div
              onClick={() => onNavigate('cad')}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Box className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">{t('cadCardTitle')}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{t('cadCardDesc')}</p>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
                <span>Upload 3D STL</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          ) : (
            <div
              onClick={() => onNavigate('verify')}
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-red-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">{t('reportFakeCard')}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{t('reportFakeDesc')}</p>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-red-600 group-hover:translate-x-1 transition-transform">
                <span>Report suspect mark</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          )}

          {/* Card 4: Lab Finder */}
          <div
            onClick={() => onNavigate('labs')}
            className="bg-white p-5 rounded-xl border border-slate-200 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">{t('labsCardTitle')}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{t('labsCardDesc')}</p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-amber-600 group-hover:translate-x-1 transition-transform">
              <span>Find nearest labs</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Recent Activity & Standards Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reports & Activity (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Recent Activity & Compliance History</span>
            </h3>
            <button 
              onClick={() => onNavigate('reports')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              View all reports
            </button>
          </div>

          <div className="space-y-3">
            {reports.slice(0, 3).map((r, i) => (
              <div 
                key={i}
                onClick={() => onNavigate('reports')}
                className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-xs text-slate-900">{r.title}</span>
                    <StatusBadge status={r.status} size="xs" />
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{r.summary}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-3">{r.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gazette Amendment Notice (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <span>Gazette Notices</span>
              </h3>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                Active Feed
              </span>
            </div>

            {amendments.slice(0, 2).map((a, i) => (
              <div key={i} className="mb-3 p-3 rounded-lg bg-blue-50/50 border border-blue-100 space-y-1">
                <div className="flex justify-between items-center text-[10px] text-blue-800 font-bold">
                  <span>{a.standard_id}</span>
                  <span>{a.effective_date}</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 line-clamp-1">{a.standard_title}</p>
                <p className="text-[11px] text-slate-600 line-clamp-2">{a.delta_summary}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('updates')}
            className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs flex items-center justify-center space-x-1 transition-colors"
          >
            <span>View All Amendments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
