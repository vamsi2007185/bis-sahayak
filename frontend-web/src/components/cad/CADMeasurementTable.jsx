import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Box, Ruler } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

export default function CADMeasurementTable({ scanResult }) {
  if (!scanResult) return null;

  const isCompliant = scanResult.compliance_status === 'COMPLIANT';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <Box className="w-5 h-5 text-blue-700" />
            <h3 className="font-bold text-base text-slate-900">
              3D CAD Compliance Analysis: {scanResult.filename}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Standard: <strong className="text-blue-700">{scanResult.target_standard}</strong> • Spec: {scanResult.component_category}
          </p>
        </div>

        <StatusBadge 
          status={scanResult.compliance_status} 
          text={isCompliant ? 'COMPLIANT (PASS)' : scanResult.compliance_status} 
        />
      </div>

      {/* Geometry Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-slate-400 block text-[11px]">X Length</span>
          <span className="font-mono font-bold text-sm text-slate-800">
            {scanResult.bounding_box_mm?.x_length_mm} mm
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-slate-400 block text-[11px]">Y Width</span>
          <span className="font-mono font-bold text-sm text-slate-800">
            {scanResult.bounding_box_mm?.y_width_mm} mm
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-slate-400 block text-[11px]">Z Thickness</span>
          <span className="font-mono font-bold text-sm text-blue-700">
            {scanResult.bounding_box_mm?.z_height_mm} mm
          </span>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-slate-400 block text-[11px]">Enclosed Volume</span>
          <span className="font-mono font-bold text-sm text-slate-800">
            {scanResult.volume_mm3} mm³
          </span>
        </div>
      </div>

      {/* Deviations Table */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
          <Ruler className="w-3.5 h-3.5" />
          <span>Dimensional Tolerance Analysis</span>
        </h4>

        {scanResult.deviations && scanResult.deviations.length > 0 ? (
          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3">Parameter</th>
                  <th className="p-3">Standard Limit</th>
                  <th className="p-3">Actual Measured</th>
                  <th className="p-3">Delta</th>
                  <th className="p-3">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {scanResult.deviations.map((d, i) => (
                  <tr key={i} className="hover:bg-slate-50/60">
                    <td className="p-3 font-medium text-slate-900">{d.parameter}</td>
                    <td className="p-3 font-mono">{d.required_range || d.expected}</td>
                    <td className="p-3 font-mono font-semibold text-blue-700">{d.measured} mm</td>
                    <td className="p-3 font-mono font-bold text-red-600">{d.delta_mm}</td>
                    <td className="p-3">
                      <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-semibold text-[10px]">
                        {d.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-200 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All extracted dimensions conform within tolerance bounds specified by {scanResult.target_standard}.</span>
          </div>
        )}
      </div>

      {/* Engineering Recommendation */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <strong className="text-slate-800 block mb-1">Pre-Tooling Recommendation:</strong>
        <p className="text-slate-600 leading-relaxed">{scanResult.recommendation}</p>
        <span className="text-[11px] font-mono text-blue-700 block mt-2">
          Ref: {scanResult.standard_clause_ref}
        </span>
      </div>
    </div>
  );
}
