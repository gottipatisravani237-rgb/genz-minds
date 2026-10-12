import {
  User,
  UserProfile,
  Medicine,
  Prescription,
  Reminder,
  ReminderLog,
  ChatMessage,
  AdherenceStats,
} from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'medinova_current_user',
  USERS: 'medinova_users',
  PROFILES: 'medinova_profiles',
  MEDICINES: 'medinova_medicines',
  PRESCRIPTIONS: 'medinova_prescriptions',
  REMINDERS: 'medinova_reminders',
  REMINDER_LOGS: 'medinova_reminder_logs',
  CHAT_MESSAGES: 'medinova_chat_messages',
  API_KEY: 'medinova_gemini_api_key',
};

// Seed initial realistic medical data for a premier first-time experience
export const seedDefaultData = (userId: string, userName: string) => {
  const today = new Date().toISOString().split('T')[0];

  const defaultProfile: UserProfile = {
    userId,
    fullName: userName || 'Alex Morgan',
    email: 'alex.morgan@medinova.ai',
    age: 32,
    gender: 'Male',
    phone: '+1 (555) 234-5678',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    allergies: ['Penicillin', 'Sulfa drugs'],
    existingConditions: ['Mild Asthma', 'Seasonal Allergies'],
    emergencyContact: {
      name: 'Sarah Morgan',
      relationship: 'Spouse',
      phone: '+1 (555) 987-6543',
    },
    completed: true,
    updatedAt: new Date().toISOString(),
  };

  const defaultMedicines: Medicine[] = [
    {
      id: 'med-1',
      userId,
      name: 'Paracetamol',
      genericName: 'Acetaminophen',
      dosage: '500 mg',
      frequency: 'Once daily',
      timeSlots: ['20:00'],
      foodInstruction: 'after_food',
      purpose: 'Pain relief & mild fever management',
      activeIngredients: ['Acetaminophen 500mg'],
      sideEffects: ['Nausea (rare)', 'Stomach ache if taken on empty stomach'],
      precautions: ['Do not exceed 4,000 mg in 24 hours', 'Avoid alcohol'],
      warnings: ['Severe liver damage risk if taken with excessive alcohol'],
      confidence: 98,
      startDate: today,
      source: 'manual',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'med-2',
      userId,
      name: 'Amoxicillin',
      genericName: 'Amoxicillin Trihydrate',
      dosage: '250 mg',
      frequency: 'Twice daily',
      timeSlots: ['08:00', '20:00'],
      foodInstruction: 'before_food',
      purpose: 'Bacterial respiratory infection course',
      activeIngredients: ['Amoxicillin 250mg'],
      sideEffects: ['Mild diarrhea', 'Skin rash'],
      precautions: ['Complete the full course even if feeling better', 'Check for penicillin allergy'],
      warnings: ['Discontinue immediately if allergic rash or swelling occurs'],
      confidence: 95,
      startDate: today,
      source: 'pres_scan',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'med-3',
      userId,
      name: 'Vitamin D3 & K2',
      genericName: 'Cholecalciferol + Menaquinone',
      dosage: '2000 IU',
      frequency: 'Once daily',
      timeSlots: ['09:00'],
      foodInstruction: 'with_food',
      purpose: 'Immune support & bone density optimization',
      activeIngredients: ['Vitamin D3 2000 IU', 'Vitamin K2 MK-7 100mcg'],
      sideEffects: ['None observed at recommended dosage'],
      precautions: ['Best absorbed with healthy dietary fats'],
      warnings: ['Do not take high doses without periodic serum tests'],
      confidence: 99,
      startDate: today,
      source: 'medi_scan',
      createdAt: new Date().toISOString(),
    },
  ];

  const defaultReminders: Reminder[] = [
    {
      id: 'rem-1',
      userId,
      medicineId: 'med-1',
      medicineName: 'Paracetamol',
      dosage: '500 mg',
      time: '20:00',
      frequency: 'Once daily',
      foodInstruction: 'after_food',
      isActive: true,
    },
    {
      id: 'rem-2',
      userId,
      medicineId: 'med-2',
      medicineName: 'Amoxicillin',
      dosage: '250 mg',
      time: '08:00',
      frequency: 'Twice daily',
      foodInstruction: 'before_food',
      isActive: true,
    },
    {
      id: 'rem-3',
      userId,
      medicineId: 'med-3',
      medicineName: 'Vitamin D3 & K2',
      dosage: '2000 IU',
      time: '09:00',
      frequency: 'Once daily',
      foodInstruction: 'with_food',
      isActive: true,
    },
  ];

  // Past logs to calculate realistic adherence (~92%)
  const defaultLogs: ReminderLog[] = [
    {
      id: 'log-1',
      reminderId: 'rem-2',
      medicineId: 'med-2',
      medicineName: 'Amoxicillin',
      dosage: '250 mg',
      scheduledDate: today,
      scheduledTime: '08:00',
      status: 'taken',
      actionTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      foodInstruction: 'before_food',
    },
    {
      id: 'log-2',
      reminderId: 'rem-3',
      medicineId: 'med-3',
      medicineName: 'Vitamin D3 & K2',
      dosage: '2000 IU',
      scheduledDate: today,
      scheduledTime: '09:00',
      status: 'taken',
      actionTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      foodInstruction: 'with_food',
    },
    {
      id: 'log-3',
      reminderId: 'rem-1',
      medicineId: 'med-1',
      medicineName: 'Paracetamol',
      dosage: '500 mg',
      scheduledDate: today,
      scheduledTime: '20:00',
      status: 'upcoming',
      foodInstruction: 'after_food',
    },
  ];

  // Add past 6 days history
  for (let i = 1; i <= 6; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // mostly taken, one occasional skip for realism
    defaultLogs.push({
      id: `past-log-${i}-1`,
      reminderId: 'rem-1',
      medicineId: 'med-1',
      medicineName: 'Paracetamol',
      dosage: '500 mg',
      scheduledDate: dateStr,
      scheduledTime: '20:00',
      status: i === 4 ? 'skipped' : 'taken',
      actionTimestamp: new Date(d.getTime() + 1000 * 60 * 60 * 20).toISOString(),
      foodInstruction: 'after_food',
    });
    defaultLogs.push({
      id: `past-log-${i}-2`,
      reminderId: 'rem-2',
      medicineId: 'med-2',
      medicineName: 'Amoxicillin',
      dosage: '250 mg',
      scheduledDate: dateStr,
      scheduledTime: '08:00',
      status: 'taken',
      actionTimestamp: new Date(d.getTime() + 1000 * 60 * 60 * 8).toISOString(),
      foodInstruction: 'before_food',
    });
  }

  const defaultMessages: ChatMessage[] = [
    {
      id: 'chat-welcome',
      sender: 'assistant',
      content: `Hello ${userName || 'Alex'}! I'm **MediNova AI**, your personal healthcare and medication companion.\n\nI have synchronized your active medications (Paracetamol 500mg, Amoxicillin 250mg, Vitamin D3). You can ask me what medicines to take, check your adherence, or understand any prescription or side effects anytime!`,
      timestamp: new Date().toISOString(),
      quickActions: [
        'What medicines do I take today?',
        'What should I take at 8 PM?',
        'Show my adherence',
        'Explain my medicines'
      ]
    }
  ];

  localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify({ [userId]: defaultProfile }));
  localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(defaultMedicines));
  localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(defaultReminders));
  localStorage.setItem(STORAGE_KEYS.REMINDER_LOGS, JSON.stringify(defaultLogs));
  localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(defaultMessages));
};

