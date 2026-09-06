import React from 'react';
import { ShieldCheck, BookOpen, ExternalLink, FileText } from 'lucide-react';

export default function CitationCard({ citation, standardId, clause, page, title, verified = true }) {
  return (
    <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3 text-xs text-slate-800 shadow-2xs hover:border-blue-300 transition-all">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-1.5 text-blue-900 font-bold">
          <BookOpen className="w-3.5 h-3.5 text-blue-700" />
          <span>{standardId || citation || 'Official Indian Standard'}</span>
        </div>
        {verified ? (
          <span className="flex items-center space-x-1 text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3 text-emerald-700" />
            <span>Verified BIS Source</span>
          </span>
        ) : (
          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
            Source requires verification
          </span>
        )}
      </div>

      <div className="text-slate-600 space-y-0.5 font-mono text-[11px]">
        {clause && <div><strong>Clause:</strong> {clause}</div>}
        {title && <div className="text-slate-700 font-sans"><strong>Specification:</strong> {title}</div>}
        {page && <div><strong>Page Reference:</strong> {page}</div>}
      </div>
    </div>
  );
}
