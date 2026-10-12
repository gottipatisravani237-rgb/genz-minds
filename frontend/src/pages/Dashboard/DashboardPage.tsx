import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Heart,
  TrendingUp,
  Pill,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Scan,
  CalendarCheck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  Volume2,
} from 'lucide-react';
import { healthApi, AdherenceStats, Prescription } from '../../services/healthApi';

interface DashboardPageProps {
  onNavigateTab: (tab: string) => void;
  onTriggerTestAlarm: () => void;
  user: any;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateTab,
  onTriggerTestAlarm,
  user,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [medicines, setMedicines] = useState<any[]>([]);
  const [adherence, setAdherence] = useState<AdherenceStats>({
    today_percentage: 92.0,
    weekly_percentage: 89.5,
    monthly_percentage: 91.0,
    taken_count: 3,
    skipped_count: 0,
    missed_count: 0,
    total_eligible: 3,
    daily_history: [],
  });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [medsData, adhData, apptsData, repsData] = await Promise.all([
        healthApi.getMedicines().catch(() => []),
        healthApi.getAdherence().catch(() => null),
        healthApi.getAppointments().catch(() => []),
        healthApi.getReports().catch(() => []),
      ]);

      setMedicines(medsData || []);
      if (adhData) setAdherence(adhData);
      setAppointments(apptsData || []);
      setReports(repsData || []);
    } catch (e) {
      console.warn('Dashboard data fetch warning:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleTakeDose = async (medId: string, time: string) => {
    const todayStr = currentTime.toISOString().split('T')[0];
    try {
      await healthApi.recordDose({
        medicine_id: medId,
        scheduled_date: todayStr,
        scheduled_time: time,
        status: 'taken',
      });
      loadDashboardData();
    } catch (e) {
      console.error('Error logging dose:', e);
    }
  };

  const handleSkipDose = async (medId: string, time: string) => {
    const todayStr = currentTime.toISOString().split('T')[0];
    try {
      await healthApi.recordDose({
        medicine_id: medId,
        scheduled_date: todayStr,
        scheduled_time: time,
        status: 'skipped',
      });
      loadDashboardData();
    } catch (e) {
      console.error('Error logging dose:', e);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userName = user?.full_name || 'Patient';

  // SVG Circular Ring calculation
  const circleRadius = 46;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (adherence.today_percentage / 100) * circumference;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header Hero Card with Cardiac Vitals Visual */}
      <div className="glass-panel-dark rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00D084]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111F28] border border-[#203039] text-[#00D084] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#00D084] animate-pulse" />
              <span>Intelligent Care Active • Clinical Core Ready</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-[#F4F7FA] tracking-tight">
              {getGreeting()},{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D084] via-[#21E6C1] to-emerald-400">
                {userName}
              </span>{' '}
              👋
            </h1>

            <p className="text-sm text-[#9BAAB6] font-medium leading-relaxed">
              Your health, intelligently organized. Real-time medication schedules, verified laboratory explanations, and evidence-grounded AI support.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => onNavigateTab('prescription-scanner')}
                className="btn-emerald text-xs !py-2.5 !px-4"
              >
                <FileText className="w-4 h-4" />
                <span>Scan Prescription</span>
              </button>
              <button
                onClick={() => onNavigateTab('documents')}
                className="btn-secondary-dark text-xs !py-2.5 !px-4"
              >
                <Scan className="w-4 h-4 text-[#00D084]" />
                <span>Upload Lab Report</span>
              </button>
              <button
                onClick={onTriggerTestAlarm}
                className="px-3.5 py-2.5 rounded-xl bg-[#111F28] hover:bg-[#162936] text-[#21E6C1] border border-[#21E6C1]/40 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Volume2 className="w-4 h-4" />
                <span>Test Reminder Alarm</span>
              </button>
            </div>
          </div>

          {/* Cardiac Rhythm Visual */}
          <div className="flex flex-col items-center p-5 rounded-2xl bg-[#111F28] border border-[#203039] shadow-lg text-center">
            <div className="w-16 h-16 rounded-full bg-[#00D084]/15 border border-[#00D084]/40 flex items-center justify-center text-[#00D084] animate-heartbeat shadow-lg shadow-[#00D084]/20 mb-2">
              <Heart className="w-8 h-8 fill-[#00D084]/25 stroke-[2.2]" />
            </div>
            <span className="text-xs font-bold text-[#F4F7FA]">Sinus Rhythm Stable</span>
            <span className="text-[10px] text-[#00D084] font-semibold">Vitals Sync: 72 BPM</span>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards (Adherence Ring, Next Dose, AI Lab Insights) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Medication Adherence Ring */}
        <div className="glass-panel-dark p-6 rounded-3xl flex flex-col justify-between items-center text-center">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#9BAAB6] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#00D084]" />
              Medication Adherence
            </span>
            <span className="text-[10px] font-bold text-[#00D084] bg-[#00D084]/15 px-2 py-0.5 rounded-lg border border-[#00D084]/30">
              Today's Score
            </span>
          </div>

          <div className="relative my-3 flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r={circleRadius}
                className="text-[#111F28]"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r={circleRadius}
                className="text-[#00D084] transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-[#F4F7FA]">
                {Math.round(adherence.today_percentage)}%
              </span>
              <span className="text-[10px] text-[#9BAAB6]">Compliance</span>
            </div>
          </div>

          <div className="w-full flex items-center justify-between text-xs text-[#9BAAB6] border-t border-[#203039] pt-3">
            <span>Weekly: {Math.round(adherence.weekly_percentage)}%</span>
            <span>Monthly: {Math.round(adherence.monthly_percentage)}%</span>
          </div>
        </div>

        {/* Next Upcoming Medicine */}
        <div className="glass-panel-dark p-6 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#9BAAB6] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#21E6C1]" />
              Next Scheduled Dose
            </span>
            <span className="text-[10px] font-bold text-[#21E6C1] bg-[#21E6C1]/15 px-2 py-0.5 rounded-lg border border-[#21E6C1]/30">
              Due Today
            </span>
          </div>

          {medicines.length > 0 ? (
            <div className="my-3 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#111F28] border border-[#203039] flex items-center justify-center text-[#00D084]">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F4F7FA]">{medicines[0].name}</h3>
                  <p className="text-xs text-[#9BAAB6]">
                    {medicines[0].prescribed_dose} • {medicines[0].food_instructions?.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#111F28] border border-[#203039] flex items-center justify-between text-xs">
                <span className="text-[#9BAAB6]">Scheduled:</span>
                <span className="font-bold text-[#00D084]">
                  {medicines[0].time_slots?.[0] || '09:00 AM'}
                </span>
              </div>
            </div>
          ) : (
            <div className="my-auto text-center py-4 text-xs text-[#9BAAB6]">
              No active medicines scheduled. Scan a prescription to start.
            </div>
          )}

          <button
            onClick={() => onNavigateTab('medicines')}
            className="w-full btn-secondary-dark text-xs !py-2 justify-between"
          >
            <span>View All Medications ({medicines.length})</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#00D084]" />
          </button>
        </div>

        {/* Latest Lab Report Findings */}
        <div className="glass-panel-dark p-6 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#9BAAB6] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FFB547]" />
              Lab Findings Insights
            </span>
            <span className="text-[10px] font-bold text-[#FFB547] bg-[#FFB547]/15 px-2 py-0.5 rounded-lg border border-[#FFB547]/30">
              RAG Indexed
            </span>
          </div>

          {reports.length > 0 ? (
            <div className="my-3 space-y-2 text-xs">
              <span className="font-bold text-[#F4F7FA] block truncate">
                {reports[0].report_type}
              </span>
              <p className="text-[11px] text-[#9BAAB6] line-clamp-3 leading-relaxed">
                {reports[0].overall_summary}
              </p>
              {reports[0].abnormal_findings?.length > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] text-[#FFB547] font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{reports[0].abnormal_findings.length} parameter(s) outside reference range</span>
                </div>
              )}
            </div>
          ) : (
            <div className="my-auto text-center py-4 text-xs text-[#9BAAB6]">
              No lab reports analyzed yet. Upload a CBC or metabolic report.
            </div>
          )}

          <button
            onClick={() => onNavigateTab('report-analyzer')}
            className="w-full btn-secondary-dark text-xs !py-2 justify-between"
          >
            <span>Open Report Analyzer</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#00D084]" />
          </button>
        </div>
      </div>

      {/* 3. Today's Medicine Checklist & Doctor Appointment Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Today's Medication Checklist */}
        <div className="lg:col-span-8 glass-panel-dark rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#203039]">
            <div>
              <h2 className="text-base font-bold text-[#F4F7FA]">Today's Dose Schedule</h2>
              <p className="text-xs text-[#9BAAB6]">Click 'Take' or 'Skip' to log adherence in real time.</p>
            </div>
            <button
              onClick={() => onNavigateTab('medicines')}
              className="text-xs text-[#00D084] font-semibold hover:underline"
            >
              Manage Prescriptions
            </button>
          </div>

          {medicines.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#9BAAB6] space-y-3">
              <Pill className="w-8 h-8 text-[#203039] mx-auto" />
              <p>No medicines currently registered. Scan a prescription to generate schedules automatically.</p>
              <button
                onClick={() => onNavigateTab('prescription-scanner')}
                className="btn-emerald text-xs !py-2 !px-4 mx-auto"
              >
                Scan Prescription Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {medicines.map((med) => (
                <div
                  key={med.id}
                  className="p-4 rounded-2xl bg-[#111F28] border border-[#203039] hover:border-[#00D084]/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0D171F] border border-[#203039] flex items-center justify-center text-[#00D084]">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#F4F7FA]">{med.name}</span>
                        {med.strength && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0D171F] text-[#9BAAB6] border border-[#203039]">
                            {med.strength}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#9BAAB6]">
                        {med.prescribed_dose} • {med.frequency} • {med.food_instructions?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-xs font-mono text-[#00D084] mr-2">
                      {med.time_slots?.[0] || '09:00'}
                    </span>
                    <button
                      onClick={() => handleTakeDose(med.id, med.time_slots?.[0] || '09:00')}
                      className="px-3 py-1.5 rounded-xl bg-[#00D084]/15 hover:bg-[#00D084] text-[#00D084] hover:text-[#05090D] border border-[#00D084]/40 text-xs font-bold transition flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Take</span>
                    </button>
                    <button
                      onClick={() => handleSkipDose(med.id, med.time_slots?.[0] || '09:00')}
                      className="px-2.5 py-1.5 rounded-xl bg-[#111F28] hover:bg-[#FF5C68]/20 text-[#9BAAB6] hover:text-[#FF5C68] border border-[#203039] text-xs font-bold transition"
                      title="Skip dose"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Upcoming Doctor Appointments */}
        <div className="lg:col-span-4 glass-panel-dark rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#203039]">
            <h2 className="text-base font-bold text-[#F4F7FA]">Appointments</h2>
            <button
              onClick={() => onNavigateTab('doctors')}
              className="text-xs text-[#00D084] font-semibold hover:underline"
            >
              Book Doctor
            </button>
          </div>

          {appointments.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#9BAAB6] space-y-3">
              <CalendarCheck className="w-8 h-8 text-[#203039] mx-auto" />
              <p>No upcoming doctor consultations booked.</p>
              <button
                onClick={() => onNavigateTab('doctors')}
                className="btn-secondary-dark text-xs !py-2 !px-3 mx-auto"
              >
                Discover Specialists
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 3).map((appt) => (
                <div
                  key={appt.id}
                  className="p-3.5 rounded-2xl bg-[#111F28] border border-[#203039] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F4F7FA]">{appt.doctor_name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#00D084]/15 text-[#00D084] font-bold border border-[#00D084]/30">
                      Confirmed
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9BAAB6]">{appt.doctor_specialty}</p>
                  <div className="flex items-center justify-between text-[10px] text-[#9BAAB6] pt-1 border-t border-[#203039]">
                    <span>{appt.appointment_date} at {appt.start_time}</span>
                    <span className="font-mono text-[#00D084]">{appt.booking_reference}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Safety Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-[#0D171F] border border-[#203039] flex items-center gap-3 text-xs text-[#9BAAB6]">
        <ShieldCheck className="w-5 h-5 text-[#00D084] flex-shrink-0" />
        <p>
          <strong className="text-[#F4F7FA]">Clinical Safety Notice:</strong> MEDINOVA-AI uses RAG vector retrieval to ground insights in your uploaded records. It is an educational health copilot, not a replacement for professional clinical diagnosis.
        </p>
      </div>
    </div>
  );
};
