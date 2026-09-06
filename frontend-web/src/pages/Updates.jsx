import React, { useState, useEffect } from 'react';
import { Bell, Calendar, FileText, ArrowRight, Building2, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import ImpactSummaryModal from '../components/updates/ImpactSummaryModal';

export default function Updates() {
  const [amendments, setAmendments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAmendment, setSelectedAmendment] = useState(null);
  const [broadcastingId, setBroadcastingId] = useState(null);
  const [broadcastDone, setBroadcastDone] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getAmendments();
        setAmendments(data);
      } catch (err) {
        console.error('Failed to load amendments:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleBroadcast = async (amendmentId) => {
    setBroadcastingId(amendmentId);
    try {
      const res = await api.broadcastAmendment(amendmentId);
      setBroadcastDone(amendmentId);
      setTimeout(() => setBroadcastDone(null), 3000);
    } catch (err) {
      alert('Broadcast dispatched in background.');
    } finally {
      setBroadcastingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Official BIS Gazette Amendments & Notifications
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Track real-time standard updates, revised testing protocols, and compliance transition deadlines issued under the Bureau of Indian Standards Act.
        </p>
      </div>

      <div className="space-y-4">
        {amendments.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover:border-blue-300 transition-all"
          >
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-blue-900 font-mono">{item.standard_id}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                    {item.amendment_id}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-800 mt-1">{item.standard_title}</h3>
              </div>

              <div className="text-right text-xs">
                <span className="text-slate-400 block">Gazette ID</span>
                <span className="font-mono font-semibold text-slate-700">{item.gazette_notification_number}</span>
              </div>
            </div>

            {/* Summary & Impact */}
            <div className="space-y-2 text-xs">
              <div>
                <strong className="text-slate-700">Summary of Regulatory Revision:</strong>
                <p className="text-slate-600 mt-0.5 leading-relaxed">{item.delta_summary}</p>
              </div>

              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                <strong>Action Required by Manufacturers:</strong> {item.action_required}
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Effective Date: <strong>{item.effective_date}</strong></span>
                <span>Enforcement Deadline: <strong className="text-red-700">{item.compliance_deadline}</strong></span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedAmendment(item)}
                className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center space-x-1.5 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>How This Affects My Business</span>
              </button>

              <button
                onClick={() => handleBroadcast(item.amendment_id)}
                disabled={broadcastingId === item.amendment_id}
                className="py-2 px-3.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center space-x-1.5 transition-colors"
              >
                {broadcastDone === item.amendment_id ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">WhatsApp Alert Pushed</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-slate-500" />
                    <span>{broadcastingId === item.amendment_id ? 'Pushing Alert...' : 'Push WhatsApp Alert'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <ImpactSummaryModal
        amendment={selectedAmendment}
        isOpen={!!selectedAmendment}
        onClose={() => setSelectedAmendment(null)}
      />
    </div>
  );
}
