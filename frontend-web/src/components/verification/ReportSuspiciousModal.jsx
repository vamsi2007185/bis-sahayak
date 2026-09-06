import React, { useState } from 'react';
import { X, AlertOctagon, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../../services/api';

export default function ReportSuspiciousModal({ isOpen, onClose }) {
  const [productName, setProductName] = useState('');
  const [cmlNumber, setCmlNumber] = useState('');
  const [brandName, setBrandName] = useState('');
  const [storeLocation, setStoreLocation] = useState('');
  const [description, setDescription] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productName.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.reportSuspicious({
        product_name: productName,
        cml_number: cmlNumber || null,
        brand_name: brandName || null,
        store_location: storeLocation || null,
        description,
        reporter_contact: reporterContact || null,
      });
      setSubmittedId(res.complaint_id);
    } catch (err) {
      alert('Failed to submit report. Please check connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setProductName('');
    setCmlNumber('');
    setBrandName('');
    setStoreLocation('');
    setDescription('');
    setReporterContact('');
    setSubmittedId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-scaleUp">
        <button
          onClick={resetForm}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedId ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Intake Report Prepared</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your suspicious mark report has been recorded with Tracking ID: <strong className="text-blue-700 font-mono">{submittedId}</strong>.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 text-left border border-slate-200">
              <strong>Notice:</strong> Please verify all facts before lodging a formal statutory complaint with the regional BIS branch or National Consumer Helpline.
            </div>
            <button
              onClick={resetForm}
              className="mt-2 px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="flex items-center space-x-2 text-red-600 font-bold text-sm">
              <ShieldAlert className="w-5 h-5" />
              <span>Report Suspicious / Fake ISI Mark</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Flag counterfeit goods, unauthorized mark usage, or suspicious packaging for consumer safety audit.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Pure Drops Bottled Water or Power Cord"
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">CM/L Number (if stamped)</label>
                  <input
                    type="text"
                    value={cmlNumber}
                    onChange={(e) => setCmlNumber(e.target.value)}
                    placeholder="e.g. 8400123456"
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="e.g. AquaJal"
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Store / Market Location</label>
                <input
                  type="text"
                  value={storeLocation}
                  onChange={(e) => setStoreLocation(e.target.value)}
                  placeholder="e.g. Retail Stall 4, Lajpat Nagar, New Delhi"
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Suspicion Details / Description *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe why you suspect counterfeit certification (e.g. smudged stamp, missing standard code, substandard build)..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Submit Report'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
