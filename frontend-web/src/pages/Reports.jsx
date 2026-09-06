import React, { useState, useEffect } from 'react';
import { FileText, Download, Trash2, Eye, Plus, ShieldCheck, Box, Search } from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import ReportViewModal from '../components/reports/ReportViewModal';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filter, setFilter] = useState('all');

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await api.getReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Delete this report from your archive?')) {
      try {
        await api.deleteReport(id);
        setReports(reports.filter((r) => r.id !== id));
      } catch (err) {
        alert('Failed to delete report.');
      }
    }
  };

  const filtered = filter === 'all' 
    ? reports 
    : reports.filter((r) => r.report_type === filter);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Compliance & Verification Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">Formal technical analysis documents and verification history</p>
        </div>

        <div className="flex space-x-2 text-xs">
          {['all', 'cad_compliance', 'isi_verification', 'compliance_analysis'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${
                filter === t 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table/Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading reports...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No reports found in this category.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="p-5 hover:bg-slate-50/70 transition-colors flex flex-wrap items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs text-slate-400 font-bold">{r.id}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-bold text-slate-900">{r.title}</span>
                    <StatusBadge status={r.status} size="xs" />
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">{r.summary}</p>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                    <span>Date: {r.date}</span>
                    {r.standard_id && <span>Standard: {r.standard_id}</span>}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedReport(r)}
                    className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center space-x-1"
                    title="View Formal Report"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReportViewModal
        report={selectedReport}
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}
