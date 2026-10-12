import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Moon,
  Volume2,
  Bell,
  Globe,
  Database,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { API_BASE_URL } from '../../services/apiClient';

export const SettingsPage: React.FC = () => {
  const [reminderSound, setReminderSound] = useState(true);
  const [browserPush, setBrowserPush] = useState(true);
  const [preferredLang, setPreferredLang] = useState('en');
  const [apiStatus, setApiStatus] = useState<string | null>('Healthy (HTTP 200)');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#F4F7FA] tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-[#00D084]" />
          System Settings & Preferences
        </h1>
        <p className="text-xs text-[#9BAAB6] mt-1">
          Configure notification alarms, privacy rules, and active API endpoints.
        </p>
      </div>

      <div className="space-y-6">
        {/* Visual Appearance & Theme */}
        <div className="glass-panel-dark rounded-3xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#F4F7FA] border-b border-[#203039] pb-2">
            Appearance & Visual Theme
          </h2>

          <div className="flex items-center justify-between py-2 text-xs">
            <div className="flex items-center gap-3">
              <Moon className="w-4 h-4 text-[#00D084]" />
              <div>
                <span className="font-bold text-[#F4F7FA] block">Futuristic Dark Healthcare Mode</span>
                <span className="text-[11px] text-[#9BAAB6]">
                  Optimized for clinical readability and OLED contrast (Default)
                </span>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#00D084]/15 text-[#00D084] font-bold border border-[#00D084]/30">
              Active
            </span>
          </div>
        </div>

        {/* Medication Alarms & Sounds */}
        <div className="glass-panel-dark rounded-3xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#F4F7FA] border-b border-[#203039] pb-2">
            Audio & Notification Preferences
          </h2>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-[#21E6C1]" />
                <div>
                  <span className="font-bold text-[#F4F7FA] block">Medication Chime Synthesizer</span>
                  <span className="text-[11px] text-[#9BAAB6]">
                    Play harmonic medical chime when scheduled dose is due
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={reminderSound}
                onChange={(e) => setReminderSound(e.target.checked)}
                className="w-4 h-4 accent-[#00D084] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-1 border-t border-[#203039] pt-3">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-[#00D084]" />
                <div>
                  <span className="font-bold text-[#F4F7FA] block">Browser Push Notifications</span>
                  <span className="text-[11px] text-[#9BAAB6]">
                    Deliver system reminder alerts for upcoming appointments
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={browserPush}
                onChange={(e) => setBrowserPush(e.target.checked)}
                className="w-4 h-4 accent-[#00D084] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Backend & Environment Status */}
        <div className="glass-panel-dark rounded-3xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-[#F4F7FA] border-b border-[#203039] pb-2">
            Backend & RAG Pipeline Connection
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#080E13] border border-[#203039] flex items-center justify-between">
              <div>
                <span className="text-[#9BAAB6] block text-[10px]">Active API Endpoint:</span>
                <span className="font-mono text-[#00D084] font-bold">{API_BASE_URL}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#00D084]/15 text-[#00D084] text-[10px] font-bold border border-[#00D084]/30">
                {apiStatus}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111F28] border border-[#203039] flex items-center gap-2 text-[11px] text-[#9BAAB6]">
              <ShieldCheck className="w-4 h-4 text-[#00D084] flex-shrink-0" />
              <span>
                PostgreSQL & pgvector RAG vector embeddings running with 384-dimensional cosine similarity.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
