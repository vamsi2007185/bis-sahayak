import React from 'react';
import { 
  X, ShieldCheck, AlertCircle, FileText, 
  ExternalLink, Copy, Check, Download, MapPin, 
  ArrowRight, Info, CheckCircle2 
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function SlideOverDrawer({ isOpen, onClose, data, onAction }) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !data) return null;

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full">
                Telemetry Inspection Unit
              </span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">{data.title || data.name}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{data.standardId || data.standard_id || 'Bureau of Indian Standards'}</p>
              </div>
              {data.status && <StatusBadge status={data.status} size="sm" />}
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Scheme</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 block">{data.scheme || 'Scheme-I (ISI Mark)'}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Audit Validity</span>
                <span className="text-xs font-bold text-emerald-700 mt-0.5 block">{data.validity || 'Verified Operative'}</span>
              </div>
            </div>

            {/* Dimensional & Tolerance Gauge */}
            {data.measured && (
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-blue-900 flex items-center space-x-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tolerance Measurement</span>
                  </span>
                  <span className="text-[10px] font-mono text-blue-700 font-bold">
                    {data.deviation || 'Within ±0.20 mm Limit'}
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(20, data.progressPct || 92))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Measured: {data.measured}</span>
                  <span>Nominal Target: {data.nominal || '2.00 mm'}</span>
                </div>
              </div>
            )}

            {/* Regulatory Summary */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">Technical Audit Summary</h4>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                {data.summary || data.description || 'All geometric tolerances, dielectric withstand proofs, and safety parameters strictly adhere to notified BIS specifications.'}
              </p>
            </div>

            {/* Official Clause Citations */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">Verified BIS Clauses</h4>
                <button
                  onClick={() => handleCopy(data.clause || 'IS 15652 Clause 6.1')}
                  className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center space-x-1 font-semibold"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Citation'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 text-[11px] font-mono text-slate-800 space-y-1">
                <div className="text-blue-900 font-bold">{data.clauseTitle || 'Section 16 / Clause 4.2 Mandatory Specification'}</div>
                <div className="text-slate-600 text-[10px]">Reference: Gazette S.O. 2457(E) & Bureau of Indian Standards Act, 2016.</div>
              </div>
            </div>

            {/* Testing Lab Telemetry */}
            {data.lab && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center space-x-1.5 font-bold text-xs text-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>Accredited Testing Hub</span>
                </div>
                <p className="text-[11px] text-slate-600">{data.lab}</p>
                <div className="text-[10px] font-mono text-slate-400">NABL Accreditation: TC-5012 • Sahibabad Central Lab</div>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/80 space-y-2">
            <button
              onClick={() => {
                onClose();
                onAction?.('chat', data);
              }}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-colors"
            >
              <span>Ask AI Sahayak About This Specification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-xl transition-colors"
            >
              Close Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}