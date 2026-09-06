import React from 'react';
import { X, AlertTriangle, CheckCircle2, FileText, Calendar, Building2, Download } from 'lucide-react';

export default function ImpactSummaryModal({ amendment, isOpen, onClose }) {
  if (!isOpen || !amendment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative animate-scaleUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4 text-xs">
          <div className="flex items-center space-x-2 text-amber-600 font-bold text-sm">
            <Building2 className="w-5 h-5" />
            <span>HOW THIS AMENDMENT IMPACTS YOUR BUSINESS</span>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900">
            <div className="font-bold text-sm">{amendment.standard_id} — {amendment.amendment_id}</div>
            <p className="text-[11px] text-blue-800 mt-0.5">{amendment.standard_title}</p>
          </div>

          {/* Key Changes Checklist */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-xs">Compliance Delta Checklist</h4>
            
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Existing License Validity:</strong>
                  <p className="text-slate-600 text-[11px]">Existing operative CM/L licenses remain recognized through transition deadline ({amendment.compliance_deadline}).</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Testing Procedure Change:</strong>
                  <p className="text-slate-600 text-[11px]">{amendment.delta_summary}</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Factory Quality Documentation:</strong>
                  <p className="text-slate-600 text-[11px]">{amendment.action_required}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl text-[11px]">
            <div>
              <span className="text-slate-400 block">Effective Gazette Date</span>
              <strong className="text-slate-800">{amendment.effective_date}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Transition Deadline</span>
              <strong className="text-red-700">{amendment.compliance_deadline}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Gazette ID</span>
              <strong className="font-mono text-slate-700">{amendment.gazette_notification_number}</strong>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium"
            >
              Close
            </button>
            <button
              onClick={() => {
                alert('Downloading compliance checklist PDF summary...');
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Impact Brief</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
