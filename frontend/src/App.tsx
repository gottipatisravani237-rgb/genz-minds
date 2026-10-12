import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MedicineAlarmModal } from './components/reminders/MedicineAlarmModal';
import { LandingPage } from './pages/Landing/LandingPage';
import { LoginPage } from './pages/Login/LoginPage';
import { SignupPage } from './pages/Signup/SignupPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { DocumentsPage } from './pages/Documents/DocumentsPage';
import { PrescriptionScannerPage } from './pages/PrescriptionScanner/PrescriptionScannerPage';
import { ReportAnalyzerPage } from './pages/ReportAnalyzer/ReportAnalyzerPage';
import { AIAssistantPage } from './pages/AIAssistant/AIAssistantPage';
import { VoiceAssistantPage } from './pages/VoiceAssistant/VoiceAssistantPage';
import { MedicinesPage } from './pages/Medicines/MedicinesPage';
import { AdherencePage } from './pages/Adherence/AdherencePage';
import { DoctorsPage } from './pages/Doctors/DoctorsPage';
import { AppointmentsPage } from './pages/Appointments/AppointmentsPage';
import { HealthTimelinePage } from './pages/HealthTimeline/HealthTimelinePage';
import { NotificationsPage } from './pages/Notifications/NotificationsPage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { healthApi } from './services/healthApi';
import { playMedicalAlarmSound } from './utils/audioAlert';

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [authView, setAuthView] = useState<'landing' | 'login' | 'signup'>('landing');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState<any | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(1);
  const [initializing, setInitializing] = useState(true);

  // Check existing session
  useEffect(() => {
    const token = localStorage.getItem('medinova_token');
    if (token) {
      healthApi.getMe()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem('medinova_token');
          setUser(null);
        })
        .finally(() => {
          setInitializing(false);
        });
    } else {
      setInitializing(false);
    }
  }, []);

  const handleTriggerTestAlarm = () => {
    playMedicalAlarmSound();
    setActiveAlarm({
      id: `alarm-${Date.now()}`,
      medicineName: 'Metformin 500mg',
      dosage: '1 tablet (500mg)',
      scheduledTime: '09:00 AM',
      foodInstruction: 'after_food',
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('medinova_token');
    setUser(null);
    setAuthView('landing');
    setCurrentTab('dashboard');
  };

  // If not authenticated, render Landing or Login/Signup
  if (!user) {
    if (authView === 'landing') {
      return (
        <LandingPage
          onGetStarted={() => setAuthView('signup')}
          onLogin={() => setAuthView('login')}
        />
      );
    }

    return (
      <div className="min-h-screen bg-[#05090D] flex items-center justify-center p-4 selection:bg-[#00D084] selection:text-[#05090D]">
        {authView === 'login' ? (
          <LoginPage
            onSwitchToSignup={() => setAuthView('signup')}
            onLoginSuccess={(userData) => {
              setUser(userData);
              setCurrentTab('dashboard');
            }}
            onBackToLanding={() => setAuthView('landing')}
          />
        ) : (
          <SignupPage
            onSwitchToLogin={() => setAuthView('login')}
            onSignupComplete={(userData) => {
              setUser(userData);
              setCurrentTab('profile');
            }}
            onBackToLanding={() => setAuthView('landing')}
          />
        )}
      </div>
    );
  }

  // Render Authenticated Tab View
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardPage
            onNavigateTab={setCurrentTab}
            onTriggerTestAlarm={handleTriggerTestAlarm}
            user={user}
          />
        );
      case 'documents':
        return <DocumentsPage />;
      case 'prescription-scanner':
        return <PrescriptionScannerPage />;
      case 'report-analyzer':
        return <ReportAnalyzerPage />;
      case 'ai-assistant':
        return <AIAssistantPage />;
      case 'voice-assistant':
        return <VoiceAssistantPage />;
      case 'medicines':
        return <MedicinesPage />;
      case 'adherence':
        return <AdherencePage />;
      case 'doctors':
        return <DoctorsPage onNavigateTab={setCurrentTab} />;
      case 'appointments':
        return <AppointmentsPage onNavigateTab={setCurrentTab} />;
      case 'health-timeline':
        return <HealthTimelinePage />;
      case 'notifications':
        return <NotificationsPage onTriggerTestAlarm={handleTriggerTestAlarm} />;
      case 'profile':
        return (
          <ProfilePage
            user={user}
            onProfileUpdate={() => {
              healthApi.getMe().then(setUser);
            }}
          />
        );
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <DashboardPage
            onNavigateTab={setCurrentTab}
            onTriggerTestAlarm={handleTriggerTestAlarm}
            user={user}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#05090D] text-[#F4F7FA] flex selection:bg-[#00D084] selection:text-[#05090D]">
      {/* 1. Left Collapsible Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onNavigateTab={setCurrentTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onLogout={handleLogout}
        unreadCount={unreadNotifications}
      />

      {/* 2. Main Workspace Layout */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          userName={user.full_name || 'Patient'}
          onNavigateTab={setCurrentTab}
          onTriggerTestAlarm={handleTriggerTestAlarm}
          unreadCount={unreadNotifications}
        />

        {/* Content Route */}
        <main className="flex-1 pb-12">
          {renderTabContent()}
        </main>
      </div>

      {/* 3. Global Medicine Alarm Modal */}
      <MedicineAlarmModal
        activeAlarm={activeAlarm}
        onTaken={() => {
          setActiveAlarm(null);
        }}
        onSnooze={() => {
          setActiveAlarm(null);
        }}
        onSkip={() => {
          setActiveAlarm(null);
        }}
        onClose={() => {
          setActiveAlarm(null);
        }}
      />
    </div>
  );
}
