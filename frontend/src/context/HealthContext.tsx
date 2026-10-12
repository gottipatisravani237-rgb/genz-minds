import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  UserProfile,
  Medicine,
  Prescription,
  PrescriptionItem,
  Reminder,
  ReminderLog,
  ChatMessage,
  AdherenceStats,
  FoodInstruction,
} from '../types';
import { storageService, seedDefaultData } from '../services/storageService';
import { chatbotService } from '../services/chatbotService';
import { playMedicalAlarmSound } from '../utils/audioAlert';

interface HealthContextType {
  user: User | null;
  profile: UserProfile | null;
  medicines: Medicine[];
  prescriptions: Prescription[];
  reminders: Reminder[];
  reminderLogs: ReminderLog[];
  adherence: AdherenceStats;
  chatMessages: ChatMessage[];
  isChatOpen: boolean;
  activeAlarm: ReminderLog | null;
  apiKey: string;
  isAiThinking: boolean;
  // Auth
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  // Profile
  updateProfile: (profile: Partial<UserProfile>) => void;
  // Medicine CRUD
  addMedicine: (medicine: Omit<Medicine, 'id' | 'userId' | 'createdAt'>) => Medicine;
  updateMedicine: (medicine: Medicine) => void;
  deleteMedicine: (medicineId: string) => void;
  // Prescription
  addPrescription: (prescription: Omit<Prescription, 'id' | 'userId' | 'createdAt'>) => Prescription;
  verifyAndAddPrescriptionItems: (prescription: Prescription, verifiedItems: PrescriptionItem[]) => void;
  // Reminders
  addReminder: (reminder: Omit<Reminder, 'id' | 'userId'>) => Reminder;
  deleteReminder: (reminderId: string) => void;
  // Alarm
  triggerTestAlarm: (specificReminderId?: string) => void;
  handleAlarmAction: (logId: string, action: 'taken' | 'snooze' | 'skip') => void;
  closeAlarm: () => void;
  // Chat
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
  setIsChatOpen: (open: boolean) => void;
  // API key
  setApiKey: (key: string) => void;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => storageService.getCurrentUser());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>([]);
  const [adherence, setAdherence] = useState<AdherenceStats>({
    todayPercentage: 92,
    weeklyPercentage: 92,
    takenCount: 8,
    missedCount: 0,
    skippedCount: 1,
    totalScheduled: 9,
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => storageService.getChatMessages());
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState<ReminderLog | null>(null);
  const [apiKey, setApiKeyState] = useState<string>(() => storageService.getApiKey());

  // Reload user state when user changes
  const loadUserData = useCallback((currentUser: User) => {
    let p = storageService.getProfile(currentUser.id);
    if (!p) {
      seedDefaultData(currentUser.id, currentUser.name);
      p = storageService.getProfile(currentUser.id);
    }
    setProfile(p);
    setMedicines(storageService.getMedicines(currentUser.id));
    setPrescriptions(storageService.getPrescriptions(currentUser.id));
    setReminders(storageService.getReminders(currentUser.id));
    setReminderLogs(storageService.getReminderLogs(currentUser.id));
    setAdherence(storageService.calculateAdherence(currentUser.id));
    setChatMessages(storageService.getChatMessages());
  }, []);

  useEffect(() => {
    if (user) {
      loadUserData(user);
    } else {
      setProfile(null);
      setMedicines([]);
      setPrescriptions([]);
      setReminders([]);
      setReminderLogs([]);
    }
  }, [user, loadUserData]);

  // Auth: Login
  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const users = storageService.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!existing) {
      return { success: false, error: 'No account found with this email. Please sign up.' };
    }
    if (existing.password && existing.password !== pass) {
      return { success: false, error: 'Invalid password. Please check and try again.' };
    }

    storageService.setCurrentUser(existing);
    setUser(existing);
    loadUserData(existing);
    return { success: true };
  };

  // Auth: Signup
  const signup = async (name: string, email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const users = storageService.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: pass,
      createdAt: new Date().toISOString(),
    };

    storageService.saveUser(newUser);
    storageService.setCurrentUser(newUser);
    seedDefaultData(newUser.id, newUser.name);
    setUser(newUser);
    loadUserData(newUser);
    return { success: true };
  };

  const logout = () => {
    storageService.setCurrentUser(null);
    setUser(null);
    setActiveAlarm(null);
  };

  // Profile
  const updateProfile = (profileData: Partial<UserProfile>) => {
    if (!user || !profile) return;
    const updated: UserProfile = {
      ...profile,
      ...profileData,
      updatedAt: new Date().toISOString(),
    };
    storageService.saveProfile(updated);
    setProfile(updated);
  };

  // Medicines
  const addMedicine = (medData: Omit<Medicine, 'id' | 'userId' | 'createdAt'>): Medicine => {
    if (!user) throw new Error('Not authenticated');
    const newMed: Medicine = {
      ...medData,
      id: `med-${Date.now()}`,
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    storageService.saveMedicine(newMed);
    const updatedList = storageService.getMedicines(user.id);
    setMedicines(updatedList);

    // Auto-create reminder if timeSlots exist
    medData.timeSlots?.forEach((t, idx) => {
      const newRem: Reminder = {
        id: `rem-${newMed.id}-${idx}`,
        userId: user.id,
        medicineId: newMed.id,
        medicineName: newMed.name,
        dosage: newMed.dosage,
        time: t,
        frequency: newMed.frequency,
        foodInstruction: newMed.foodInstruction,
        isActive: true,
      };
      storageService.saveReminder(newRem);
    });

    setReminders(storageService.getReminders(user.id));
    return newMed;
  };

  const updateMedicine = (medicine: Medicine) => {
    if (!user) return;
    storageService.saveMedicine(medicine);
    setMedicines(storageService.getMedicines(user.id));
  };

  const deleteMedicine = (medicineId: string) => {
    if (!user) return;
    storageService.deleteMedicine(medicineId);
    setMedicines(storageService.getMedicines(user.id));
    setReminders(storageService.getReminders(user.id));
  };

  // Prescriptions
  const addPrescription = (prescData: Omit<Prescription, 'id' | 'userId' | 'createdAt'>): Prescription => {
    if (!user) throw new Error('Not authenticated');
    const newPresc: Prescription = {
      ...prescData,
      id: `presc-${Date.now()}`,
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    storageService.savePrescription(newPresc);
    setPrescriptions(storageService.getPrescriptions(user.id));
    return newPresc;
  };

  const verifyAndAddPrescriptionItems = (prescription: Prescription, verifiedItems: PrescriptionItem[]) => {
    if (!user) return;
    // Update prescription as verified
    const updatedPresc: Prescription = {
      ...prescription,
      items: verifiedItems,
      verified: true,
    };
    storageService.savePrescription(updatedPresc);
    setPrescriptions(storageService.getPrescriptions(user.id));

    // Add each verified medicine that is readable
    verifiedItems.forEach((item) => {
      if (item.isUnclear || item.medicine.includes('could not be read')) return;

      const foodNorm: FoodInstruction = item.food.toLowerCase().includes('before')
        ? 'before_food'
        : item.food.toLowerCase().includes('with')
        ? 'with_food'
        : item.food.toLowerCase().includes('after')
        ? 'after_food'
        : 'anytime';

      addMedicine({
        name: item.medicine,
        genericName: item.medicine,
        dosage: item.dosage,
        frequency: item.frequency,
        timeSlots: ['08:00', '20:00'],
        foodInstruction: foodNorm,
        purpose: `Prescribed by ${prescription.doctorName || 'Physician'} for ${item.duration || 'treatment'}`,
        activeIngredients: [item.medicine],
        sideEffects: ['Follow physician guidance'],
        precautions: ['Verify with pharmacist if you experience allergies'],
        warnings: ['Do not exceed prescribed duration'],
        startDate: new Date().toISOString().split('T')[0],
        source: 'pres_scan',
        confidence: item.confidence,
      });
    });
  };

  // Reminders
  const addReminder = (remData: Omit<Reminder, 'id' | 'userId'>): Reminder => {
    if (!user) throw new Error('Not authenticated');
    const newRem: Reminder = {
      ...remData,
      id: `rem-${Date.now()}`,
      userId: user.id,
    };
    storageService.saveReminder(newRem);
    setReminders(storageService.getReminders(user.id));
    return newRem;
  };

  const deleteReminder = (reminderId: string) => {
    if (!user) return;
    storageService.deleteReminder(reminderId);
    setReminders(storageService.getReminders(user.id));
  };

  // Alarm management
  const triggerTestAlarm = (specificReminderId?: string) => {
    if (!user) return;
    const targetRem = (specificReminderId && reminders.find(r => r.id === specificReminderId)) ||
      reminders[0] || {
        id: 'test-rem-alarm',
        userId: user.id,
        medicineId: 'med-1',
        medicineName: 'Paracetamol',
        dosage: '500 mg',
        time: '20:00',
        frequency: 'Once daily',
        foodInstruction: 'after_food',
        isActive: true,
      };

    const newLog: ReminderLog = {
      id: `alarm-active-${Date.now()}`,
      reminderId: targetRem.id,
      medicineId: targetRem.medicineId,
      medicineName: targetRem.medicineName,
      dosage: targetRem.dosage,
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: targetRem.time,
      status: 'upcoming',
      foodInstruction: targetRem.foodInstruction,
    };

    playMedicalAlarmSound();
    setActiveAlarm(newLog);
  };

  const handleAlarmAction = (logId: string, action: 'taken' | 'snooze' | 'skip') => {
    if (!user || !activeAlarm) return;

    const today = new Date().toISOString().split('T')[0];
    let updatedLog: ReminderLog = { ...activeAlarm };

    if (action === 'taken') {
      updatedLog = {
        ...activeAlarm,
        status: 'taken',
        actionTimestamp: new Date().toISOString(),
      };
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#14b8a6', '#06b6d4'],
      });
    } else if (action === 'snooze') {
      const snoozeTime = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      updatedLog = {
        ...activeAlarm,
        status: 'snoozed',
        snoozeUntil: snoozeTime,
      };
    } else if (action === 'skip') {
      updatedLog = {
        ...activeAlarm,
        status: 'skipped',
        actionTimestamp: new Date().toISOString(),
      };
    }

    storageService.saveReminderLog(updatedLog);
    const updatedLogs = storageService.getReminderLogs(user.id);
    setReminderLogs(updatedLogs);
    setAdherence(storageService.calculateAdherence(user.id));
    setActiveAlarm(null);
  };

  const closeAlarm = () => {
    setActiveAlarm(null);
  };

  // Real-time scheduler check: checks every 20 seconds for scheduled dose
  useEffect(() => {
    if (!user || activeAlarm) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentH = now.getHours().toString().padStart(2, '0');
      const currentM = now.getMinutes().toString().padStart(2, '0');
      const timeStr = `${currentH}:${currentM}`;
      const todayStr = now.toISOString().split('T')[0];

      // Match reminder
      const matching = reminders.find(r => r.time === timeStr && r.isActive);
      if (matching) {
        const alreadyLogged = reminderLogs.find(
          l => l.reminderId === matching.id && l.scheduledDate === todayStr && (l.status === 'taken' || l.status === 'skipped')
        );

        if (!alreadyLogged) {
          triggerTestAlarm(matching.id);
        }
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [user, reminders, reminderLogs, activeAlarm]);

  // Chatbot
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    storageService.saveChatMessage(userMsg);
    setIsAiThinking(true);

    try {
      const reply = await chatbotService.processQuery(text, {
        profile,
        medicines,
        reminders,
        logs: reminderLogs,
        adherence,
      });

      const assistantMsg: ChatMessage = {
        id: `msg-resp-${Date.now()}`,
        sender: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
        quickActions: [
          'What medicines do I take today?',
          'What should I take at 8 PM?',
          'Show my adherence',
          'What medicine is next?',
        ],
      };

      setChatMessages(prev => [...prev, assistantMsg]);
      storageService.saveChatMessage(assistantMsg);
    } catch (e) {
      console.error('Chat processing error:', e);
    } finally {
      setIsAiThinking(false);
    }
  };

  const clearChat = () => {
    storageService.clearChatMessages();
    setChatMessages([]);
  };

  const setApiKey = (key: string) => {
    storageService.saveApiKey(key);
    setApiKeyState(key);
  };

  return (
    <HealthContext.Provider
      value={{
        user,
        profile,
        medicines,
        prescriptions,
        reminders,
        reminderLogs,
        adherence,
        chatMessages,
        isChatOpen,
        activeAlarm,
        apiKey,
        isAiThinking,
        login,
        signup,
        logout,
        updateProfile,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        addPrescription,
        verifyAndAddPrescriptionItems,
        addReminder,
        deleteReminder,
        triggerTestAlarm,
        handleAlarmAction,
        closeAlarm,
        sendMessage,
        clearChat,
        setIsChatOpen,
        setApiKey,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
};
