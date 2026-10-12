import React from 'react';
import {
  Bell,
  Sparkles,
  Volume2,
  ShieldAlert,
  User as UserIcon,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  userName: string;
  onNavigateTab: (tab: string) => void;
  onTriggerTestAlarm: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  userName,
  onNavigateTab,
  onTriggerTestAlarm,
  unreadCount = 0,
}) => {
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Health Dashboard';
      case 'documents': return 'Medical Document Scanner & OCR';
      case 'prescription-scanner': return 'Prescription Scanner & Extraction';
      case 'report-analyzer': return 'Laboratory Report Analyzer';
      case 'ai-assistant': return 'AI Health Assistant (RAG Grounded)';
      case 'voice-assistant': return 'Multilingual Voice Assistant';
      case 'medicines': return 'My Medicines & Schedules';
      case 'adherence': return 'Medication Adherence Analytics';
      case 'doctors': return 'Doctor Discovery & Consultation';
      case 'appointments': return 'Scheduled Appointments';
      case 'health-timeline': return 'Longitudinal Health Timeline';
      case 'notifications': return 'Alerts & Reminder Notifications';
      case 'profile': return 'User Profile & Clinical Record';
      case 'settings': return 'System Settings & Security';
      default: return 'Health Overview';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#080E13]/90 backdrop-blur-md border-b border-[#203039] px-6 flex items-center justify-between">
      {/* Breadcrumb & Title */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm font-bold text-[#F4F7FA] tracking-tight">
            {getTabTitle(currentTab)}
          </h1>
          <p className="text-[10px] text-[#9BAAB6] flex items-center gap-1.5">
            <span>MEDINOVA-AI</span>
            <span>•</span>
            <span className="text-[#00D084] font-medium capitalize">{currentTab.replace('-', ' ')}</span>
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Real-time RAG & AI Core Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D171F] border border-[#203039] text-xs">
          <span className="w-2 h-2 rounded-full bg-[#00D084] animate-pulse" />
          <span className="text-[11px] font-medium text-[#9BAAB6]">
            Clinical Core: <strong className="text-[#00D084]">Ready</strong>
          </span>
        </div>

        {/* Quick Test Alarm Trigger */}
        <button
          onClick={onTriggerTestAlarm}
          className="px-3 py-1.5 rounded-xl bg-[#111F28] hover:bg-[#162936] text-[#21E6C1] border border-[#21E6C1]/30 hover:border-[#21E6C1]/60 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          title="Trigger a test medication alarm to verify audio and reminder banner"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Test Reminder Alarm</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => onNavigateTab('notifications')}
          className="relative p-2 rounded-xl bg-[#0D171F] hover:bg-[#111F28] text-[#9BAAB6] hover:text-[#F4F7FA] border border-[#203039] transition"
          title="View Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF5C68] text-white text-[9px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Pill */}
        <div
          onClick={() => onNavigateTab('profile')}
          className="flex items-center gap-2.5 pl-2 py-1 pr-3 rounded-xl bg-[#0D171F] border border-[#203039] hover:border-[#00D084]/40 cursor-pointer transition"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#00D084] to-[#21E6C1] flex items-center justify-center text-[#05090D] font-bold text-xs">
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="text-xs font-semibold text-[#F4F7FA] max-w-[100px] truncate hidden sm:inline">
            {userName || 'User'}
          </span>
        </div>
      </div>
    </header>
  );
};
