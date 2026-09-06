import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Clock, HelpCircle } from 'lucide-react';

export default function StatusBadge({ status, text, size = 'sm' }) {
  const norm = (status || '').toUpperCase();

  let colors = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = HelpCircle;

  if (norm.includes('COMPLIANT') && !norm.includes('NON') || norm.includes('VERIFIED') || norm.includes('OPERATIVE') || norm.includes('ACTIVE') || norm.includes('GENUINE')) {
    colors = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold';
    Icon = CheckCircle2;
  } else if (norm.includes('NON') || norm.includes('FAILED') || norm.includes('COUNTERFEIT') || norm.includes('INVALID') || norm.includes('EXPIRED')) {
    colors = 'bg-red-50 text-red-800 border-red-200 font-semibold';
    Icon = XCircle;
  } else if (norm.includes('WARNING') || norm.includes('MARGINAL') || norm.includes('ACTION')) {
    colors = 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
    Icon = AlertTriangle;
  } else if (norm.includes('PENDING') || norm.includes('UNVERIFIED')) {
    colors = 'bg-blue-50 text-blue-800 border-blue-200';
    Icon = Clock;
  }

  const padding = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center space-x-1 rounded-full border ${padding} ${colors}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{text || status}</span>
    </span>
  );
}
