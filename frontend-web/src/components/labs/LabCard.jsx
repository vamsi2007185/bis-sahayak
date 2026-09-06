import React from 'react';
import { MapPin, Phone, Mail, Award, Navigation, Building2 } from 'lucide-react';

export default function LabCard({ lab }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <span className="bg-blue-50 text-blue-800 font-mono text-xs font-bold px-2 py-0.5 rounded-full border border-blue-200">
            {lab.distance_km} km away
          </span>
          {lab.is_bis_central_lab && (
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              BIS Central Lab
            </span>
          )}
        </div>

        <h4 className="font-bold text-slate-900 text-sm">{lab.lab_name}</h4>
        <p className="text-xs text-slate-500 flex items-start space-x-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span>{lab.address}, {lab.city}, {lab.state}</span>
        </p>
      </div>

      {/* Accreditation Scope Chips */}
      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center space-x-1.5 text-slate-600 font-semibold text-[11px]">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>NABL: {lab.nabl_accreditation_number}</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {lab.accredited_categories?.map((cat, idx) => (
            <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium capitalize">
              {cat.replace('_', ' ')}
            </span>
          ))}
        </div>

        <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
          {lab.contact_person && <div><strong>Contact:</strong> {lab.contact_person}</div>}
          {lab.phone && <div><strong>Phone:</strong> {lab.phone}</div>}
        </div>
      </div>

      <a
        href={lab.navigation_url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full mt-2 py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors border border-blue-200"
      >
        <Navigation className="w-3.5 h-3.5" />
        <span>Get Directions (Maps)</span>
      </a>
    </div>
  );
}
