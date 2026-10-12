import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Pill,
  Clock,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Edit2,
  Check,
} from 'lucide-react';
import { healthApi, Prescription, PrescriptionMedicineItem } from '../../services/healthApi';

export const PrescriptionScannerPage: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [currentPrescription, setCurrentPrescription] = useState<Prescription | null>(null);
  const [items, setItems] = useState<PrescriptionMedicineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmationSuccess, setConfirmationSuccess] = useState<string | null>(null);

  const fetchPrescriptions = async () => {
    try {
      const data = await healthApi.getPrescriptions();
      setPrescriptions(data);
      if (data.length > 0 && !currentPrescription) {
        setCurrentPrescription(data[0]);
        setItems(data[0].medicines || []);
      }
    } catch (e) {
      console.warn('Error fetching prescriptions:', e);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    try {
      setLoading(true);
      setConfirmationSuccess(null);
      await healthApi.uploadDocument(file, 'prescription');
      await fetchPrescriptions();
    } catch (err: any) {
      alert(err.message || 'Prescription upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (index: number, field: keyof PrescriptionMedicineItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleConfirmSchedule = async () => {
    if (!currentPrescription) return;
    try {
      setConfirming(true);
      const res = await healthApi.confirmPrescription(currentPrescription.id, items);
      setConfirmationSuccess(res.message || 'Prescription confirmed and added to active schedules!');
      fetchPrescriptions();
    } catch (err: any) {
      alert(err.message || 'Confirmation failed');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#F4F7FA] tracking-tight flex items-center gap-2.5">
          <Receipt className="w-6 h-6 text-[#00D084]" />
          Prescription Scanner & Clinical Extraction
        </h1>
        <p className="text-xs text-[#9BAAB6] mt-1">
          Extracts medication names, strengths, frequencies, and food instructions. Requires explicit clinical confirmation before adding to active schedules.
        </p>
      </div>

      {/* Upload & Select Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Upload box */}
        <div className="md:col-span-5 glass-panel-dark rounded-3xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#F4F7FA]">Scan New Prescription</h2>
          <label className="border-2 border-dashed border-[#203039] hover:border-[#00D084]/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition bg-[#0A1118]/60">
            <input
              type="file"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
            />
            {loading ? (
              <div className="space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-[#00D084] mx-auto" />
                <span className="text-xs font-bold text-[#00D084] block">Parsing clinical handwriting...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#111F28] border border-[#203039] flex items-center justify-center text-[#00D084] mx-auto">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#F4F7FA] block">Upload Rx Image or PDF</span>
                <span className="text-[10px] text-[#9BAAB6] block">Tesseract OCR with clinical entity extractor</span>
              </div>
            )}
          </label>

          {/* Previous Prescriptions Selector */}
          {prescriptions.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#203039]">
              <span className="text-[10px] uppercase font-bold text-[#9BAAB6]">Previous Prescriptions:</span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {prescriptions.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setCurrentPrescription(p);
                      setItems(p.medicines || []);
                      setConfirmationSuccess(null);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition ${
                      currentPrescription?.id === p.id
                        ? 'bg-[#111F28] text-[#00D084] border border-[#00D084]/40 font-bold'
                        : 'bg-[#0D171F] text-[#9BAAB6] hover:text-[#F4F7FA] border border-[#203039]'
                    }`}
                  >
                    <span className="truncate">{p.doctor_name || 'Rx Prescription'}</span>
                    <span className="text-[10px] font-mono text-[#9BAAB6]">
                      {p.is_verified ? 'Confirmed' : 'Pending Review'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Prescription Verification & Human-in-the-Loop Review */}
        <div className="md:col-span-7 glass-panel-dark rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#203039]">
            <div>
              <h2 className="text-sm font-bold text-[#F4F7FA]">
                Extracted Medication Items ({items.length})
              </h2>
              <p className="text-[11px] text-[#9BAAB6]">
                Review all fields before confirming. You can adjust dosage or timing.
              </p>
            </div>
            {currentPrescription?.is_verified && (
              <span className="px-2.5 py-1 rounded-full bg-[#00D084]/15 text-[#00D084] text-[10px] font-bold border border-[#00D084]/30 flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Confirmed & Active</span>
              </span>
            )}
          </div>

          {items.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#9BAAB6] space-y-2">
              <Pill className="w-8 h-8 text-[#203039] mx-auto" />
              <p>Upload a prescription on the left to extract medication instructions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#111F28] border border-[#203039] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.medicine_name}
                        onChange={(e) => handleFieldChange(idx, 'medicine_name', e.target.value)}
                        className="bg-transparent text-sm font-bold text-[#F4F7FA] border-b border-[#203039] focus:border-[#00D084] outline-none"
                      />
                      <input
                        type="text"
                        value={item.strength || ''}
                        onChange={(e) => handleFieldChange(idx, 'strength', e.target.value)}
                        placeholder="Strength"
                        className="w-20 bg-[#0D171F] px-2 py-0.5 rounded text-[10px] text-[#9BAAB6] border border-[#203039] outline-none"
                      />
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#00D084]/10 text-[#00D084] font-bold">
                      Confidence: {Math.round(item.confidence * 100)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-[#9BAAB6] block">Dose:</span>
                      <input
                        type="text"
                        value={item.dose}
                        onChange={(e) => handleFieldChange(idx, 'dose', e.target.value)}
                        className="w-full bg-[#0D171F] px-2 py-1 rounded text-xs text-[#F4F7FA] border border-[#203039] outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#9BAAB6] block">Frequency:</span>
                      <input
                        type="text"
                        value={item.frequency}
                        onChange={(e) => handleFieldChange(idx, 'frequency', e.target.value)}
                        className="w-full bg-[#0D171F] px-2 py-1 rounded text-xs text-[#F4F7FA] border border-[#203039] outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#9BAAB6] block">Duration:</span>
                      <input
                        type="text"
                        value={item.duration}
                        onChange={(e) => handleFieldChange(idx, 'duration', e.target.value)}
                        className="w-full bg-[#0D171F] px-2 py-1 rounded text-xs text-[#F4F7FA] border border-[#203039] outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#9BAAB6] block">Food:</span>
                      <select
                        value={item.food_instructions}
                        onChange={(e) => handleFieldChange(idx, 'food_instructions', e.target.value)}
                        className="w-full bg-[#0D171F] px-2 py-1 rounded text-xs text-[#F4F7FA] border border-[#203039] outline-none"
                      >
                        <option value="after_food">After Food</option>
                        <option value="before_food">Before Food</option>
                        <option value="with_food">With Food</option>
                        <option value="anytime">Anytime</option>
                      </select>
                    </div>
                  </div>

                  {item.clinical_notes && (
                    <p className="text-[11px] text-[#9BAAB6] bg-[#0D171F] p-2.5 rounded-xl border border-[#203039]">
                      <strong className="text-[#00D084]">Clinical Purpose:</strong> {item.clinical_notes}
                    </p>
                  )}
                </div>
              ))}

              {confirmationSuccess && (
                <div className="p-3.5 rounded-xl bg-[#00D084]/15 border border-[#00D084]/30 text-[#00D084] text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{confirmationSuccess}</span>
                </div>
              )}

              <button
                onClick={handleConfirmSchedule}
                disabled={confirming}
                className="w-full btn-emerald text-xs !py-3 font-bold flex items-center justify-center gap-2"
              >
                {confirming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Confirm & Add To My Medicines</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
