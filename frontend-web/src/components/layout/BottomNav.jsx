import React from 'react';
import { LayoutDashboard, MessageSquare, ShieldCheck, Box, MapPin, FileText } from 'lucide-react';
import { useUserMode } from '../../context/UserModeContext';

export default function BottomNav({ activeTab, onNavigate }) {
  const { isMSME } = useUserMode();

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'chat', label: 'Ask BIS', icon: MessageSquare },
    { id: 'verify', label: 'Verify', icon: ShieldCheck },
    { id: isMSME ? 'cad' : 'labs', label: isMSME ? 'CAD' : 'Labs', icon: isMSME ? Box : MapPin },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 px-2 py-1 flex justify-around items-center shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center py-1.5 px-3 rounded-lg transition-colors ${
              active ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