export const storageService = {
  // --- Auth & Users ---
  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveUser(user: User): void {
    const users = this.getUsers().filter(u => u.id !== user.id && u.email !== user.email);
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  // --- Profile ---
  getProfile(userId: string): UserProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
      if (!data) return null;
      const profiles = JSON.parse(data);
      return profiles[userId] || null;
    } catch {
      return null;
    }
  },

  saveProfile(profile: UserProfile): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILES);
      const profiles = data ? JSON.parse(data) : {};
      profiles[profile.userId] = profile;
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  // --- Medicines ---
  getMedicines(userId: string): Medicine[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEDICINES);
      if (!data) return [];
      const list: Medicine[] = JSON.parse(data);
      return list.filter(m => m.userId === userId);
    } catch {
      return [];
    }
  },

  saveMedicine(medicine: Medicine): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEDICINES);
      let list: Medicine[] = data ? JSON.parse(data) : [];
      const index = list.findIndex(m => m.id === medicine.id);
      if (index >= 0) {
        list[index] = medicine;
      } else {
        list.push(medicine);
      }
      localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save medicine', e);
    }
  },

  deleteMedicine(medicineId: string): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEDICINES);
      if (!data) return;
      const list: Medicine[] = JSON.parse(data);
      const filtered = list.filter(m => m.id !== medicineId);
      localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(filtered));

      // Also remove associated reminders
      const remData = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      if (remData) {
        const remList: Reminder[] = JSON.parse(remData);
        localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(remList.filter(r => r.medicineId !== medicineId)));
      }
    } catch (e) {
      console.error('Failed to delete medicine', e);
    }
  },

  // --- Prescriptions ---
  getPrescriptions(userId: string): Prescription[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS);
      if (!data) return [];
      const list: Prescription[] = JSON.parse(data);
      return list.filter(p => p.userId === userId);
    } catch {
      return [];
    }
  },

  savePrescription(prescription: Prescription): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS);
      let list: Prescription[] = data ? JSON.parse(data) : [];
      const index = list.findIndex(p => p.id === prescription.id);
      if (index >= 0) {
        list[index] = prescription;
      } else {
        list.unshift(prescription);
      }
      localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save prescription', e);
    }
  },

  // --- Reminders ---
  getReminders(userId: string): Reminder[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      if (!data) return [];
      const list: Reminder[] = JSON.parse(data);
      return list.filter(r => r.userId === userId);
    } catch {
      return [];
    }
  },

  saveReminder(reminder: Reminder): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      let list: Reminder[] = data ? JSON.parse(data) : [];
      const index = list.findIndex(r => r.id === reminder.id);
      if (index >= 0) {
        list[index] = reminder;
      } else {
        list.push(reminder);
      }
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save reminder', e);
    }
  },

  deleteReminder(reminderId: string): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      if (!data) return;
      const list: Reminder[] = JSON.parse(data);
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(list.filter(r => r.id !== reminderId)));
    } catch (e) {
      console.error('Failed to delete reminder', e);
    }
  },

  // --- Reminder / Adherence Logs ---
  getReminderLogs(userId: string): ReminderLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REMINDER_LOGS);
      if (!data) return [];
      const list: ReminderLog[] = JSON.parse(data);
      return list;
    } catch {
      return [];
    }
  },

  saveReminderLog(log: ReminderLog): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REMINDER_LOGS);
      let list: ReminderLog[] = data ? JSON.parse(data) : [];
      const index = list.findIndex(l => l.id === log.id);
      if (index >= 0) {
        list[index] = log;
      } else {
        list.unshift(log);
      }
      localStorage.setItem(STORAGE_KEYS.REMINDER_LOGS, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save reminder log', e);
    }
  },

  calculateAdherence(userId: string): AdherenceStats {
    const logs = this.getReminderLogs(userId);
    const today = new Date().toISOString().split('T')[0];

    const todayLogs = logs.filter(l => l.scheduledDate === today);
    const takenToday = todayLogs.filter(l => l.status === 'taken').length;
    const completedToday = todayLogs.filter(l => l.status === 'taken' || l.status === 'missed' || l.status === 'skipped').length;
    
    const todayPct = completedToday > 0 ? Math.round((takenToday / completedToday) * 100) : (todayLogs.length > 0 ? 100 : 92);

    // Past 7 days
    const past7Days = new Date();
    past7Days.setDate(past7Days.getDate() - 7);
    const past7Str = past7Days.toISOString().split('T')[0];

    const weekLogs = logs.filter(l => l.scheduledDate >= past7Str);
    const weekTaken = weekLogs.filter(l => l.status === 'taken').length;
    const weekMissed = weekLogs.filter(l => l.status === 'missed').length;
    const weekSkipped = weekLogs.filter(l => l.status === 'skipped').length;
    const weekFinished = weekTaken + weekMissed + weekSkipped;

    const weeklyPct = weekFinished > 0 ? Math.round((weekTaken / weekFinished) * 100) : 92;

    return {
      todayPercentage: todayPct,
      weeklyPercentage: weeklyPct,
      takenCount: weekTaken,
      missedCount: weekMissed,
      skippedCount: weekSkipped,
      totalScheduled: weekLogs.length,
    };
  },

  // --- Chat Messages ---
  getChatMessages(): ChatMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveChatMessage(message: ChatMessage): void {
    try {
      const messages = this.getChatMessages();
      messages.push(message);
      // keep last 50 messages
      if (messages.length > 50) messages.shift();
      localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save chat message', e);
    }
  },

  clearChatMessages(): void {
    localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
  },

  // --- API Key Management ---
  getApiKey(): string {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (envKey && envKey.trim().length > 0) return envKey.trim();
    return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
  },

  saveApiKey(key: string): void {
    if (key) {
      localStorage.setItem(STORAGE_KEYS.API_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEYS.API_KEY);
    }
  }
};
