import React, { useState, useRef } from 'react';
import { 
  Camera, Upload, Search, ShieldCheck, AlertCircle, 
  Sparkles, AlertOctagon, HelpCircle, CheckCircle2 
} from 'lucide-react';
import { api } from '../services/api';
import VerificationResult from '../components/verification/VerificationResult';
import ReportSuspiciousModal from '../components/verification/ReportSuspiciousModal';

export default function VerifyProduct() {
  const [activeMode, setActiveMode] = useState('photo'); // 'photo' | 'text'
  const [cmlInput, setCmlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [showSuspiciousModal, setShowSuspiciousModal] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setVerificationResult(null);
    }
  };

  const handleVerifyPhoto = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const data = await api.verifyPhoto(selectedFile);
      setVerificationResult(data);
    } catch (err) {
      alert('Failed to connect to OCR verification service.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyText = async (e) => {
    e.preventDefault();
    if (!cmlInput.trim()) return;
    setLoading(true);
    try {
      const data = await api.verifyISI(cmlInput.trim());
      setVerificationResult(data);
    } catch (err) {
      alert('Verification service unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReport = async () => {
    if (!verificationResult) return;
    try {
      await api.saveReport({
        id: `REP-ISI-${Date.now().toString().slice(-4)}`,
        title: `ISI Verification: ${verificationResult.brand_name || 'Product'} (${verificationResult.cml_number || 'CM/L'})`,
        report_type: 'isi_verification',
        date: new Date().toISOString().split('T')[0],
        status: verificationResult.is_valid ? 'VERIFIED' : 'UNVERIFIED',
        standard_id: verificationResult.standard_number || 'BIS Standard',
        summary: verificationResult.advisory_notice || verificationResult.consumer_advisory || 'Authenticity review completed.',
        details: verificationResult
      });
      alert('Verification report saved to your Reports archive!');
    } catch (err) {
      alert('Report saved locally.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Verify Product & ISI Certification
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Scan product packaging or enter the 7 to 10-digit CM/L license code to authenticate genuine BIS certification.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex rounded-xl bg-slate-200/70 p-1 text-xs font-semibold max-w-md mx-auto">
        <button
          onClick={() => { setActiveMode('photo'); setVerificationResult(null); }}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all ${
            activeMode === 'photo' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Photo-to-Standard (OCR)</span>
        </button>
        <button
          onClick={() => { setActiveMode('text'); setVerificationResult(null); }}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all ${
            activeMode === 'text' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Enter CM/L Number</span>
        </button>
      </div>

      {/* Main Card */}
      {!verificationResult && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          {activeMode === 'photo' ? (
            <div className="space-y-4">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />

              {!previewUrl ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/40 rounded-2xl p-10 text-center cursor-pointer transition-all space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Upload Product Label or ISI Mark Photo</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG, JPEG (Max 10MB)</p>
                  </div>
                  <span className="inline-block px-4 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 shadow-2xs">
                    Choose Photo
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-72 flex items-center justify-center bg-slate-900">
                    <img src={previewUrl} alt="Product Label Preview" className="max-h-72 object-contain" />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700"
                    >
                      Change Photo
                    </button>
                    <button
                      onClick={handleVerifyPhoto}
                      disabled={loading}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <Sparkles className="w-4 h-4 animate-spin" />
                          <span>Extracting CM/L via OCR...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Run Authentic Verification</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleVerifyText} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  BIS Certification Marks / License (CM/L) Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cmlInput}
                    onChange={(e) => setCmlInput(e.target.value)}
                    placeholder="e.g. CM/L-8400123456 or 8400123456"
                    className="w-full p-3.5 pr-12 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono text-sm outline-none"
                  />
                  <Search className="w-5 h-5 text-slate-400 absolute right-4 top-3.5" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  The CM/L number is a 7 to 10-digit number printed directly below or adjacent to the ISI stamp.
                </p>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setCmlInput('8400123456')}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-mono"
                >
                  Test Sample: 8400123456 (Active)
                </button>
                <button
                  type="button"
                  onClick={() => setCmlInput('9512345678')}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-mono"
                >
                  Test Sample: 9512345678 (Expired)
                </button>
              </div>

              <button
                type="submit"
                disabled={!cmlInput.trim() || loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-colors"
              >
                {loading ? 'Verifying with BIS Registry...' : 'Verify License Authenticity'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Result Display */}
      {verificationResult && (
        <VerificationResult
          result={verificationResult}
          onReset={() => {
            setVerificationResult(null);
            setSelectedFile(null);
            setPreviewUrl(null);
            setCmlInput('');
          }}
          onSaveReport={handleSaveReport}
        />
      )}

      {/* Citizen Vigilance Notice */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between">
        <div className="space-y-0.5 text-xs text-slate-700">
          <span className="font-bold block">Suspect a Fake or Counterfeit ISI Mark?</span>
          <span className="text-slate-500">Report unauthorized mark usage to initiate verification audit.</span>
        </div>
        <button
          onClick={() => setShowSuspiciousModal(true)}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shrink-0"
        >
          Report Suspicious Product
        </button>
      </div>

      <ReportSuspiciousModal
        isOpen={showSuspiciousModal}
        onClose={() => setShowSuspiciousModal(false)}
      />
    </div>
  );
}
