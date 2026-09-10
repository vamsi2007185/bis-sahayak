import React, { useState } from 'react';
import { 
  MessageSquare, ShieldCheck, Box, MapPin, Bell, 
  ArrowRight, ShieldAlert, CheckCircle2, AlertTriangle, 
  FileText, Sparkles, Building2, UserCheck, Search,
  TrendingUp, Activity, Layers, ArrowUpRight, Gauge,
  Shield, Check, ExternalLink
} from 'lucide-react';
import { useUserMode } from '../context/UserModeContext';
import { useLanguage } from '../context/LanguageContext';
import StatusBadge from '../components/common/StatusBadge';
import TelemetryMapCard from '../components/dashboard/TelemetryMapCard';
import UnitInspectionCard from '../components/dashboard/UnitInspectionCard';
import SlideOverDrawer from '../components/dashboard/SlideOverDrawer';

// Sample Haulix-Style Compliance Unit Telemetry Records
const SAMPLE_INSPECTION_UNITS = [
  {
    id: 'UNIT-LPT-2026',
    title: 'Portable IT Equipment & Laptops',
    standard_id: 'IS 13252 (Part 1): 2010',
    scheme: 'Scheme-II (CRS)',
    status: 'COMPLIANT',
    validity: 'Active CRS Registration',
    measured: 'Dielectric: 1.5 kV Pass',
    nominal: 'Max Leakage < 0.25 mA',
    deviation: 'Leakage Current 0.12 mA (Safe)',
    progressPct: 96,
    summary: 'MeitY Phase-I Compulsory Registration verified. Fire retardant UL94 V-0 enclosure and secondary lithium cell IS 16046 test certificates compliant.',
    clause: 'IS 13252 (Part 1): 2010 Clause 1.2 & Clause 4.3',
    clauseTitle: 'General Safety & Electrical Insulation Requirements',
    lab: 'BIS Western Regional Laboratory (WRL), Mumbai'
  },
  {
    id: 'UNIT-MAT-4011',
    title: 'Class A Electrical Insulation Mat',
    standard_id: 'IS 15652:2006',
    scheme: 'Scheme-I (ISI Mark)',
    status: 'COMPLIANT',
    validity: 'Verified Operative',
    measured: 'Thickness: 2.05 mm',
    nominal: '2.00 mm (1.8 - 2.2 mm)',
    deviation: '+0.05 mm (Within ±0.20 mm)',
    progressPct: 92,
    summary: 'Pre-tooling 3D CAD mesh scan verified. Measured wall thickness 2.05 mm conforms to Class A 3.3 kV nominal tolerance criteria.',
    clause: 'IS 15652:2006 Clause 6.1 & Table 1',
    clauseTitle: 'Insulating Mats Dimensional Tolerances',
    lab: 'BIS Central Laboratory (CL), Sahibabad'
  },
  {
    id: 'UNIT-WTR-8821',
    title: 'Packaged Drinking Water (AquaJal)',
    standard_id: 'IS 10500:2012',
    scheme: 'Scheme-I (ISI Mark)',
    status: 'COMPLIANT',
    validity: 'CM/L-8400123 Operative',
    measured: 'TDS: 142 mg/L',
    nominal: 'Acceptable < 500 mg/L',
    deviation: 'Optimal Mineral Balance',
    progressPct: 98,
    summary: 'Water testing parameters verified against 48 chemical, bacteriological, and pesticide residue limits under IS 10500 and IS 14543.',
    clause: 'IS 10500:2012 Table 1 & Clause 4.2',
    clauseTitle: 'Drinking Water Quality Limits',
    lab: 'National Test House (NTH), Chennai'
  },
  {
    id: 'UNIT-BLT-5092',
    title: 'Hexagon Head Bolts M12 Grade C',
    standard_id: 'IS 1363 (Part 1): 2019',
    scheme: 'Scheme-I (ISI Mark)',
    status: 'ACTION_REQUIRED',
    validity: 'Batch Review Pending',
    measured: 'Head Height: 7.92 mm',
    nominal: '7.5 mm (7.05 - 7.95 mm)',
    deviation: '+0.42 mm (Near Upper Limit)',
    progressPct: 82,
    summary: 'Dimension head height is approaching upper boundary of Grade C tolerance. Calibration of forging dies recommended before next lot production.',
    clause: 'IS 1363 (Part 1): 2019 Table 2',
    clauseTitle: 'Hex Head Dimensions & Tolerances',
    lab: 'National Test House, Kolkata'
  }
];

