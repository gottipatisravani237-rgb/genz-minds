import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  AlertTriangle,
  Phone,
  Heart,
  Globe,
  Clock,
  CheckCircle2,
  Save,
  Loader2,
} from 'lucide-react';
import { healthApi } from '../../services/healthApi';

export const ProfilePage: React.FC<{ user: any; onProfileUpdate?: () => void }> = ({ user, onProfileUpdate }) => {
  const [profile, setProfile] = useState<any>({
    age: 38,
    gender: 'Male',
    phone: '+91 98765 43210',
    allergies: 'Penicillin, Sulfa drugs',
    existing_conditions: 'Mild Hypertension, Early Pre-diabetes',
    emergency_name: 'Sarah Chen',
    emergency_relationship: 'Spouse',
    emergency_phone: '+91 98765 43211',
    preferred_language: 'en',
    timezone: 'Asia/Kolkata',
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setProfile({
        age: user.profile.age || 38,
        gender: user.profile.gender || 'Male',
        phone: user.profile.phone || '+91 98765 43210',
        allergies: (user.profile.allergies || []).join(', '),
        existing_conditions: (user.profile.existing_conditions || []).join(', '),
        emergency_name: user.profile.emergency_contact?.name || 'Sarah Chen',
        emergency_relationship: user.profile.emergency_contact?.relationship || 'Spouse',
        emergency_phone: user.profile.emergency_contact?.phone || '+91 98765 43211',
        preferred_language: user.profile.preferred_language || 'en',
        timezone: user.profile.timezone || 'Asia/Kolkata',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await healthApi.updateProfile({
        age: Number(profile.age),
        gender: profile.gender,
        phone: profile.phone,
        allergies: profile.allergies.split(',').map((s: string) => s.trim()).filter(Boolean),
        existing_conditions: profile.existing_conditions.split(',').map((s: string) => s.trim()).filter(Boolean),
        emergency_contact: {
          name: profile.emergency_name,
          relationship: profile.emergency_relationship,
          phone: profile.emergency_phone,
        },
        preferred_language: profile.preferred_language,
        timezone: profile.timezone,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      if (onProfileUpdate) onProfileUpdate();
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#F4F7FA] tracking-tight flex items-center gap-2.5">
          <User className="w-6 h-6 text-[#00D084]" />
          Clinical User Profile
        </h1>
        <p className="text-xs text-[#9BAAB6] mt-1">
          Personal medical baseline details used to evaluate allergies and medication safety interactions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Identity Card */}
        <div className="glass-panel-dark rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold text-[#F4F7FA] border-b border-[#203039] pb-2">
            Identity & Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[#9BAAB6] block mb-1">Full Legal Name</label>
              <input
                type="text"
                disabled
                value={user?.full_name || 'Alex Chen'}
                className="w-full bg-[#111F28] border border-[#203039] rounded-xl px-3 py-2 text-[#F4F7FA] opacity-80"
              />
            </div>
            <div>
              <label className="text-[#9BAAB6] block mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || 'demo@medinova.ai'}
                className="w-full bg-[#111F28] border border-[#203039] rounded-xl px-3 py-2 text-[#F4F7FA] opacity-80"
              />
            </div>
            <div>
              <label className="text-[#9BAAB6] block mb-1">Age</label>
              <input
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="text-[#9BAAB6] block mb-1">Gender</label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clinical History & Allergies */}
        <div className="glass-panel-dark rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold text-[#F4F7FA] border-b border-[#203039] pb-2">
            Clinical History & Known Allergies
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-[#FF5C68] font-bold block mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Drug Allergies (comma-separated)
              </label>
              <input
                type="text"
                value={profile.allergies}
                onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                placeholder="e.g. Penicillin, Sulfa drugs"
                className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
              />
              <span className="text-[10px] text-[#9BAAB6] mt-1 block">
                Flagged during prescription scanning to prevent contraindicated orders.
              </span>
            </div>

            <div>
              <label className="text-[#9BAAB6] block mb-1">Pre-existing Clinical Conditions</label>
              <input
                type="text"
                value={profile.existing_conditions}
                onChange={(e) => setProfile({ ...profile, existing_conditions: e.target.value })}
                placeholder="e.g. Hypertension, Type 2 Diabetes"
                className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="glass-panel-dark rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold text-[#F4F7FA] border-b border-[#203039] pb-2">
            Emergency Medical Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-[#9BAAB6] block mb-1">Contact Name</label>
              <input
                type="text"
                value={profile.emergency_name}
                onChange={(e) => setProfile({ ...profile, emergency_name: e.target.value })}
                className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="text-[#9BAAB6] block mb-1">Relationship</label>
              <input
                type="text"
                value={profile.emergency_relationship}
                onChange={(e) => setProfile({ ...profile, emergency_relationship: e.target.value })}
                className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
              />
            </div>
            <div>
              <label className="text-[#9BAAB6] block mb-1">Emergency Phone</label>
              <input
                type="text"
                value={profile.emergency_phone}
                onChange={(e) => setProfile({ ...profile, emergency_phone: e.target.value })}
                className="w-full glass-input-dark rounded-xl px-3 py-2 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-between">
          {saveSuccess ? (
            <span className="text-xs text-[#00D084] font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profile updated successfully!</span>
            </span>
          ) : <div />}

          <button
            type="submit"
            disabled={saving}
            className="btn-emerald text-xs !py-3 !px-6 font-bold"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Clinical Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
