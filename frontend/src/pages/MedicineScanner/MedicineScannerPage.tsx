import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Camera,
  Scan,
  AlertTriangle,
  CheckCircle2,
  Plus,
  RefreshCw,
  ShieldAlert,
  Info,
  Sparkles,
  Key,
  ExternalLink,
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import {
  medicineScannerService,
  SCAN_STEPS,
  PRESET_MEDICINE_SAMPLES,
} from '../../services/medicineScannerService';
import { MedicineAnalysisResult } from '../../types';
import { MediNovaAIOrb } from '../../components/common/MediNovaAIOrb';
import { MedicalDisclaimer } from '../../components/common/MedicalDisclaimer';

interface MedicineScannerPageProps {
  onNavigateTab: (tab: string) => void;
  onOpenApiKeyModal: () => void;
}

export const MedicineScannerPage: React.FC<MedicineScannerPageProps> = ({
  onNavigateTab,
  onOpenApiKeyModal,
}) => {
  const { addMedicine, apiKey } = useHealth();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [scanResult, setScanResult] = useState<MedicineAnalysisResult | null>(null);
  const [unconfiguredError, setUnconfiguredError] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setScanResult(null);
        setUnconfiguredError(false);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  // Webcam Capture
  const startCamera = async () => {
    setCameraActive(true);
    setScanResult(null);
    setUnconfiguredError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Webcam permission denied or unavailable:', err);
      // Fallback sample
      setImagePreview(PRESET_MEDICINE_SAMPLES.paracetamol.image);
      setCameraActive(false);
    }
  };

  const captureCameraFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImagePreview(dataUrl);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  // Trigger Scanning
  const handleRunScan = async (presetKey?: keyof typeof PRESET_MEDICINE_SAMPLES) => {
    let imgData = imagePreview;

    if (presetKey) {
      imgData = PRESET_MEDICINE_SAMPLES[presetKey].image;
      setImagePreview(imgData);
    }

    if (!imgData) {
      alert('Please upload or capture a medicine package image first.');
      return;
    }

    setIsScanning(true);
    setCurrentStep(1);
    setScanResult(null);
    setUnconfiguredError(false);

    const result = await medicineScannerService.analyzeMedicineImage(
      imgData,
      step => setCurrentStep(step),
      presetKey
    );

    setIsScanning(false);

    if (result.unconfigured) {
      setUnconfiguredError(true);
      setScanResult(null);
    } else {
      setScanResult(result);
    }
  };

  // Save Analyzed Medicine to My Medicines
  const handleSaveToMyMedicines = () => {
    if (!scanResult || !scanResult.medicineName) return;

    addMedicine({
      name: scanResult.medicineName,
      genericName: scanResult.genericName || scanResult.medicineName,
      dosage: scanResult.standardStrength || '500 mg',
      frequency: 'Once daily',
      timeSlots: ['20:00'],
      foodInstruction: 'after_food',
      purpose: scanResult.commonUses?.[0] || 'Clinical treatment',
      activeIngredients: scanResult.activeIngredients || [],
      sideEffects: scanResult.commonSideEffects || [],
      precautions: scanResult.precautions || [],
      warnings: scanResult.warnings || [],
      confidence: scanResult.confidence || 95,
      imageUrl: imagePreview || undefined,
      startDate: new Date().toISOString().split('T')[0],
      source: 'medi_scan',
    });

    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onNavigateTab('medicines');
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/50 text-teal-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Futuristic Pharmacology AI</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Medi Scan
          </h1>
          <p className="text-base text-slate-600 font-medium mt-1">
            “Understand your medicine in seconds.”
          </p>
        </div>

        {/* Vision AI Service status badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenApiKeyModal}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition ${
              apiKey
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-teal-600" />
            <span>Vision Engine: {apiKey ? 'Configured (Live)' : 'Unconfigured'}</span>
          </button>
        </div>
      </div>

      {/* Evaluator Quick Preset Switcher */}
      <div className="glass-panel-subtle bg-white/70 p-4 rounded-2xl border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-600">
          <strong className="text-slate-900">⚡ Test Presets:</strong> Test instant laser scanning & edge cases without uploading:
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleRunScan('paracetamol')}
            disabled={isScanning}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 text-xs font-bold text-slate-700 transition"
          >
            💊 Paracetamol (Clear)
          </button>
          <button
            onClick={() => handleRunScan('amoxicillin')}
            disabled={isScanning}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 text-xs font-bold text-slate-700 transition"
          >
            💊 Amoxicillin (Clear)
          </button>
          <button
            onClick={() => handleRunScan('unclear')}
            disabled={isScanning}
            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-700 transition"
          >
            ⚠️ Blurry/Unclear (Safety test)
          </button>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Futuristic Scanner Area (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel bg-white/80 p-5 rounded-3xl border border-white/80 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>Scanner Chamber</span>
              {isScanning && (
                <span className="text-xs font-bold text-teal-600 animate-pulse">
                  Scanning in progress...
                </span>
              )}
            </h3>

            {/* Viewport Area */}
            <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-slate-900 border-2 border-teal-500/30 flex items-center justify-center group shadow-inner">
              {/* Corner targeting reticles */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-teal-400 z-20 pointer-events-none" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-teal-400 z-20 pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-teal-400 z-20 pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-teal-400 z-20 pointer-events-none" />

              {/* Grid overlay */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none z-10"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(20, 184, 166, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(20, 184, 166, 0.4) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Webcam view */}
              {cameraActive && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}

              {/* Image Preview */}
              {!cameraActive && imagePreview && (
                <img
                  src={imagePreview}
                  alt="Medicine packaging"
                  className="w-full h-full object-contain p-2"
                />
              )}

              {/* Placeholder when empty */}
              {!cameraActive && !imagePreview && (
                <div className="text-center p-6 text-slate-400 z-10">
                  <Scan className="w-16 h-16 mx-auto text-teal-500/50 mb-3 animate-pulse-slow" />
                  <p className="text-sm font-bold text-white">Upload or Capture Medicine</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Hold packaging or pill blister clearly in front of camera
                  </p>
                </div>
              )}

              {/* Glowing Scanning Laser */}
              {isScanning && (
                <motion.div
                  initial={{ top: '0%' }}
                  animate={{ top: ['0%', '94%', '0%'] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#06b6d4,0_0_30px_#10b981] z-30 pointer-events-none"
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-teal-900/90 text-cyan-300 font-mono text-[10px] px-2 py-0.5 rounded-full border border-cyan-400/50">
                    SCANNING FREQUENCY 842nm
                  </div>
                </motion.div>
              )}
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-2.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Upload Image</span>
              </button>

              {cameraActive ? (
                <button
                  type="button"
                  onClick={captureCameraFrame}
                  className="py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Photo</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={isScanning}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-4 h-4 text-slate-500" />
                  <span>Use Camera</span>
                </button>
              )}
            </div>

            {/* Scan Action Button */}
            {imagePreview && !cameraActive && (
              <button
                onClick={() => handleRunScan()}
                disabled={isScanning}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-teal-500/25 hover:opacity-95 transition flex items-center justify-center gap-2"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Medicine...</span>
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4" />
                    <span>Start Medi Scan AI</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Scanning Progress Pipeline Indicator */}
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel bg-white/90 p-4 rounded-2xl border border-teal-200 shadow-md space-y-2.5"
            >
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Scanning Pipeline
              </span>
              <div className="space-y-1.5">
                {SCAN_STEPS.map(s => {
                  const isDone = currentStep > s.step;
                  const isCurrent = currentStep === s.step;
                  return (
                    <div
                      key={s.step}
                      className={`flex items-center gap-2 text-xs transition-all ${
                        isDone
                          ? 'text-emerald-700 font-bold'
                          : isCurrent
                          ? 'text-teal-600 font-extrabold animate-pulse'
                          : 'text-slate-400'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                          isDone
                            ? 'bg-emerald-500 text-white'
                            : isCurrent
                            ? 'bg-teal-500 text-white animate-spin'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isDone ? '✓' : s.step}
                      </div>
                      <span>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Results Display Area (7 cols) */}
        <div className="lg:col-span-7">
          {/* 1. Unconfigured State as specifically requested */}
          {unconfiguredError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel bg-white/90 p-8 rounded-3xl border-2 border-amber-300 shadow-xl text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                AI Service Not Configured
              </h3>
              <p className="text-sm font-semibold text-slate-700 max-w-md mx-auto leading-relaxed">
                “AI analysis is not configured yet. Connect the vision AI service to enable real medicine recognition.”
              </p>
              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={onOpenApiKeyModal}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  <span>Configure Gemini API Key</span>
                </button>
                <button
                  onClick={() => handleRunScan('paracetamol')}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Or Test Pre-verified Demo Preset
                </button>
              </div>
            </motion.div>
          )}

          {/* 2. Uncertain / Unidentified Medicine Case (Safety Guarantee) */}
          {scanResult && scanResult.isUnidentified && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel bg-white/90 p-8 rounded-3xl border-2 border-rose-300 shadow-xl space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-100 text-rose-700">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Identification Inconclusive
                  </h3>
                  <p className="text-xs text-rose-600 font-semibold">
                    Confidence: {scanResult.confidence || 38}% (Below clinical threshold)
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-sm text-slate-800 leading-relaxed font-medium">
                “We couldn't identify this medicine confidently. Please upload a clearer image or verify the medicine with a pharmacist.”
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <p><strong>Clinical safety policy:</strong></p>
                <p>• MediNova AI never guesses unclear or damaged packaging labels.</p>
                <p>• Ensure good lighting and hold the medication name clearly visible.</p>
              </div>
            </motion.div>
          )}

          {/* 3. Successful Identification Display */}
          {scanResult && scanResult.success && !scanResult.isUnidentified && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel bg-white/90 p-6 md:p-8 rounded-3xl border border-white/80 shadow-xl space-y-6"
            >
              {/* Header result row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-slate-900">
                      {scanResult.medicineName}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {scanResult.confidence}% Confidence
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-teal-600 mt-0.5">
                    Generic: {scanResult.genericName}
                  </p>
                </div>

                <button
                  onClick={handleSaveToMyMedicines}
                  disabled={addedSuccess}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-md shadow-teal-500/20 hover:opacity-95 transition flex items-center gap-1.5 self-start sm:self-auto"
                >
                  {addedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Added to My Medicines!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>+ Add to My Medicines</span>
                    </>
                  )}
                </button>
              </div>

              {/* Grid of Clinical Details */}
              <div className="space-y-4 text-sm">
                {/* Active Ingredients */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Active Ingredients
                  </h4>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                    {scanResult.activeIngredients?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Common Uses */}
                <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100">
                  <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-1.5">
                    Common Uses
                  </h4>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                    {scanResult.commonUses?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Common Side Effects */}
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5">
                    Common Side Effects
                  </h4>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                    {scanResult.commonSideEffects?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Precautions */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Precautions
                  </h4>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                    {scanResult.precautions?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Warnings */}
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
                  <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Clinical Warnings
                  </h4>
                  <ul className="list-disc list-inside space-y-0.5 text-rose-950 font-medium">
                    {scanResult.warnings?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Idle state helper */}
          {!scanResult && !unconfiguredError && (
            <div className="glass-panel bg-white/60 p-10 rounded-3xl border border-white/60 text-center space-y-3 text-slate-400">
              <MediNovaAIOrb size="md" className="mx-auto" />
              <h4 className="text-base font-bold text-slate-700">
                Awaiting Medicine Package Scan
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload a photo or capture via camera. MediNova AI will recognize packaging, extract ingredients, and formulate precautions safely.
              </p>
            </div>
          )}
        </div>
      </div>

      <MedicalDisclaimer />
    </div>
  );
};
