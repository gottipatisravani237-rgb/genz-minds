export type FoodInstruction = 'before_food' | 'after_food' | 'with_food' | 'anytime';

export type ReminderStatus = 'upcoming' | 'taken' | 'snoozed' | 'missed' | 'skipped';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  createdAt: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  age: number | string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say' | string;
  phone: string;
  photoUrl?: string;
  allergies: string[];
  existingConditions: string[];
  emergencyContact: EmergencyContact;
  completed: boolean;
  updatedAt: string;
}

export interface Medicine {
  id: string;
  userId: string;
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  timeSlots: string[];
  foodInstruction: FoodInstruction;
  purpose: string;
  activeIngredients: string[];
  sideEffects: string[];
  precautions: string[];
  warnings: string[];
  imageUrl?: string;
  confidence?: number;
  startDate: string;
  endDate?: string;
  source: 'manual' | 'medi_scan' | 'pres_scan';
  createdAt: string;
}

export interface PrescriptionItem {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  food: string;
  confidence: number;
  isUnclear?: boolean;
}

export interface Prescription {
  id: string;
  userId: string;
  doctorName?: string;
  clinicName?: string;
  date: string;
  imageUrl?: string;
  rawText?: string;
  items: PrescriptionItem[];
  verified: boolean;
  createdAt: string;
}

export interface Reminder {
  id: string;
  userId: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  time: string; // HH:mm format, e.g. "08:00" or "20:00"
  frequency: string;
  foodInstruction: FoodInstruction;
  isActive: boolean;
}

export interface ReminderLog {
  id: string;
  reminderId: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  status: ReminderStatus;
  actionTimestamp?: string;
  foodInstruction: FoodInstruction;
  snoozeUntil?: string; // ISO string
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  quickActions?: string[];
  isThinking?: boolean;
}

export interface MedicineAnalysisResult {
  success: boolean;
  isUnidentified?: boolean;
  medicineName?: string;
  genericName?: string;
  activeIngredients?: string[];
  commonUses?: string[];
  commonSideEffects?: string[];
  precautions?: string[];
  warnings?: string[];
  dosageForm?: string;
  standardStrength?: string;
  confidence?: number;
  unidentifiedMessage?: string;
  rawResponse?: string;
}

export interface PrescriptionAnalysisResult {
  success: boolean;
  doctorName?: string;
  clinicName?: string;
  date?: string;
  extractedItems: PrescriptionItem[];
  hasUnclearHandwriting?: boolean;
  unclearNotes?: string;
}

export interface AdherenceStats {
  todayPercentage: number;
  weeklyPercentage: number;
  takenCount: number;
  missedCount: number;
  skippedCount: number;
  totalScheduled: number;
}
