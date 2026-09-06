import React from 'react';
import { 
  LayoutDashboard, MessageSquare, ShieldCheck, Box, 
  MapPin, BellRing, FileText, Settings, ShieldAlert, Sparkles 
} from 'lucide-react';
import { useUserMode } from '../../context/UserModeContext';

export default function Sidebar({ activeTab, onNavigate }) {
  const { isMSME } = useUserMode();

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'AI Sahayak', icon: MessageSquare, badge: 'RAG' },
    { id: 'verify', label: 'Verify Product', icon: ShieldCheck, highlight: !isMSME },
    { id: 'cad', label: 'CAD Compliance', icon: Box, msmeOnly: true, highlight: isMSME },
    { id: 'labs', label: 'Find Laboratory', icon: MapPin },
    { id: 'updates', label: 'Standard Updates', icon: BellRing },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col shrink-0 justify-between">
      {/* Nav items */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>

        {navigation.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active 
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${active ? 'text-blue-700' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] bg-blue-100 text-blue-700 font-mono px-1.5 py-0.5 rounded">
                  {item.badge}
                </span>
              )}
              {item.msmeOnly && (
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.2 rounded uppercase">
                  3D
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Trust & Verification Badge */}
      <div className="p-4 m-3 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 mb-1">
          <ShieldAlert className="w-4 h-4 text-emerald-600" />
          <span>Citation Guardrail</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          All technical specifications strictly validated against official Bureau of Indian Standards clauses.
        </p>
      </div>
    </aside>
  );
}
