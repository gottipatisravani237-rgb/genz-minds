import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface MedicalDisclaimerProps {
  compact?: boolean;
  className?: string;
}

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({ compact = false, className = '' }) => {
  if (compact) {
    return (
      <div className={`flex items-center gap-2 text-xs text-slate-500 bg-slate-100/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/60 ${className}`}>
        <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>Educational companion. Always verify medical decisions with a licensed healthcare professional.</span>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-teal-500/5 to-cyan-500/10 border border-amber-200/50 backdrop-blur-md shadow-sm ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-500/15 text-amber-700 mt-0.5 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="text-xs leading-relaxed text-slate-600">
          <span className="font-semibold text-slate-800 mr-1">Clinical Safety Guarantee:</span>
          MediNova AI provides educational and medication-management assistance. It does not replace a qualified healthcare professional. Always verify medical information with a healthcare professional before making treatment decisions.
        </div>
      </div>
    </div>
  );
};
