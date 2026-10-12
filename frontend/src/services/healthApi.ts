import { api } from './apiClient';

export interface User {
  id: string;
  email: string;
  full_name: string;
  profile?: any;
}

export interface MedicalDoc {
  id: string;
  original_filename: string;
  document_type: string;
  upload_timestamp: string;
  processing_status: string;
  file_size: number;
}

export interface PrescriptionMedicineItem {
  id?: string;
  medicine_name: string;
  generic_name?: string;
  strength?: string;
  dosage_form: string;
  dose: string;
  frequency: string;
  duration: string;
  food_instructions: string;
  scheduled_timing: string[];
  confidence: number;
  is_unclear?: boolean;
  is_confirmed?: boolean;
  clinical_notes?: string;
}

export interface Prescription {
  id: string;
  doctor_name?: string;
  clinic_name?: string;
  prescription_date?: string;
  is_verified: boolean;
  extraction_status: string;
  medicines: PrescriptionMedicineItem[];
  created_at: string;
}

export interface ReportAnalysis {
  id: string;
  document_id: string;
  report_type: string;
  report_date?: string;
  laboratory_name?: string;
  overall_summary: string;
  key_findings: any[];
  abnormal_findings: any[];
  questions_for_doctor: string[];
  plain_language_explanation?: string;
  historical_comparison?: any;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  citations: any[];
  is_grounded: boolean;
  timestamp: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experience_years: number;
  hospital_clinic: string;
  location: string;
  languages: string[];
  rating: number;
  consultation_fee: string;
  bio?: string;
  photo_url?: string;
  is_demo: boolean;
}

export interface Appointment {
  id: string;
  doctor_id: string;
  doctor_name?: string;
  doctor_specialty?: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  consultation_type: string;
  status: string;
  symptoms_notes?: string;
  booking_reference: string;
  meeting_link?: string;
}

export interface AdherenceStats {
  today_percentage: number;
  weekly_percentage: number;
  monthly_percentage: number;
  taken_count: number;
  skipped_count: number;
  missed_count: number;
  total_eligible: number;
  daily_history: any[];
}

export const healthApi = {
  // Auth
  login: (email: string, password: string) =>
    api.post<{ access_token: string; user: User }>('/auth/login', { email, password }),
  register: (email: string, password: string, full_name: string) =>
    api.post<{ access_token: string; user: User }>('/auth/register', { email, password, full_name }),
  getMe: () => api.get<User>('/auth/me'),
  updateProfile: (data: any) => api.put<any>('/auth/profile', data),

  // Documents
  uploadDocument: (file: File, documentType: string = 'lab_report') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    return api.post<MedicalDoc>('/documents/upload', formData);
  },
  getDocuments: () => api.get<MedicalDoc[]>('/documents/'),
  deleteDocument: (id: string) => api.delete<any>(`/documents/${id}`),

  // Prescriptions
  getPrescriptions: () => api.get<Prescription[]>('/prescriptions/'),
  getPrescription: (id: string) => api.get<Prescription>(`/prescriptions/${id}`),
  confirmPrescription: (prescription_id: string, medicines: PrescriptionMedicineItem[]) =>
    api.post<any>('/prescriptions/confirm', { prescription_id, medicines }),

  // Reports
  getReports: () => api.get<ReportAnalysis[]>('/reports/'),
  getReport: (id: string) => api.get<ReportAnalysis>(`/reports/${id}`),

  // AI & RAG
  chat: (message: string, conversation_id?: string, use_rag: boolean = true) =>
    api.post<ChatMessage>('/ai/chat', { message, conversation_id, use_rag }),
  getConversations: () => api.get<any[]>('/ai/conversations'),

  // Medicines
  getMedicines: () => api.get<any[]>('/medicines/'),
  createMedicine: (data: any) => api.post<any>('/medicines/', data),
  deleteMedicine: (id: string) => api.delete<any>(`/medicines/${id}`),

  // Adherence
  getAdherence: () => api.get<AdherenceStats>('/adherence/'),
  recordDose: (data: { medicine_id: string; scheduled_date: string; scheduled_time: string; status: string }) =>
    api.post<any>('/adherence/dose', data),

  // Doctors & Appointments
  getDoctors: (specialty?: string) =>
    api.get<Doctor[]>(specialty ? `/doctors/?specialty=${encodeURIComponent(specialty)}` : '/doctors/'),
  bookAppointment: (data: { doctor_id: string; appointment_date: string; start_time: string; consultation_type?: string; symptoms_notes?: string }) =>
    api.post<Appointment>('/doctors/appointments', data),
  getAppointments: () => api.get<Appointment[]>('/doctors/appointments'),
  cancelAppointment: (id: string) => api.delete<any>(`/doctors/appointments/${id}`),

  // Notifications
  getNotifications: () => api.get<any[]>('/notifications/'),
  testAlarm: () => api.post<any>('/notifications/test-alarm'),

  // Voice
  processVoice: (speech_text: string, language: string = 'en') =>
    api.post<any>('/voice/process', { speech_text, language }),
};
