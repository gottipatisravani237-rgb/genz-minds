import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Clock, X, Pill, Utensils, AlertTriangle } from 'lucide-react';

interface MedicineAlarmModalProps {
  activeAlarm: {
    id: string;
    medicineName: string;
    dosage: string;
    scheduledTime: string;
    foodInstruction?: string;
  } | null;
  onTaken: () => void;
  onSnooze: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export const MedicineAlarmModal: React.FC<MedicineAlarmModalProps> = ({
  activeAlarm,
  onTaken,
  onSnooze,
  onSkip,
  onClose,
}) => {
  if (!activeAlarm) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        {/* Animated Glow behind dialog */}
        <div className="absolute w-96 h-96 rounded-full bg-[#00D084]/20 blur-3xl pointer-events-none animate-pulse" />

        <div className="relative w-full max-w-md glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-[#00D084]/40 text-center overflow-hidden shadow-2xl space-y-4">
          {/* Top pulse accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00D084] via-[#21E6C1] to-emerald-400 animate-pulse" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#9BAAB6] hover:text-[#F4F7FA] rounded-full hover:bg-[#111F28] transition"
            title="Dismiss notification"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Alarm Icon */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00D084] to-[#21E6C1] flex items-center justify-center text-[#05090D] shadow-xl shadow-[#00D084]/30 relative">
            <Bell className="w-8 h-8 fill-[#05090D]/20 animate-bounce" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5C68] opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#FF5C68]" />
            </span>
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111F28] border border-[#203039] text-[#21E6C1] text-[10px] font-bold uppercase tracking-wider mb-2">
              <Clock className="w-3 h-3" />
              <span>Dose Due • {activeAlarm.scheduledTime}</span>
            </span>
            <h2 className="text-xl font-black text-[#F4F7FA] tracking-tight">
              Medication Alarm
            </h2>
          </div>

          {/* Medicine Detail Card */}
          <div className="p-4 rounded-2xl bg-[#080E13] border border-[#203039] text-left space-y-2">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#00D084]/15 text-[#00D084] flex-shrink-0">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F4F7FA]">
                  {activeAlarm.medicineName}
                </h3>
                <p className="text-xs text-[#00D084] font-semibold">
                  {activeAlarm.dosage}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-[#9BAAB6] mt-1">
                  <Utensils className="w-3 h-3 text-[#9BAAB6]" />
                  <span>Instructions: <strong>{activeAlarm.foodInstruction?.replace('_', ' ') || 'After food'}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={onTaken}
              className="w-full btn-emerald text-sm !py-3 font-bold"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>✓ Confirmed Taken</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onSnooze}
                className="btn-secondary-dark text-xs !py-2.5"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Snooze 10 min</span>
              </button>
              <button
                onClick={onSkip}
                className="btn-secondary-dark text-xs !py-2.5 text-[#FF5C68] hover:text-[#FF5C68]"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Skip Dose</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};
