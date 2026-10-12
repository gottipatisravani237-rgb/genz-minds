import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Plus,
  Bell,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Utensils,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { FoodInstruction, Reminder } from '../../types';
import { MedicalDisclaimer } from '../../components/common/MedicalDisclaimer';

export const RemindersPage: React.FC = () => {
  const {
    reminders,
    reminderLogs,
    medicines,
    addReminder,
    deleteReminder,
    triggerTestAlarm,
  } = useHealth();

  const [addModal, setAddModal] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState(medicines[0]?.id || '');
  const [remTime, setRemTime] = useState('20:00');
  const [remFrequency, setRemFrequency] = useState('Once daily');
  const [remFood, setRemFood] = useState<FoodInstruction>('after_food');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenMed = medicines.find(m => m.id === selectedMedId) || medicines[0];
    if (!chosenMed) return;

    addReminder({
      medicineId: chosenMed.id,
      medicineName: chosenMed.name,
      dosage: chosenMed.dosage,
      time: remTime,
      frequency: remFrequency,
      foodInstruction: remFood,
      isActive: true,
    });

    setAddModal(false);
  };

  const formatFoodText = (instruction: FoodInstruction) => {
    switch (instruction) {
      case 'before_food':
        return 'Before food';
      case 'after_food':
        return 'After food';
      case 'with_food':
        return 'With food';
      default:
        return 'Anytime';
    }
  };

  const formatDisplayTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hStr, mStr] = timeStr.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Smart Reminders
          </h1>
          <p className="text-base text-slate-600 font-medium mt-1">
            Intelligent dosage timing, dietary food synchronization & real-time alarms
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {/* Prominent Test Alarm button as required */}
          <button
            onClick={() => triggerTestAlarm()}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-teal-500/25 hover:scale-105 active:scale-95 transition flex items-center gap-2"
          >
            <Bell className="w-4 h-4 animate-bounce" />
            <span>🚀 Test Medicine Alarm</span>
          </button>

          <button
            onClick={() => setAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reminder</span>
          </button>
        </div>
      </div>

      {/* Reminders Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-teal-600" />
          <span>Active Medicine Schedules</span>
        </h2>

        {reminders.length === 0 ? (
          <div className="glass-panel bg-white/70 p-12 rounded-3xl border border-white/80 text-center space-y-3">
            <Clock className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="text-base font-bold text-slate-700">No active reminders configured</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Set schedules to activate automated real-time alarms and adherence logging.
            </p>
            <button
              onClick={() => setAddModal(true)}
              className="mt-2 px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl"
            >
              Configure Schedule
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reminders.map(rem => (
              <motion.div
                key={rem.id}
                layout
                className="glass-panel bg-white/85 p-6 rounded-3xl border border-white/80 shadow-xl space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/50">
                        {rem.frequency}
                      </span>
                      <h3 className="text-xl font-black text-slate-900 mt-2">
                        {rem.medicineName}
                      </h3>
                      <p className="text-xs font-semibold text-teal-600">
                        {rem.dosage}
                      </p>
                    </div>

                    <button
                      onClick={() => deleteReminder(rem.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete reminder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-600" />
                      <span className="text-base font-black text-slate-900">
                        {formatDisplayTime(rem.time)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                      <Utensils className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatFoodText(rem.foodInstruction)}</span>
                    </div>
                  </div>
                </div>

                {/* Trigger instant alert button for this reminder */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Alarm Armed
                  </span>

                  <button
                    onClick={() => triggerTestAlarm(rem.id)}
                    className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Test This Alarm</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Today's Adherence Activity Log */}
      <div className="glass-panel bg-white/80 p-6 md:p-8 rounded-3xl border border-white/80 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-600" />
          <span>Live Adherence Activity Ledger</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-2.5 px-3">Medicine</th>
                <th className="py-2.5 px-3">Dosage</th>
                <th className="py-2.5 px-3">Scheduled Time</th>
                <th className="py-2.5 px-3">Instruction</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Logged Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reminderLogs.slice(0, 8).map(log => {
                const statusBadge = {
                  taken: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  upcoming: 'bg-cyan-50 text-cyan-700 border-cyan-200',
                  snoozed: 'bg-amber-50 text-amber-700 border-amber-200',
                  skipped: 'bg-slate-100 text-slate-600 border-slate-200',
                  missed: 'bg-rose-50 text-rose-700 border-rose-200',
                }[log.status];

                return (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {log.medicineName}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-teal-600">
                      {log.dosage}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">
                      {log.scheduledDate} {formatDisplayTime(log.scheduledTime)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {formatFoodText(log.foodInstruction)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadge}`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 font-mono">
                      {log.actionTimestamp
                        ? new Date(log.actionTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Pending'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Reminder Modal */}
      <AnimatePresence>
        {addModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md glass-panel bg-white/95 p-6 md:p-8 rounded-3xl shadow-2xl relative border border-white/80"
            >
              <button
                onClick={() => setAddModal(false)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Create Smart Reminder
              </h3>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Select Medication
                  </label>
                  <select
                    value={selectedMedId}
                    onChange={e => setSelectedMedId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-800 bg-white"
                  >
                    {medicines.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.dosage})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Reminder Time
                  </label>
                  <input
                    type="time"
                    value={remTime}
                    onChange={e => setRemTime(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Frequency
                    </label>
                    <select
                      value={remFrequency}
                      onChange={e => setRemFrequency(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-800 bg-white"
                    >
                      <option value="Once daily">Once daily</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="Three times daily">Three times daily</option>
                      <option value="Every 8 hours">Every 8 hours</option>
                      <option value="Weekly">Weekly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Food Instruction
                    </label>
                    <select
                      value={remFood}
                      onChange={e => setRemFood(e.target.value as FoodInstruction)}
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-800 bg-white"
                    >
                      <option value="after_food">After food</option>
                      <option value="before_food">Before food</option>
                      <option value="with_food">With food</option>
                      <option value="anytime">Anytime</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setAddModal(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-md shadow-teal-500/25"
                  >
                    Save Reminder
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <MedicalDisclaimer />
    </div>
  );
};
