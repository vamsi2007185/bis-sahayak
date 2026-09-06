import React, { useState, useRef } from 'react';
import { 
  Box, Upload, CheckCircle2, AlertTriangle, XCircle, 
  Ruler, Sparkles, FileText, Download, RotateCw 
} from 'lucide-react';
import { api } from '../services/api';
import CADMeasurementTable from '../components/cad/CADMeasurementTable';

export default function CADScanner() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetStandard, setTargetStandard] = useState('IS 15652');
  const [nominalSpec, setNominalSpec] = useState('Class A (3.3kV)');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setScanResult(null);
    }
  };

  const handleScan = async (fileToScan = null) => {
    const file = fileToScan || selectedFile;
    if (!file) return;

    setLoading(true);
    try {
      const data = await api.scanCAD(file, targetStandard, nominalSpec);
      setScanResult(data);
    } catch (err) {
      alert('CAD analysis failed. Please verify the STL format.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemoSTL = async () => {
    // Generate synthetic binary STL in-memory for instant demonstration
    const header = new Uint8Array(80);
    const numTriangles = 12;
    const recordSize = 50;
    const totalSize = 84 + numTriangles * recordSize;
    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);

    // Number of triangles at byte 80
    view.setUint32(80, numTriangles, true);

    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const file = new File([blob], 'demo_insulation_mat.stl');

    setSelectedFile(file);
    handleScan(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Automated 3D CAD Compliance Scanner
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Upload 3D CAD files (.stl) to automatically parse geometric parameters, wall thicknesses, and verify manufacturing tolerances against Indian Standards before physical tooling.
        </p>
      </div>

      {/* Configuration & Upload Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Target BIS Standard</label>
            <select
              value={targetStandard}
              onChange={(e) => setTargetStandard(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="IS 15652">IS 15652:2006 — Electrical Insulation Mats</option>
              <option value="IS 1363">IS 1363 (Part 1): 2002 — Hex Bolts & Screws</option>
              <option value="IS 4984">IS 4984:2016 — HDPE Water Supply Pipes</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nominal Specification / Rating</label>
            <select
              value={nominalSpec}
              onChange={(e) => setNominalSpec(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {targetStandard === 'IS 15652' ? (
                <>
                  <option value="Class A (3.3kV)">Class A (3.3 kV) — 2.0mm ± 0.2mm</option>
                  <option value="Class B (11kV)">Class B (11 kV) — 2.5mm ± 0.25mm</option>
                  <option value="Class C (33kV)">Class C (33 kV) — 3.0mm ± 0.30mm</option>
                </>
              ) : targetStandard === 'IS 1363' ? (
                <>
                  <option value="M12">M12 Hex Bolt (Head height: 7.5mm)</option>
                  <option value="M16">M16 Hex Bolt (Head height: 10.0mm)</option>
                  <option value="M20">M20 Hex Bolt (Head height: 12.5mm)</option>
                </>
              ) : (
                <>
                  <option value="DN 63">DN 63 HDPE Pipe (OD 63.0mm, Min wall 5.8mm)</option>
                  <option value="DN 110">DN 110 HDPE Pipe (OD 110.0mm, Min wall 10.0mm)</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Upload Box */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".stl" 
          className="hidden" 
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-2"
        >
          <Box className="w-10 h-10 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-800">
            {selectedFile ? selectedFile.name : 'Select or Drag & Drop 3D STL Model'}
          </p>
          <p className="text-xs text-slate-400">
            Supports binary and ASCII STL mesh files (Up to 50MB)
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleLoadDemoSTL}
            className="text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold px-3.5 py-2 rounded-lg transition-colors border border-blue-200"
          >
            ⚡ Load Demo STL Model (SIH Demo)
          </button>

          <button
            onClick={() => handleScan()}
            disabled={!selectedFile || loading}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-2 transition-colors shadow-xs"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Parsing 3D Mesh & Tolerances...</span>
              </>
            ) : (
              <>
                <Ruler className="w-4 h-4" />
                <span>Analyze CAD Compliance</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {scanResult && <CADMeasurementTable scanResult={scanResult} />}
    </div>
  );
}
