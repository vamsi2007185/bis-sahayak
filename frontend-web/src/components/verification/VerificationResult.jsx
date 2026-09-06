import React from 'react';
import { 
  ShieldCheck, AlertTriangle, XCircle, CheckCircle2, 
  Building2, Calendar, FileText, Download, Share2, AlertOctagon 
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function VerificationResult({ result, onReset, onSaveReport }) {
  if (!result) return null;

  const isSuccess = result.is_valid || result.authenticity_status === 'GENUINE_OPERATIVE';
  const isExpired = result.status === 'EXPIRED' || result.authenticity_status === 'EXPIRED_LICENSE';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
      {/* Header Banner */}
      <div className={`p-5 text-center ${
        isSuccess 
          ? 'bg-emerald-600 text-white' 
          : isExpired 
            ? 'bg-amber-600 text-white' 
            : 'bg-red-600 text-white'
      }`}>
        <div className="w-12 h-12 rounded-full bg-white/20 mx-auto flex items-center justify-center mb-2">
          {isSuccess ? (
            <CheckCircle2 className="w-7 h-7 text-white" />
          ) : isExpired ? (
            <AlertTriangle className="w-7 h-7 text-white" />
          ) : (
            <XCircle className="w-7 h-7 text-white" />
          )}
        </div>
        <h3 className="text-xl font-bold tracking-tight">
          {isSuccess 
            ? 'VERIFIED BIS CERTIFICATION' 
            : isExpired 
              ? 'EXPIRED BIS LICENSE' 
              : 'VERIFICATION FAILED / UNREGISTERED'}
        </h3>
        <p className="text-xs opacity-90 mt-1 max-w-md mx-auto">
          {isSuccess 
            ? 'This product bears an authenticated Bureau of Indian Standards CM/L certification.' 
            : result.consumer_advisory || result.advisory_notice || 'Could not verify authentic BIS license records.'}
        </p>
      </div>

      {/* Details Table */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block mb-1">CM/L Registration Number</span>
            <span className="font-mono font-bold text-sm text-slate-800">
              {result.cml_number || result.extracted_cml_number || 'Not Detected'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block mb-1">Applicable Indian Standard</span>
            <span className="font-bold text-sm text-blue-700">
              {result.standard_number || result.extracted_standard_id || 'Not Specified'}
            </span>
          </div>

          {result.manufacturer_name && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 sm:col-span-2">
              <span className="text-slate-400 block mb-1">Licensed Manufacturer</span>
              <span className="font-semibold text-slate-800 text-sm flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>{result.manufacturer_name}</span>
              </span>
              {result.factory_address && (
                <p className="text-slate-500 mt-1 text-[11px]">{result.factory_address}</p>
              )}
            </div>
          )}

          {result.brand_name && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block mb-1">Brand Name</span>
              <span className="font-semibold text-slate-800">{result.brand_name}</span>
            </div>
          )}

          {result.valid_up_to && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block mb-1">License Valid Until</span>
              <span className="font-semibold text-slate-800 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{result.valid_up_to}</span>
              </span>
            </div>
          )}
        </div>

        {/* Advisory Box */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs">
          <div className="font-bold text-slate-800 mb-1 flex items-center space-x-1.5">
            <AlertOctagon className="w-4 h-4 text-blue-600" />
            <span>BIS Consumer Safety Assessment</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            {result.advisory_notice || result.consumer_advisory || 'Always verify the authentic ISI mark on product packaging with the official BIS CARE portal before purchase.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          {onSaveReport && (
            <button
              onClick={onSaveReport}
              className="flex-1 min-w-[140px] px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center justify-center space-x-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Save Report</span>
            </button>
          )}
          <button
            onClick={onReset}
            className="flex-1 min-w-[140px] px-4 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-xs transition-colors text-center"
          >
            Scan Another Product
          </button>
        </div>
      </div>
    </div>
  );
}