export default function Dashboard({ onNavigate, reports = [], amendments = [] }) {
  const { isMSME } = useUserMode();
  const { t } = useLanguage();
  const [selectedDrawerItem, setSelectedDrawerItem] = useState(null);

  const handleAction = (actionType, item) => {
    if (actionType === 'chat') {
      onNavigate('chat');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-10">
      {/* 1. Haulix-Style KPI Metric Shelf */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Standards */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Standards
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12.4%
            </span>
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">148</span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">Gazetted Specs</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Covers Electrotechnical, Mechanical, Chemical, and Civil branches.
          </p>
        </div>

        {/* Metric 2: Audits & Scans */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Compliance Audits
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              98.4% Pass
            </span>
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">1,420</span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">Verified Units</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            CAD scans and laboratory test assessments completed.
          </p>
        </div>

        {/* Metric 3: Lab Network */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Testing Laboratories
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
              Live Network
            </span>
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">42</span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">NABL Accredited</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Active regional hubs supporting BIS Scheme-I test protocols.
          </p>
        </div>

        {/* Metric 4: Regulatory Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Gazette QCO Alerts
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Action Req.
            </span>
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">3</span>
            <span className="text-xs text-slate-400 ml-1.5 font-medium">Pending Deadlines</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Mandatory amendments scheduled for enforcement this quarter.
          </p>
        </div>
      </div>

      {/* 2. National Testing Network Telemetry Card (Haulix-Style Central Interactive Map) */}
      <TelemetryMapCard onNavigate={onNavigate} />

      {/* 3. Card-Based Compliance Inspection Units Grid (Haulix Driver/Fleet Card Pattern) */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Active Compliance Inspection Telemetry
            </h3>
            <p className="text-xs text-slate-500">
              Real-time monitoring of audited batches, dimensional tolerances, and CM/L certification
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Click any card for full telemetry drawer:</span>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>View All Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAMPLE_INSPECTION_UNITS.map((unit) => (
            <UnitInspectionCard 
              key={unit.id} 
              unit={unit} 
              onSelect={(u) => setSelectedDrawerItem(u)} 
            />
          ))}
        </div>
      </div>

      {/* 4. Quick Actions & Tools */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-slate-900">Operational Tools & Quick Launch</h4>
          <span className="text-xs text-slate-400">SIH 2026 Core Protocols</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate('chat')}
            className="p-3 bg-white border border-slate-200 hover:border-blue-500 hover:shadow-xs rounded-xl text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900">AI Sahayak RAG</div>
            <span className="text-[10px] text-slate-500 block">Ask technical queries</span>
          </button>

          <button
            onClick={() => onNavigate('verify')}
            className="p-3 bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-xs rounded-xl text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900">Verify Product</div>
            <span className="text-[10px] text-slate-500 block">Check CM/L license</span>
          </button>

          <button
            onClick={() => onNavigate(isMSME ? 'cad' : 'verify')}
            className="p-3 bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-xs rounded-xl text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Box className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900">{isMSME ? '3D CAD Scanner' : 'Photo OCR'}</div>
            <span className="text-[10px] text-slate-500 block">{isMSME ? 'Check tolerances' : 'Scan ISI stamp'}</span>
          </button>

          <button
            onClick={() => onNavigate('labs')}
            className="p-3 bg-white border border-slate-200 hover:border-amber-500 hover:shadow-xs rounded-xl text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900">Find Testing Lab</div>
            <span className="text-[10px] text-slate-500 block">Geo-proximity router</span>
          </button>
        </div>
      </div>

      {/* 5. Slide-Over Detail Drawer (Progressive Disclosure) */}
      <SlideOverDrawer 
        isOpen={Boolean(selectedDrawerItem)} 
        onClose={() => setSelectedDrawerItem(null)} 
        data={selectedDrawerItem}
        onAction={handleAction}
      />
    </div>
  );
}