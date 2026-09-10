import React from 'react';
import { 
  Laptop, ShieldCheck, Box, Droplets, Zap, 
  ChevronRight, ArrowUpRight, Gauge, CheckCircle2, 
  AlertTriangle, Clock 
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const getCategoryIcon = (id = '') => {
  const s = id.toLowerCase();
  if (s.includes('13252') || s.includes('laptop') || s.includes('it')) return Laptop;
  if (s.includes('15652') || s.includes('mat') || s.includes('electrical')) return Zap;
  if (s.includes('10500') || s.includes('water')) return Droplets;
  if (s.includes('1363') || s.includes('bolt')) return Box;
  return ShieldCheck;
};

export default function UnitInspectionCard({ unit, onSelect }) {
  const Icon = getCategoryIcon(unit.standard_id || unit.title);

  return (
    <div 
      onClick={() => onSelect(unit)}
      className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-blue-500/70 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
    >
      {/* Card Header: Icon + Standard ID + Status */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
              {unit.standard_id || 'IS Standard'}
            </span>
            <h4 className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {unit.title}
            </h4>
          </div>
        </div>
        <StatusBadge status={unit.status || 'COMPLIANT'} size="xs" />
      </div>

      {/* Summary Snippet */}
      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
        {unit.summary || unit.description}
      </p>

      {/* Tolerance / Compliance Progress Bar */}
      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-500 flex items-center space-x-1">
            <Gauge className="w-3 h-3 text-blue-600" />
            <span>Tolerance Check:</span>
          </span>
          <span className="font-bold text-slate-700">
            {unit.measured || 'Pass (±0.2mm)'}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-1.5 rounded-full transition-all ${
              unit.status === 'ACTION_REQUIRED' ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${unit.progressPct || 95}%` }}
          />
        </div>
      </div>

      {/* Card Footer: Quick Action Trigger */}
      <div className="pt-1 flex items-center justify-between border-t border-slate-100 text-[11px] font-medium text-slate-500 group-hover:text-blue-600 transition-colors">
        <span className="text-[10px] font-mono text-slate-400">ID: {unit.id || 'UNIT-2026'}</span>
        <div className="flex items-center space-x-1 font-semibold text-blue-600">
          <span>Inspect Telemetry</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
}