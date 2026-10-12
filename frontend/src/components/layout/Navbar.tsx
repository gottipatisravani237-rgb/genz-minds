import React, { useState } from 'react';
import {
  Bell,
  Scan,
  FileText,
  Pill,
  Clock,
  PieChart,
  User,
  LogOut,
  Key,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { MediNovaAIOrb } from '../common/MediNovaAIOrb';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenApiKeyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenApiKeyModal,
}) => {
  const { user, profile, logout, triggerTestAlarm, apiKey } = useHealth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: Sparkles },
    { id: 'medi-scan', label: 'Medi Scan', icon: Scan },
    { id: 'pres-scan', label: 'Pres Scan', icon: FileText },
    { id: 'medicines', label: 'My Medicines', icon: Pill },
    { id: 'reminders', label: 'Smart Reminders', icon: Clock },
    { id: 'adherence', label: 'Adherence', icon: PieChart },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/60 bg-white/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <MediNovaAIOrb size="sm" isThinking={false} />
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-teal-600 transition flex items-center gap-1.5">
                MediNova <span className="text-teal-500 font-extrabold">AI</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500 tracking-wide uppercase">
                Smarter Care. Better Health.
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/50">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-teal-700 shadow-sm shadow-teal-500/10 border border-teal-100/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            {/* 🚀 TEST MEDICINE ALARM BUTTON (Requirement #10) */}
            <button
              onClick={() => triggerTestAlarm()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white text-xs font-bold shadow-md shadow-teal-500/20 hover:shadow-lg hover:scale-105 active:scale-95 transition"
              title="Test the real medicine alarm modal immediately"
            >
              <Bell className="w-3.5 h-3.5 animate-bounce" />
              <span className="hidden sm:inline">🚀 Test Alarm</span>
              <span className="sm:hidden">Alarm</span>
            </button>

            {/* AI Vision Engine Key Config Button */}
            <button
              onClick={onOpenApiKeyModal}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                apiKey
                  ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
              title="Configure Vision AI Engine"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{apiKey ? 'AI Vision Live' : 'AI Config'}</span>
              <span className={`w-2 h-2 rounded-full ${apiKey ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            </button>

            {/* User Profile / Logout */}
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <button
                  onClick={() => handleNavClick('profile')}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100/80 transition"
                  title="View Profile"
                >
                  <img
                    src={profile?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'}
                    alt="User"
                    className="w-8 h-8 rounded-full object-cover border border-teal-400/50 shadow-xs"
                  />
                  <span className="text-xs font-bold text-slate-700 hidden xl:inline">
                    {profile?.fullName || user.name}
                  </span>
                </button>

                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-6 bg-white/95 border-b border-slate-200 shadow-xl space-y-2 backdrop-blur-xl">
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-left transition ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 border border-teal-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
