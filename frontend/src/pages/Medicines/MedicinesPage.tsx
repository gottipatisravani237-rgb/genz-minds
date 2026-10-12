import React, { useState, useEffect } from 'react';
import {
  Pill,
  Plus,
  Clock,
  Calendar,
  AlertCircle,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Search,
  Filter,
  Loader2,
} from 'lucide-react';
import { healthApi } from '../../services/healthApi';

export const MedicinesPage: React.FC = () => {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '',
    strength: '500mg',
    dosage_form: 'Tablet',
    prescribed_dose: '1 tablet',
    frequency: 'Once daily',
    time_slots: '09:00',
    food_instructions: 'after_food',
    purpose: '',
    prescriber: 'Dr. Ramesh Varma, MD',
  });

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const data = await healthApi.getMedicines();
      setMedicines(data);
    } catch (e) {
      console.warn('Error fetching medicines:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await healthApi.createMedicine({
        ...newMed,
        time_slots: newMed.time_slots.split(',').map(s => s.trim()),
      });
      setIsAddModalOpen(false);
      setNewMed({
        name: '',
        strength: '500mg',
        dosage_form: 'Tablet',
        prescribed_dose: '1 tablet',
        frequency: 'Once daily',
        time_slots: '09:00',
        food_instructions: 'after_food',
        purpose: '',
        prescriber: 'Dr. Ramesh Varma, MD',
      });
      fetchMedicines();
    } catch (err: any) {
      alert(err.message || 'Failed to create medicine');
    }
  };

  const handleDeleteMedicine = async (id: string) => {
    if (!confirm('Archive this medicine from active schedule?')) return;
    try {
      await healthApi.deleteMedicine(id);
      fetchMedicines();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const filteredMedicines = medicines.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.generic_name && m.generic_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#F4F7FA] tracking-tight flex items-center gap-2.5">
            <Pill className="w-6 h-6 text-[#00D084]" />
            My Medicines & Active Schedules
          </h1>
          <p className="text-xs text-[#9BAAB6] mt-1">
            Confirmed prescriptions and verified schedules with food instructions and clinical precautions.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-emerald text-xs !py-2.5 !px-4"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medicine Manually</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="glass-panel-dark rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#9BAAB6] absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search active medications or generic names..."
            className="w-full bg-[#111F28] border border-[#203039] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F4F7FA] outline-none focus:border-[#00D084]"
          />
        </div>
        <span className="text-xs text-[#9BAAB6]">
          Total Active Regimens: <strong className="text-[#00D084]">{medicines.length}</strong>
        </span>
      </div>

      {/* Medicines Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[#9BAAB6] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#00D084]" />
          <span>Loading medication schedules...</span>
        </div>
      ) : filteredMedicines.length === 0 ? (
        <div className="glass-panel-dark rounded-3xl p-12 text-center text-xs text-[#9BAAB6] space-y-2">
          <Pill className="w-8 h-8 text-[#203039] mx-auto" />
          <p className="text-sm font-bold text-[#F4F7FA]">No Active Medications Found</p>
          <p>Scan a prescription in the Prescription Scanner or add a medicine manually above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedicines.map((med) => (
            <div
              key={med.id}
              className="glass-card-interactive p-5 rounded-2xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#111F28] border border-[#203039] flex items-center justify-center text-[#00D084]">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#F4F7FA]">{med.name}</h3>
                      <p className="text-[10px] text-[#9BAAB6]">{med.generic_name || med.name}</p>
                    </div>
                  </div>
                  {med.strength && (
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[#00D084]/15 text-[#00D084] font-bold border border-[#00D084]/30">
                      {med.strength}
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-[#111F28] border border-[#203039] space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#9BAAB6]">Prescribed Dose:</span>
                    <span className="font-bold text-[#F4F7FA]">{med.prescribed_dose}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9BAAB6]">Frequency:</span>
                    <span className="font-semibold text-[#F4F7FA]">{med.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9BAAB6]">Instructions:</span>
                    <span className="capitalize text-[#00D084] font-semibold">
                      {med.food_instructions?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {med.purpose && (
                  <p className="text-[11px] text-[#9BAAB6] leading-relaxed">
                    <strong className="text-[#F4F7FA]">Indication:</strong> {med.purpose}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#203039] flex items-center justify-between text-[11px] text-[#9BAAB6]">
                <span className="flex items-center gap-1 font-mono text-[#00D084]">
                  <Clock className="w-3.5 h-3.5" />
                  {med.time_slots?.join(', ') || '09:00'}
                </span>
                <button
                  onClick={() => handleDeleteMedicine(med.id)}
                  className="p-1 rounded text-[#9BAAB6] hover:text-[#FF5C68] transition"
                  title="Archive medicine"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Medicine Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4">
            <h2 className="text-lg font-bold text-[#F4F7FA]">Add Medication Schedule</h2>
            <form onSubmit={handleCreateMedicine} className="space-y-3 text-xs">
              <div>
                <label className="text-[#9BAAB6] block mb-1">Medicine Brand Name</label>
                <input
                  type="text"
                  required
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  placeholder="e.g. Metformin, Lisinopril"
                  className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#9BAAB6] block mb-1">Strength</label>
                  <input
                    type="text"
                    value={newMed.strength}
                    onChange={(e) => setNewMed({ ...newMed, strength: e.target.value })}
                    placeholder="e.g. 500mg, 20mg"
                    className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[#9BAAB6] block mb-1">Dose Amount</label>
                  <input
                    type="text"
                    value={newMed.prescribed_dose}
                    onChange={(e) => setNewMed({ ...newMed, prescribed_dose: e.target.value })}
                    placeholder="e.g. 1 tablet"
                    className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#9BAAB6] block mb-1">Frequency</label>
                  <select
                    value={newMed.frequency}
                    onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                    className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
                  >
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="As needed">As needed (PRN)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#9BAAB6] block mb-1">Food Timing</label>
                  <select
                    value={newMed.food_instructions}
                    onChange={(e) => setNewMed({ ...newMed, food_instructions: e.target.value })}
                    className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
                  >
                    <option value="after_food">After Food</option>
                    <option value="before_food">Before Food</option>
                    <option value="with_food">With Food</option>
                    <option value="anytime">Anytime</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#9BAAB6] block mb-1">Dose Times (comma-separated HH:MM)</label>
                <input
                  type="text"
                  value={newMed.time_slots}
                  onChange={(e) => setNewMed({ ...newMed, time_slots: e.target.value })}
                  placeholder="09:00, 21:00"
                  className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="text-[#9BAAB6] block mb-1">Clinical Indication / Purpose</label>
                <input
                  type="text"
                  value={newMed.purpose}
                  onChange={(e) => setNewMed({ ...newMed, purpose: e.target.value })}
                  placeholder="e.g. Blood glucose moderation"
                  className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#9BAAB6] hover:text-[#F4F7FA] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-emerald text-xs !py-2 !px-5"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
