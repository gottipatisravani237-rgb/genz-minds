import React from 'react';
import {
  LayoutDashboard,
  FileSearch,
  Receipt,
  FileBarChart2,
  Bot,
  Mic,
  Pill,
  TrendingUp,
  Stethoscope,
  CalendarCheck,
  History,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Activity,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onNavigateTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigateTab,
  isCollapsed,
  onToggleCollapse,
  onLogout,
  unreadCount = 0,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'documents', label: 'Document Scanner', icon: FileSearch },
    { id: 'prescription-scanner', label: 'Prescription Scanner', icon: Receipt },
    { id: 'report-analyzer', label: 'Report Analyzer', icon: FileBarChart2 },
    { id: 'ai-assistant', label: 'AI Health Assistant', icon: Bot, badge: 'RAG' },
    { id: 'voice-assistant', label: 'Voice Assistant', icon: Mic, badge: 'Multi' },
    { id: 'medicines', label: 'My Medicines', icon: Pill },
    { id: 'adherence', label: 'Medication Adherence', icon: TrendingUp },
    { id: 'doctors', label: 'Doctor Consultation', icon: Stethoscope },
    { id: 'appointments', label: 'Appointments', icon: CalendarCheck },
    { id: 'health-timeline', label: 'Health Timeline', icon: History },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadCount },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 transition-all duration-300 bg-[#080E13] border-r border-[#203039] flex flex-col justify-between ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header / Logo */}
      <div className="p-4 border-b border-[#203039] flex items-center justify-between">
        <div
          onClick={() => onNavigateTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00D084] via-[#21E6C1] to-emerald-400 flex items-center justify-center text-[#05090D] shadow-lg shadow-[#00D084]/20 flex-shrink-0 group-hover:scale-105 transition">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <span className="text-base font-black text-[#F4F7FA] tracking-tight">
                MEDINOVA<span className="text-[#00D084]">-AI</span>
              </span>
              <p className="text-[10px] text-[#9BAAB6] tracking-wider uppercase font-semibold">
                Clinical Health Copilot
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-[#9BAAB6] hover:text-[#F4F7FA] hover:bg-[#111F28] transition"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigateTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                isActive
                  ? 'bg-[#111F28] text-[#00D084] border border-[#00D084]/40 shadow-sm shadow-[#00D084]/10'
                  : 'text-[#9BAAB6] hover:text-[#F4F7FA] hover:bg-[#0D171F]'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition ${
                  isActive ? 'text-[#00D084]' : 'text-[#9BAAB6] group-hover:text-[#F4F7FA]'
                }`}
              />
              {!isCollapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}

              {!isCollapsed && item.badge && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#00D084]/15 text-[#00D084] border border-[#00D084]/30">
                  {item.badge}
                </span>
              )}

              {!isCollapsed && item.count && item.count > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF5C68] text-white">
                  {item.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Footer / Safety Badge & Logout */}
      <div className="p-3 border-t border-[#203039] space-y-2">
        {!isCollapsed && (
          <div className="px-3 py-2 rounded-xl bg-[#0D171F] border border-[#203039] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00D084] flex-shrink-0" />
            <div className="text-[10px] text-[#9BAAB6] leading-tight">
              <span className="text-[#F4F7FA] font-bold block">HIPAA & Clinical Guard</span>
              Strict tenant isolation
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#FF5C68] hover:bg-[#FF5C68]/10 transition"
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
